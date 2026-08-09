import { randomUUID } from "crypto";
import { PoolConnection } from "mysql2/promise";

import pool from "../../config/database";

export class ReservationRepository {

  /**
   * Generate Reservation Number
   *
   * NOTE:
   * We will improve reservation number generation later.
   */
  async generateReservationNumber(
    connection: PoolConnection
  ) {
    const [rows]: any = await connection.query(`
      SELECT COALESCE(MAX(id), 0) + 1 AS next_number
      FROM reservations
    `);

    const nextNumber = Number(rows[0].next_number);

    const date = new Date();

    const reservationNo =
      `RSV-` +
      `${date.getFullYear()}` +
      `${String(date.getMonth() + 1).padStart(2, "0")}` +
      `${String(date.getDate()).padStart(2, "0")}-` +
      `${String(nextNumber).padStart(6, "0")}`;

    return reservationNo;
  }

  /**
   * Check Time Conflict
   *
   * IMPORTANT:
   * This uses the transaction connection.
   */
  async checkTimeConflict(
    connection: PoolConnection,
    courtId: number,
    reservationDate: string,
    startTime: string,
    endTime: string
  ) {
    const [rows]: any = await connection.query(
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
   * Create Reservation
   *
   * Transaction-safe reservation creation.
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
       * ==========================================
       * START TRANSACTION
       * ==========================================
       */
      await connection.beginTransaction();

      /**
       * ==========================================
       * LOCK COURT
       * ==========================================
       *
       * This is the important part.
       *
       * Another request trying to reserve
       * the same court will wait until this
       * transaction finishes.
       */
      const [courtRows]: any =
        await connection.query(
          `
          SELECT id
          FROM courts
          WHERE id = ?
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
       * ==========================================
       * CHECK TIME CONFLICT
       * ==========================================
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
       * ==========================================
       * GENERATE RESERVATION NUMBER
       * ==========================================
       */
      const reservationNo =
        await this.generateReservationNumber(
          connection
        );

      const uuid =
        randomUUID();

      /**
       * ==========================================
       * INSERT RESERVATION
       * ==========================================
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

            reservationNo,

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
       * ==========================================
       * COMMIT
       * ==========================================
       */
      await connection.commit();

      /**
       * IMPORTANT:
       *
       * findById uses the pool, so call it
       * AFTER commit.
       */
      return this.findById(
        result.insertId
      );

    } catch (error) {

      /**
       * ==========================================
       * ROLLBACK
       * ==========================================
       */
      await connection.rollback();

      throw error;

    } finally {

      /**
       * ==========================================
       * RELEASE CONNECTION
       * ==========================================
       */
      connection.release();
    }
  }

  /**
   * Reservation Details
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
   * Player Reservations
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
   * All Reservations
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
   * Cancel Reservation
   */
  async cancelReservation(
    id: number
  ) {

    await pool.query(
      `
      UPDATE reservations
      SET reservation_status = 'Cancelled'
      WHERE id = ?
      `,
      [id]
    );

    return this.findById(id);
  }


  /**
   * Update Reservation Status
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
   * Public Reservation Lookup
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
}