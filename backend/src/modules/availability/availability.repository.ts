import pool from "../../config/database";

export class AvailabilityRepository {
  // ==================================================
  // GET COURT
  // ==================================================

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

  // ==================================================
  // GET WEEKLY SCHEDULE
  // ==================================================

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

  // ==================================================
  // GET SCHEDULE OVERRIDE
  // ==================================================

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

  // ==================================================
  // GET RESERVATIONS
  // ==================================================

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

  // ==================================================
  // GET OPEN PLAY COURT ALLOCATIONS
  //
  // THIS IS THE IMPORTANT PART
  // ==================================================

  async getCompetitionCourtAllocations(
    courtId: number,
    reservationDate: string
  ) {
    const [rows]: any = await pool.query(
      `
        SELECT
          id,
          competition_id,
          competition_division_id,
          court_id,

          DATE_FORMAT(
            allocation_date,
            '%Y-%m-%d'
          ) AS allocation_date,

          TIME_FORMAT(
            start_time,
            '%H:%i:%s'
          ) AS start_time,

          TIME_FORMAT(
            end_time,
            '%H:%i:%s'
          ) AS end_time,

          allocation_type,
          status

        FROM competition_court_allocations

        WHERE court_id = ?

          AND DATE(allocation_date) = ?

          AND status <> 'released'

        ORDER BY start_time ASC
      `,
      [
        courtId,
        reservationDate,
      ]
    );

    console.log(
      "=========================================="
    );

    console.log(
      "[AvailabilityRepository]"
    );

    console.log(
      "Court:",
      courtId
    );

    console.log(
      "Date:",
      reservationDate
    );

    console.log(
      "Competition allocations:",
      rows
    );

    console.log(
      "=========================================="
    );

    return rows;
  }

  // ==================================================
  // GET COMPETITION MATCHES
  // ==================================================

  async getCompetitionMatches(
    courtId: number,
    reservationDate: string
  ) {
    const [rows]: any = await pool.query(
      `
        SELECT
          id,
          match_number,
          competition_session_id,
          court_id,
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

  // ==================================================
  // GET AVAILABLE COURTS
  // ==================================================

  async getAvailableCourts() {
    const [rows]: any = await pool.query(
      `
        SELECT
          id,
          uuid,
          court_number,
          name,
          description,
          surface_type,
          hourly_rate,
          status
        FROM courts
        WHERE is_deleted = 0
          AND status = 'Available'
        ORDER BY court_number ASC
      `
    );

    return rows;
  }
}