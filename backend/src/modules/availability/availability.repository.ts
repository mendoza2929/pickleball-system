import pool from "../../config/database";

export class AvailabilityRepository {
  /**
   * Get Court
   */
  async getCourt(courtId: number) {
    const [rows]: any = await pool.query(
      `
        SELECT
          id,
          name,
          hourly_rate,
          status
        FROM courts
        WHERE id = ?
        LIMIT 1
      `,
      [courtId]
    );

    return rows[0] ?? null;
  }

  /**
   * Get Weekly Schedule
   */
  async getSchedule(
    courtId: number,
    day: string
  ) {
    const [rows]: any = await pool.query(
      `
        SELECT
          open_time,
          close_time,
          is_closed
        FROM court_schedules
        WHERE court_id = ?
          AND day_of_week = ?
        LIMIT 1
      `,
      [
        courtId,
        day,
      ]
    );

    return rows[0] ?? null;
  }

  /**
   * Get Schedule Override
   */
  async getScheduleOverride(
    courtId: number,
    reservationDate: string
  ) {
    const [rows]: any = await pool.query(
      `
        SELECT
          cso.id,
          cso.court_id,
          cso.schedule_date,
          cso.open_time,
          cso.close_time,
          cso.is_closed,
          cso.reason

        FROM court_schedule_overrides cso

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
        reservationDate,
        courtId,
        courtId,
      ]
    );

    return rows[0] ?? null;
  }

  /**
   * Get Existing Reservations
   */
  async getReservations(
    courtId: number,
    reservationDate: string
  ) {
    const [rows]: any = await pool.query(
      `
        SELECT
          start_time,
          end_time

        FROM reservations

        WHERE court_id = ?
          AND reservation_date = ?
          AND reservation_status != 'Cancelled'

        ORDER BY start_time
      `,
      [
        courtId,
        reservationDate,
      ]
    );

    return rows;
  }

  /**
   * Get Open Play Matches
   *
   * A called or playing match occupies
   * the court for one 60-minute slot.
   */
  async getCompetitionMatches(
    courtId: number,
    reservationDate: string
  ) {
    const [rows]: any = await pool.query(
      `
        SELECT
          id,
          match_number,
          status,
          court_assigned_at,
          started_at,
          completed_at

        FROM competition_matches

        WHERE court_id = ?

          AND DATE(
            COALESCE(
              court_assigned_at,
              started_at
            )
          ) = ?

          AND status IN (
            'called',
            'playing'
          )

        ORDER BY
          COALESCE(
            court_assigned_at,
            started_at
          ) ASC
      `,
      [
        courtId,
        reservationDate,
      ]
    );

    return rows;
  }

  async getAvailableCourts() {
    const [rows]: any = await pool.query(
      `
        SELECT
          id,
          name,
          hourly_rate,
          status

        FROM courts

        WHERE status = 'Available'

        ORDER BY id ASC
      `
    );

    return rows;
  }
}