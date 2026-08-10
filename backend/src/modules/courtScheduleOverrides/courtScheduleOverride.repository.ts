import { randomUUID } from "crypto";
import pool from "../../config/database";

export class CourtScheduleOverrideRepository {
  // ============================================================
  // CREATE
  // ============================================================

  async create(data: {
    court_id: number | null;
    schedule_date: string;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
    reason: string | null;
  }) {
    const uuid = randomUUID();

    const [result]: any = await pool.query(
      `
      INSERT INTO court_schedule_overrides (
        uuid,
        court_id,
        schedule_date,
        open_time,
        close_time,
        is_closed,
        reason
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        uuid,
        data.court_id,
        data.schedule_date,
        data.open_time,
        data.close_time,
        data.is_closed,
        data.reason,
      ]
    );

    return this.findById(result.insertId);
  }

  // ============================================================
  // FIND BY ID
  // ============================================================

  async findById(id: number) {
    const [rows]: any = await pool.query(
      `
      SELECT
        cso.id,
        cso.uuid,
        cso.court_id,
        c.name AS court_name,
        cso.schedule_date,
        cso.open_time,
        cso.close_time,
        cso.is_closed,
        cso.reason,
        cso.created_at,
        cso.updated_at
      FROM court_schedule_overrides cso
      LEFT JOIN courts c
        ON c.id = cso.court_id
      WHERE cso.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] ?? null;
  }

  // ============================================================
  // FIND ALL OVERRIDES FOR A COURT
  // ============================================================

  async findByCourt(courtId: number) {
    const [rows]: any = await pool.query(
      `
      SELECT
        cso.id,
        cso.uuid,
        cso.court_id,
        c.name AS court_name,
        cso.schedule_date,
        cso.open_time,
        cso.close_time,
        cso.is_closed,
        cso.reason,
        cso.created_at,
        cso.updated_at
      FROM court_schedule_overrides cso
      INNER JOIN courts c
        ON c.id = cso.court_id
      WHERE cso.court_id = ?
      ORDER BY cso.schedule_date ASC
      `,
      [courtId]
    );

    return rows;
  }

  // ============================================================
  // FIND BY DATE
  // ============================================================
  //
  // Returns:
  //
  // 1. Court-specific override
  // 2. Global override (court_id IS NULL)
  //
  // This will be useful later for AvailabilityService.
  // ============================================================

  async findByCourtAndDate(
    courtId: number,
    scheduleDate: string
  ) {
    const [rows]: any = await pool.query(
      `
      SELECT
        cso.id,
        cso.uuid,
        cso.court_id,
        c.name AS court_name,
        cso.schedule_date,
        cso.open_time,
        cso.close_time,
        cso.is_closed,
        cso.reason,
        cso.created_at,
        cso.updated_at
      FROM court_schedule_overrides cso
      LEFT JOIN courts c
        ON c.id = cso.court_id
      WHERE cso.schedule_date = ?
        AND (
          cso.court_id = ?
          OR cso.court_id IS NULL
        )
      ORDER BY
        CASE
          WHEN cso.court_id = ? THEN 1
          WHEN cso.court_id IS NULL THEN 2
          ELSE 3
        END
      LIMIT 1
      `,
      [
        scheduleDate,
        courtId,
        courtId,
      ]
    );

    return rows[0] ?? null;
  }

  // ============================================================
  // FIND EXISTING OVERRIDE
  // ============================================================
  //
  // Used to prevent duplicate overrides.
  //
  // court_id = 1
  // date = 2026-08-15
  //
  // means Court 1 can only have ONE override
  // for that date.
  //
  // court_id = NULL
  // date = 2026-08-15
  //
  // means there should only be ONE global override
  // for that date.
  // ============================================================

  async findExistingOverride(
    courtId: number | null,
    scheduleDate: string,
    excludeId?: number
  ) {
    let query = `
      SELECT
        id,
        uuid,
        court_id,
        schedule_date
      FROM court_schedule_overrides
      WHERE schedule_date = ?
    `;

    const params: any[] = [scheduleDate];

    // ==========================================================
    // SPECIFIC COURT
    // ==========================================================

    if (courtId !== null) {
      query += `
        AND court_id = ?
      `;

      params.push(courtId);
    }

    // ==========================================================
    // GLOBAL OVERRIDE
    // ==========================================================

    else {
      query += `
        AND court_id IS NULL
      `;
    }

    // ==========================================================
    // EXCLUDE CURRENT RECORD DURING UPDATE
    // ==========================================================

    if (excludeId !== undefined) {
      query += `
        AND id != ?
      `;

      params.push(excludeId);
    }

    query += `
      LIMIT 1
    `;

    const [rows]: any = await pool.query(
      query,
      params
    );

    return rows[0] ?? null;
  }

  // ============================================================
  // UPDATE
  // ============================================================

  async update(
    id: number,
    data: {
      court_id: number | null;
      schedule_date: string;
      open_time: string | null;
      close_time: string | null;
      is_closed: boolean;
      reason: string | null;
    }
  ) {
    await pool.query(
      `
      UPDATE court_schedule_overrides
      SET
        court_id = ?,
        schedule_date = ?,
        open_time = ?,
        close_time = ?,
        is_closed = ?,
        reason = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        data.court_id,
        data.schedule_date,
        data.open_time,
        data.close_time,
        data.is_closed,
        data.reason,
        id,
      ]
    );

    return this.findById(id);
  }

  // ============================================================
  // DELETE
  // ============================================================

  async delete(id: number) {
    await pool.query(
      `
      DELETE FROM court_schedule_overrides
      WHERE id = ?
      `,
      [id]
    );
  }

  // ============================================================
    // FIND ALL HOLIDAYS
    // ============================================================

    async findHolidays() {
      const [rows]: any = await pool.query(
        `
        SELECT
          cso.id,
          cso.uuid,
          cso.schedule_date,
          cso.reason,
          cso.created_at,
          cso.updated_at
        FROM court_schedule_overrides cso
        WHERE cso.court_id IS NULL
          AND cso.is_closed = 1
        ORDER BY cso.schedule_date ASC
        `
      );

      return rows;
    }

      // ============================================================
  // FIND HOLIDAY
  // ============================================================

  async findHolidayById(id: number) {
    const [rows]: any = await pool.query(
      `
      SELECT
        id,
        uuid,
        court_id,
        schedule_date,
        open_time,
        close_time,
        is_closed,
        reason,
        created_at,
        updated_at
      FROM court_schedule_overrides
      WHERE id = ?
        AND court_id IS NULL
        AND is_closed = 1
      LIMIT 1
      `,
      [id]
    );

    return rows[0] ?? null;
  }
}