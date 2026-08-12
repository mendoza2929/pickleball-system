import pool from "../../../config/database";

import {
  CreateCourtAllocationInput,
  UpdateCourtAllocationInput,
} from "./courtAllocation.validator";

export class CourtAllocationRepository {
  // ==================================================
  // GET ALL ALLOCATIONS
  // ==================================================

  async findAllByCompetition(
    competitionId: number
  ) {
    const [rows]: any =
      await pool.query(
        `
        SELECT
          cca.id,
          cca.competition_id,
          cca.competition_division_id,
          cca.court_id,
          cca.allocation_date,
          cca.start_time,
          cca.end_time,
          cca.allocation_type,
          cca.status,
          cca.created_at,
          cca.updated_at,

          c.court_number,
          c.name AS court_name,
          c.status AS court_status

        FROM competition_court_allocations cca

        INNER JOIN courts c
          ON c.id = cca.court_id

        WHERE cca.competition_id = ?

        ORDER BY
          cca.allocation_date ASC,
          cca.start_time ASC,
          c.court_number ASC
        `,
        [competitionId]
      );

    return rows;
  }

  // ==================================================
  // GET AVAILABLE COURTS
  // ==================================================

  async findAvailableCourts(
    competitionId: number,
    allocationDate: string,
    startTime: string,
    endTime: string
  ) {
    /*
     * competitionId is intentionally accepted here
     * so the availability request belongs to the
     * current competition.
     *
     * The actual court availability is determined by:
     *
     * 1. Court is Available
     * 2. Court is not deleted
     * 3. Court has an open schedule on this weekday
     * 4. Court has no existing competition allocation
     *    overlapping this period
     */

    void competitionId;

    const [rows]: any =
      await pool.query(
        `
        SELECT
          c.id,
          c.court_number,
          c.name,
          c.status,
          c.is_deleted

        FROM courts c

        WHERE c.status = 'Available'

          AND c.is_deleted = 0

          AND EXISTS (
            SELECT 1

            FROM court_schedules cs

            WHERE cs.court_id = c.id

              AND cs.day_of_week =
                DAYNAME(?)

              AND cs.is_closed = 0

              AND cs.open_time <= ?

              AND cs.close_time >= ?
          )

          AND NOT EXISTS (
            SELECT 1

            FROM competition_court_allocations cca

            WHERE cca.court_id = c.id

              AND cca.allocation_date = ?

              AND cca.status = 'reserved'

              AND cca.start_time < ?

              AND cca.end_time > ?
          )

        ORDER BY
          c.court_number ASC
        `,
        [
          allocationDate,
          startTime,
          endTime,

          allocationDate,
          endTime,
          startTime,
        ]
      );

    return rows;
  }

  // ==================================================
  // GET BY ID
  // ==================================================

  async findById(
    id: number
  ) {
    const [rows]: any =
      await pool.query(
        `
        SELECT
          cca.id,
          cca.competition_id,
          cca.competition_division_id,
          cca.court_id,
          cca.allocation_date,
          cca.start_time,
          cca.end_time,
          cca.allocation_type,
          cca.status,
          cca.created_at,
          cca.updated_at,

          c.court_number,
          c.name AS court_name,
          c.status AS court_status

        FROM competition_court_allocations cca

        INNER JOIN courts c
          ON c.id = cca.court_id

        WHERE cca.id = ?

        LIMIT 1
        `,
        [id]
      );

    return rows[0] ?? null;
  }

  // ==================================================
  // GET COURT
  // ==================================================

  async findCourtById(
    courtId: number
  ) {
    const [rows]: any =
      await pool.query(
        `
        SELECT
          id,
          court_number,
          name,
          status,
          is_deleted

        FROM courts

        WHERE id = ?

        LIMIT 1
        `,
        [courtId]
      );

    return rows[0] ?? null;
  }

  // ==================================================
  // CHECK COURT ALLOCATION CONFLICT
  // ==================================================

  async findConflict(
    courtId: number,
    allocationDate: string,
    startTime: string,
    endTime: string,
    excludeId?: number
  ) {
    let sql = `
      SELECT
        id,
        competition_id,
        competition_division_id,
        court_id,
        allocation_date,
        start_time,
        end_time,
        allocation_type,
        status

      FROM competition_court_allocations

      WHERE court_id = ?

        AND allocation_date = ?

        AND status = 'reserved'

        AND start_time < ?

        AND end_time > ?
    `;

    const params: any[] = [
      courtId,
      allocationDate,
      endTime,
      startTime,
    ];

    if (
      excludeId !== undefined
    ) {
      sql += `
        AND id != ?
      `;

      params.push(
        excludeId
      );
    }

    sql += `
      LIMIT 1
    `;

    const [rows]: any =
      await pool.query(
        sql,
        params
      );

    return rows[0] ?? null;
  }

  // ==================================================
  // CREATE
  // ==================================================

  async create(
    data: CreateCourtAllocationInput
  ) {
    const [result]: any =
      await pool.query(
        `
        INSERT INTO competition_court_allocations (
          competition_id,
          competition_division_id,
          court_id,
          allocation_date,
          start_time,
          end_time,
          allocation_type,
          status
        )

        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          'reserved'
        )
        `,
        [
          data.competition_id,

          data.competition_division_id ??
            null,

          data.court_id,

          data.allocation_date,

          data.start_time,

          data.end_time,

          data.allocation_type,
        ]
      );

    return this.findById(
      result.insertId
    );
  }

  // ==================================================
  // UPDATE
  // ==================================================

  async update(
    id: number,
    data: UpdateCourtAllocationInput
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (
      data.start_time !==
      undefined
    ) {
      fields.push(
        "start_time = ?"
      );

      values.push(
        data.start_time
      );
    }

    if (
      data.end_time !==
      undefined
    ) {
      fields.push(
        "end_time = ?"
      );

      values.push(
        data.end_time
      );
    }

    if (
      data.status !==
      undefined
    ) {
      fields.push(
        "status = ?"
      );

      values.push(
        data.status
      );
    }

    if (
      fields.length === 0
    ) {
      return this.findById(
        id
      );
    }

    fields.push(
      "updated_at = NOW()"
    );

    values.push(
      id
    );

    await pool.query(
      `
      UPDATE competition_court_allocations

      SET
        ${fields.join(", ")}

      WHERE id = ?
      `,
      values
    );

    return this.findById(
      id
    );
  }

  // ==================================================
  // RELEASE
  // ==================================================

  async release(
    id: number
  ) {
    await pool.query(
      `
      UPDATE competition_court_allocations

      SET
        status = 'released',
        updated_at = NOW()

      WHERE id = ?
      `,
      [id]
    );

    return this.findById(
      id
    );
  }
}