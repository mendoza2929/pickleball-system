import { randomUUID } from "crypto";

import pool from "../../config/database";

export class CourtScheduleRepository {
  /**
   * =====================================================
   * CREATE
   * =====================================================
   */
  async create(data: {
    court_id: number;
    day_of_week: string;
    open_time: string;
    close_time: string;
    is_closed: boolean;
  }) {
    const uuid = randomUUID();

    const [result]: any = await pool.query(
      `
      INSERT INTO court_schedules (
        uuid,
        court_id,
        day_of_week,
        open_time,
        close_time,
        is_closed
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        uuid,
        data.court_id,
        data.day_of_week,
        data.open_time,
        data.close_time,
        data.is_closed,
      ]
    );

    return this.findById(result.insertId);
  }

  /**
   * =====================================================
   * FIND BY ID
   * =====================================================
   */
  async findById(id: number) {
    const [rows]: any = await pool.query(
      `
      SELECT
        cs.id,
        cs.uuid,
        cs.court_id,
        c.name AS court_name,
        cs.day_of_week,
        cs.open_time,
        cs.close_time,
        cs.is_closed,
        cs.created_at,
        cs.updated_at
      FROM court_schedules cs
      INNER JOIN courts c
        ON c.id = cs.court_id
      WHERE cs.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] ?? null;
  }

  /**
   * =====================================================
   * FIND ALL SCHEDULES FOR COURT
   * =====================================================
   *
   * This is the method used by the existing service.
   */
  async findByCourt(courtId: number) {
    const [rows]: any = await pool.query(
      `
      SELECT
        cs.id,
        cs.uuid,
        cs.court_id,
        c.name AS court_name,
        cs.day_of_week,
        cs.open_time,
        cs.close_time,
        cs.is_closed,
        cs.created_at,
        cs.updated_at
      FROM court_schedules cs
      INNER JOIN courts c
        ON c.id = cs.court_id
      WHERE cs.court_id = ?
      ORDER BY
        FIELD(
          cs.day_of_week,
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        )
      `,
      [courtId]
    );

    return rows;
  }

  /**
   * =====================================================
   * FIND BY COURT ID
   * =====================================================
   *
   * Alias for compatibility with other code.
   */
  async findByCourtId(courtId: number) {
    return this.findByCourt(courtId);
  }

  /**
   * =====================================================
   * FIND BY COURT AND DAY
   * =====================================================
   *
   * Used by reservation availability.
   *
   * Example:
   *
   * court_id = 7
   * day = "Friday"
   *
   * Returns Friday schedule.
   */
  async findByCourtAndDay(
    courtId: number,
    dayOfWeek: string
  ) {
    const [rows]: any = await pool.query(
      `
      SELECT
        cs.id,
        cs.uuid,
        cs.court_id,
        c.name AS court_name,
        cs.day_of_week,
        cs.open_time,
        cs.close_time,
        cs.is_closed,
        cs.created_at,
        cs.updated_at
      FROM court_schedules cs
      INNER JOIN courts c
        ON c.id = cs.court_id
      WHERE cs.court_id = ?
        AND cs.day_of_week = ?
      LIMIT 1
      `,
      [
        courtId,
        dayOfWeek,
      ]
    );

    return rows[0] ?? null;
  }

  /**
   * =====================================================
   * CHECK DUPLICATE DAY
   * =====================================================
   *
   * Prevents a court from having two schedules
   * for the same day.
   */
  async findByCourtAndDayForUpdate(
    courtId: number,
    dayOfWeek: string,
    id: number
  ) {
    const [rows]: any = await pool.query(
      `
      SELECT
        id
      FROM court_schedules
      WHERE court_id = ?
        AND day_of_week = ?
        AND id != ?
      LIMIT 1
      `,
      [
        courtId,
        dayOfWeek,
        id,
      ]
    );

    return rows[0] ?? null;
  }

  /**
   * =====================================================
   * UPDATE
   * =====================================================
   *
   * IMPORTANT:
   *
   * When the day is CLOSED:
   *
   *     open_time  = existing open_time
   *     close_time = existing close_time
   *     is_closed  = true
   *
   * We NEVER save NULL into open_time/close_time.
   *
   * This fixes:
   *
   * ER_BAD_NULL_ERROR
   * Column 'open_time' cannot be null
   */
  async update(
    id: number,
    data: {
      day_of_week: string;
      open_time: string | null;
      close_time: string | null;
      is_closed: boolean;
    }
  ) {
    /**
     * ===================================================
     * GET CURRENT SCHEDULE
     * ===================================================
     */
    const [existingRows]: any =
      await pool.query(
        `
        SELECT
          id,
          court_id,
          day_of_week,
          open_time,
          close_time,
          is_closed
        FROM court_schedules
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    if (!existingRows.length) {
      throw new Error(
        "COURT_SCHEDULE_NOT_FOUND"
      );
    }

    const existing =
      existingRows[0];

    /**
     * ===================================================
     * DETERMINE OPEN/CLOSE TIME
     * ===================================================
     *
     * If CLOSED:
     *
     * Keep the old schedule.
     *
     * If OPEN:
     *
     * Use the values sent by frontend.
     */
    let openTime: string | null;
    let closeTime: string | null;

    if (data.is_closed) {
      openTime =
        existing.open_time;

      closeTime =
        existing.close_time;
    } else {
      openTime =
        data.open_time;

      closeTime =
        data.close_time;
    }

    /**
     * ===================================================
     * VALIDATE TIME VALUES
     * ===================================================
     */
    if (!openTime || !closeTime) {
      throw new Error(
        "OPEN_TIME_AND_CLOSE_TIME_REQUIRED"
      );
    }

    /**
     * ===================================================
     * VALIDATE TIME ORDER
     * ===================================================
     *
     * Only necessary when the court is open.
     */
    if (
      !data.is_closed &&
      openTime >= closeTime
    ) {
      throw new Error(
        "INVALID_COURT_SCHEDULE_TIME"
      );
    }

    /**
     * ===================================================
     * CHECK DUPLICATE DAY
     * ===================================================
     */
    const duplicate =
      await this.findByCourtAndDayForUpdate(
        existing.court_id,
        data.day_of_week,
        id
      );

    if (duplicate) {
      throw new Error(
        "COURT_SCHEDULE_DAY_ALREADY_EXISTS"
      );
    }

    /**
     * ===================================================
     * UPDATE DATABASE
     * ===================================================
     */
    await pool.query(
      `
      UPDATE court_schedules
      SET
        day_of_week = ?,
        open_time = ?,
        close_time = ?,
        is_closed = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        data.day_of_week,
        openTime,
        closeTime,
        data.is_closed,
        id,
      ]
    );

    /**
     * ===================================================
     * RETURN UPDATED SCHEDULE
     * ===================================================
     */
    return this.findById(id);
  }

  /**
   * =====================================================
   * DELETE
   * =====================================================
   */
  async delete(id: number) {
    await pool.query(
      `
      DELETE FROM court_schedules
      WHERE id = ?
      `,
      [id]
    );
  }
}