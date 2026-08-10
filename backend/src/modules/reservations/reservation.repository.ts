  import { randomUUID } from "crypto";
  import { PoolConnection } from "mysql2/promise";

  import pool from "../../config/database";

  export class ReservationRepository {
    /**
     * =====================================================
     * Generate Reservation Number
     * =====================================================
     *
     * Uses the actual AUTO_INCREMENT reservation ID.
     *
     * Example:
     * ID: 68
     * Result:
     * RSV-20260809-000068
     */
    async generateReservationNumber(
      reservationId: number
    ) {
      const date = new Date();

      const reservationNo =
        `RSV-` +
        `${date.getFullYear()}` +
        `${String(date.getMonth() + 1).padStart(2, "0")}` +
        `${String(date.getDate()).padStart(2, "0")}-` +
        `${String(reservationId).padStart(6, "0")}`;

      return reservationNo;
    }

    /**
     * =====================================================
     * Check Time Conflict
     * =====================================================
     *
     * IMPORTANT:
     * This uses the transaction connection.
     *
     * A reservation conflicts when:
     *
     * new start < existing end
     * AND
     * new end > existing start
     *
     * Cancelled reservations are ignored.
     */
    async checkTimeConflict(
      connection: PoolConnection,
      courtId: number,
      reservationDate: string,
      startTime: string,
      endTime: string
    ) {
      const [rows]: any =
        await connection.query(
          `
          SELECT id
          FROM reservations
          WHERE court_id = ?
            AND reservation_date = ?
            AND reservation_status != 'Cancelled'
            AND start_time < ?
            AND end_time > ?
          LIMIT 1
          `,
          [
            courtId,
            reservationDate,
            endTime,
            startTime,
          ]
        );

      return rows[0] ?? null;
    }

    /**
     * =====================================================
     * Create Reservation
     * =====================================================
     *
     * Transaction-safe reservation creation.
     *
     * Flow:
     *
     * BEGIN TRANSACTION
     *      ↓
     * LOCK COURT
     *      ↓
     * CHECK TIME CONFLICT
     *      ↓
     * INSERT RESERVATION
     *      ↓
     * GET AUTO_INCREMENT ID
     *      ↓
     * GENERATE RESERVATION NUMBER
     *      ↓
     * UPDATE RESERVATION NUMBER
     *      ↓
     * COMMIT
     */
    async createReservation(data: {
      user_id?: number | null;

      guest_name?: string;
      guest_email?: string;
      guest_phone?: string;

      court_id: number;
      reservation_date: string;
      start_time: string;
      end_time: string;

      total_hours: number;
      hourly_rate: number;
      total_amount: number;

      remarks?: string;

      reservation_status: string;
      payment_status: string;
    }) {
      const connection =
        await pool.getConnection();

      try {
        /**
         * =================================================
         * START TRANSACTION
         * =================================================
         */
        await connection.beginTransaction();

        /**
         * =================================================
         * LOCK COURT
         * =================================================
         *
         * This prevents two simultaneous transactions
         * from reserving the same court at the same time.
         */
        const [courtRows]: any =
          await connection.query(
            `
            SELECT id
            FROM courts
            WHERE id = ?
              AND is_deleted = 0
            FOR UPDATE
            `,
            [data.court_id]
          );

        if (!courtRows.length) {
          throw new Error(
            "COURT_NOT_FOUND"
          );
        }

        /**
         * =================================================
         * CHECK TIME CONFLICT
         * =================================================
         */
        const conflict =
          await this.checkTimeConflict(
            connection,
            data.court_id,
            data.reservation_date,
            data.start_time,
            data.end_time
          );

        if (conflict) {
          throw new Error(
            "RESERVATION_CONFLICT"
          );
        }

        /**
         * =================================================
         * GENERATE UUID
         * =================================================
         */
        const uuid =
          randomUUID();

        /**
         * =================================================
         * INSERT RESERVATION
         * =================================================
         *
         * We temporarily store the UUID as the
         * reservation number.
         *
         * After MySQL gives us the AUTO_INCREMENT ID,
         * we replace it with the final reservation number.
         */
        const [result]: any =
          await connection.query(
            `
            INSERT INTO reservations
            (
              uuid,
              reservation_no,
              user_id,
              guest_name,
              guest_email,
              guest_phone,
              court_id,
              reservation_date,
              start_time,
              end_time,
              total_hours,
              hourly_rate,
              total_amount,
              reservation_status,
              payment_status,
              remarks
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              uuid,

              // Temporary value.
              // Will be replaced below.
              "TMP",

              data.user_id ?? null,

              data.guest_name ?? null,
              data.guest_email ?? null,
              data.guest_phone ?? null,

              data.court_id,

              data.reservation_date,

              data.start_time,
              data.end_time,

              data.total_hours,

              data.hourly_rate,

              data.total_amount,

              data.reservation_status,

              data.payment_status,

              data.remarks ?? null,
            ]
          );

        /**
         * =================================================
         * GET AUTO_INCREMENT ID
         * =================================================
         */
        const reservationId =
          result.insertId;

        /**
         * =================================================
         * GENERATE FINAL RESERVATION NUMBER
         * =================================================
         *
         * Example:
         *
         * reservationId = 68
         *
         * RSV-20260809-000068
         */
        const reservationNo =
          await this.generateReservationNumber(
            reservationId
          );

        /**
         * =================================================
         * UPDATE RESERVATION NUMBER
         * =================================================
         */
        await connection.query(
          `
          UPDATE reservations
          SET reservation_no = ?
          WHERE id = ?
          `,
          [
            reservationNo,
            reservationId,
          ]
        );

        /**
         * =================================================
         * COMMIT
         * =================================================
         */
        await connection.commit();

        /**
         * IMPORTANT:
         *
         * findById() uses the pool connection.
         *
         * Therefore we call it AFTER commit.
         */
        return this.findById(
          reservationId
        );
      } catch (error) {
        /**
         * =================================================
         * ROLLBACK
         * =================================================
         */
        await connection.rollback();

        throw error;
      } finally {
        /**
         * =================================================
         * RELEASE CONNECTION
         * =================================================
         */
        connection.release();
      }
    }

    /**
     * =====================================================
     * Reservation Details
     * =====================================================
     */
    async findById(id: number) {
      const [rows]: any =
        await pool.query(
          `
          SELECT
            r.*,

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

          WHERE r.id = ?

          LIMIT 1
          `,
          [id]
        );

      return rows[0];
    }

    /**
     * =====================================================
     * Player Reservations
     * =====================================================
     */
    async findUserReservations(
      userId: number
    ) {
      const [rows]: any =
        await pool.query(
          `
          SELECT *
          FROM reservations
          WHERE user_id = ?
          ORDER BY
            reservation_date DESC,
            start_time DESC
          `,
          [userId]
        );

      return rows;
    }

    /**
     * =====================================================
     * All Reservations
     * =====================================================
     */
    async findAll() {
      const [rows]: any =
        await pool.query(
          `
          SELECT
            r.*,

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
            reservation_date DESC,
            start_time DESC
          `
        );

      return rows;
    }

    /**
     * =====================================================
     * Cancel Reservation
     * =====================================================
     */
    async cancelReservation(
      id: number
    ) {
      await pool.query(
        `
        UPDATE reservations
        SET
          reservation_status = 'Cancelled'
        WHERE id = ?
        `,
        [id]
      );

      return this.findById(id);
    }

    /**
     * =====================================================
     * Update Reservation Status
     * =====================================================
     */
    async updateStatus(
      reservationId: number,
      reservationStatus: string,
      paymentStatus: string
    ) {
      await pool.query(
        `
        UPDATE reservations
        SET
          reservation_status = ?,
          payment_status = ?
        WHERE id = ?
        `,
        [
          reservationStatus,
          paymentStatus,
          reservationId,
        ]
      );

      return this.findById(
        reservationId
      );
    }

    /**
     * =====================================================
     * Public Reservation Lookup
     * =====================================================
     */
    async getByUuid(
      uuid: string
    ) {
      const [rows]: any =
        await pool.query(
          `
          SELECT
            r.uuid,
            r.reservation_no,
            r.reservation_date,
            r.start_time,
            r.end_time,
            r.reservation_status,
            r.payment_status,
            c.name AS court_name

          FROM reservations r

          INNER JOIN courts c
            ON c.id = r.court_id

          WHERE r.uuid = ?

          LIMIT 1
          `,
          [uuid]
        );

      return rows[0] ?? null;
    }

    /**
     * =====================================================
     * Find Reservations By Court And Date
     * =====================================================
     *
     * Used by availability checking.
     */
    async findReservationsByCourtAndDate(
      courtId: number,
      reservationDate: string
    ) {
      const [rows]: any =
        await pool.query(
          `
          SELECT
            id,
            start_time,
            end_time,
            reservation_status
          FROM reservations
          WHERE court_id = ?
            AND reservation_date = ?
            AND reservation_status != 'Cancelled'
          ORDER BY
            start_time ASC
          `,
          [
            courtId,
            reservationDate,
          ]
        );

      return rows;
    }
  }