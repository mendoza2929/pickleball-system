import pool from "../../config/database";

export class ReportRepository {

  // =====================================================
  // OVERVIEW SUMMARY
  // =====================================================

  async getOverview(
    dateFrom: string,
    dateTo: string
  ) {

    const [rows]: any =
      await pool.query(
        `
        SELECT

          COUNT(*) AS total_reservations,

          SUM(
            CASE
              WHEN r.payment_status = 'Paid'
              THEN 1
              ELSE 0
            END
          ) AS paid_reservations,

          SUM(
            CASE
              WHEN r.payment_status IN ('Unpaid', 'Partial')
                AND r.reservation_status != 'Cancelled'
              THEN 1
              ELSE 0
            END
          ) AS pending_reservations,

          SUM(
            CASE
              WHEN r.reservation_status = 'Cancelled'
              THEN 1
              ELSE 0
            END
          ) AS cancelled_reservations,

          COALESCE(
            SUM(
              CASE

                -- Payment record exists and is paid
                WHEN p.id IS NOT NULL
                  AND p.status = 'Paid'
                THEN p.amount

                -- Walk-in / paid reservation
                -- without a payment record
                WHEN p.id IS NULL
                  AND r.payment_status = 'Paid'
                THEN r.total_amount

                ELSE 0

              END
            ),
            0
          ) AS total_revenue

        FROM reservations r

        LEFT JOIN payments p
          ON p.reservation_id = r.id

        WHERE r.reservation_date
          BETWEEN ? AND ?
        `,
        [
          dateFrom,
          dateTo,
        ]
      );

    return rows[0];
  }


  // =====================================================
  // REVENUE BY DATE
  // =====================================================

  async getRevenueByDate(
    dateFrom: string,
    dateTo: string
  ) {

    const [rows]: any =
      await pool.query(
        `
        SELECT

          r.reservation_date AS date,

          COALESCE(
            SUM(
              CASE

                WHEN p.id IS NOT NULL
                  AND p.status = 'Paid'
                THEN p.amount

                WHEN p.id IS NULL
                  AND r.payment_status = 'Paid'
                THEN r.total_amount

                ELSE 0

              END
            ),
            0
          ) AS revenue

        FROM reservations r

        LEFT JOIN payments p
          ON p.reservation_id = r.id

        WHERE r.reservation_date
          BETWEEN ? AND ?

        GROUP BY r.reservation_date

        ORDER BY r.reservation_date ASC
        `,
        [
          dateFrom,
          dateTo,
        ]
      );

    return rows;
  }


  // =====================================================
  // REVENUE BY COURT
  // =====================================================

  async getRevenueByCourt(
    dateFrom: string,
    dateTo: string
  ) {

    const [rows]: any =
      await pool.query(
        `
        SELECT

          r.court_id,

          c.name AS court_name,

          COUNT(r.id) AS reservations,

          COALESCE(
            SUM(
              CASE

                WHEN p.id IS NOT NULL
                  AND p.status = 'Paid'
                THEN p.amount

                WHEN p.id IS NULL
                  AND r.payment_status = 'Paid'
                THEN r.total_amount

                ELSE 0

              END
            ),
            0
          ) AS revenue

        FROM reservations r

        INNER JOIN courts c
          ON c.id = r.court_id

        LEFT JOIN payments p
          ON p.reservation_id = r.id

        WHERE r.reservation_date
          BETWEEN ? AND ?

        GROUP BY
          r.court_id,
          c.name

        ORDER BY revenue DESC
        `,
        [
          dateFrom,
          dateTo,
        ]
      );

    return rows;
  }


  // =====================================================
  // PAYMENT METHODS
  // =====================================================

  async getPaymentMethods(
    dateFrom: string,
    dateTo: string
  ) {

    const [rows]: any =
      await pool.query(
        `
        SELECT

          COALESCE(
            p.payment_method,
            'WALK-IN'
          ) AS payment_method,

          COUNT(*) AS transactions,

          COALESCE(
            SUM(
              CASE

                WHEN p.id IS NOT NULL
                  AND p.status = 'Paid'
                THEN p.amount

                WHEN p.id IS NULL
                  AND r.payment_status = 'Paid'
                THEN r.total_amount

                ELSE 0

              END
            ),
            0
          ) AS amount

        FROM reservations r

        LEFT JOIN payments p
          ON p.reservation_id = r.id

        WHERE r.reservation_date
          BETWEEN ? AND ?

        GROUP BY
          COALESCE(
            p.payment_method,
            'WALK-IN'
          )

        HAVING amount > 0

        ORDER BY amount DESC
        `,
        [
          dateFrom,
          dateTo,
        ]
      );

    return rows;
  }


  // =====================================================
  // PEAK BOOKING HOURS
  // =====================================================

  async getPeakHours(
    dateFrom: string,
    dateTo: string
  ) {

    const [rows]: any =
      await pool.query(
        `
        SELECT

          HOUR(r.start_time) AS hour,

          COUNT(*) AS bookings

        FROM reservations r

        WHERE r.reservation_date
          BETWEEN ? AND ?

          AND r.reservation_status != 'Cancelled'

        GROUP BY
          HOUR(r.start_time)

        ORDER BY
          hour ASC
        `,
        [
          dateFrom,
          dateTo,
        ]
      );

    return rows;
  }
}