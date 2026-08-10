import pool from "../../config/database";

export class DashboardRepository {
  /**
   * =====================================================
   * DASHBOARD STATS
   * =====================================================
   */
  async getStats() {
    const [reservationRows]: any =
      await pool.query(
        `
        SELECT
          COUNT(*) AS reservations,

          COUNT(
            DISTINCT COALESCE(
              CAST(user_id AS CHAR),
              CONCAT(
                'guest-',
                id
              )
            )
          ) AS players

        FROM reservations

        WHERE reservation_date = CURDATE()

          AND reservation_status != 'Cancelled'
        `
      );

    const [revenueRows]: any =
      await pool.query(
        `
        SELECT
          COALESCE(
            SUM(total_amount),
            0
          ) AS revenue

        FROM reservations

        WHERE reservation_date = CURDATE()

          AND reservation_status != 'Cancelled'

          AND payment_status = 'Paid'
        `
      );

    const [courtRows]: any =
      await pool.query(
        `
        SELECT
          COUNT(*) AS total_courts,

          SUM(
            CASE
              WHEN status = 'Available'
              THEN 1
              ELSE 0
            END
          ) AS active_courts

        FROM courts

        WHERE is_deleted = 0
        `
      );

    return {
      reservations:
        Number(
          reservationRows[0]?.reservations ?? 0
        ),

      revenue:
        Number(
          revenueRows[0]?.revenue ?? 0
        ),

      activeCourts:
        Number(
          courtRows[0]?.active_courts ?? 0
        ),

      totalCourts:
        Number(
          courtRows[0]?.total_courts ?? 0
        ),

      players:
        Number(
          reservationRows[0]?.players ?? 0
        ),
    };
  }

  /**
   * =====================================================
   * TODAY'S SCHEDULE
   * =====================================================
   */
  async getTodaySchedule() {
    const [rows]: any =
      await pool.query(
        `
        SELECT
          r.id,
          r.uuid,
          r.reservation_no,

          r.reservation_date,
          r.start_time,
          r.end_time,

          r.total_hours,
          r.total_amount,

          r.reservation_status,
          r.payment_status,

          c.id AS court_id,
          c.name AS court_name,

          CASE
            WHEN r.user_id IS NOT NULL THEN
              CONCAT(
                u.first_name,
                ' ',
                u.last_name
              )
            ELSE
              r.guest_name
          END AS player_name

        FROM reservations r

        INNER JOIN courts c
          ON c.id = r.court_id

        LEFT JOIN users u
          ON u.id = r.user_id

        WHERE
          r.reservation_date = CURDATE()

          AND r.reservation_status != 'Cancelled'

        ORDER BY
          r.start_time ASC

        LIMIT 10
        `
      );

    return rows;
  }

  /**
   * =====================================================
   * COURT STATUS
   * =====================================================
   */
  async getCourtStatus() {
    const [rows]: any =
      await pool.query(
        `
        SELECT
          c.id,
          c.name,
          c.status,

          CASE

            WHEN c.status != 'Available'
              THEN 'Currently unavailable'

            WHEN EXISTS (
              SELECT 1

              FROM reservations r

              WHERE r.court_id = c.id

                AND r.reservation_date = CURDATE()

                AND r.reservation_status IN (
                  'Pending',
                  'Confirmed'
                )

                AND TIME(NOW())
                    >= r.start_time

                AND TIME(NOW())
                    < r.end_time
            )
              THEN 'Currently reserved'

            ELSE
              'Available now'

          END AS description,

          CASE

            WHEN c.status != 'Available'
              THEN c.status

            WHEN EXISTS (
              SELECT 1

              FROM reservations r

              WHERE r.court_id = c.id

                AND r.reservation_date = CURDATE()

                AND r.reservation_status IN (
                  'Pending',
                  'Confirmed'
                )

                AND TIME(NOW())
                    >= r.start_time

                AND TIME(NOW())
                    < r.end_time
            )
              THEN 'Reserved'

            ELSE
              'Available'

          END AS dashboard_status

        FROM courts c

        WHERE c.is_deleted = 0

        ORDER BY c.id ASC
        `
      );

    return rows.map(
      (court: any) => ({
        id: Number(court.id),

        name: court.name,

        status:
          court.dashboard_status,

        description:
          court.description,
      })
    );
  }

  /**
   * =====================================================
   * RECENT RESERVATIONS
   * =====================================================
   */
  async getRecentReservations() {
    const [rows]: any =
      await pool.query(
        `
        SELECT
          r.id,
          r.uuid,
          r.reservation_no,

          r.reservation_date,
          r.start_time,
          r.end_time,

          r.total_hours,
          r.total_amount,

          r.reservation_status,
          r.payment_status,

          c.name AS court_name,

          CASE
            WHEN r.user_id IS NOT NULL THEN
              CONCAT(
                u.first_name,
                ' ',
                u.last_name
              )
            ELSE
              r.guest_name
          END AS player_name

        FROM reservations r

        INNER JOIN courts c
          ON c.id = r.court_id

        LEFT JOIN users u
          ON u.id = r.user_id

        ORDER BY
          r.created_at DESC

        LIMIT 10
        `
      );

    return rows;
  }
}