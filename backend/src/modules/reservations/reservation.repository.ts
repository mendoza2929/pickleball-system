import { randomUUID } from "crypto";
import { PoolConnection } from "mysql2/promise";

import pool from "../../config/database";

export class ReservationRepository {

  // =====================================================
  // GENERATE RESERVATION NUMBER
  // =====================================================

  async generateReservationNumber(
    reservationId: number
  ) {
    const date = new Date();

    return (
      `RSV-` +
      `${date.getFullYear()}` +
      `${String(date.getMonth() + 1).padStart(2, "0")}` +
      `${String(date.getDate()).padStart(2, "0")}-` +
      `${String(reservationId).padStart(6, "0")}`
    );
  }

  // =====================================================
  // CHECK NORMAL RESERVATION TIME CONFLICT
  // =====================================================

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
          AND reservation_status IN (
            'Pending',
            'Confirmed'
          )
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

  // =====================================================
  // CHECK COMPETITION COURT ALLOCATION CONFLICT
  //
  // Blocks normal reservations/walk-ins when the court
  // has been allocated to a competition/open play.
  //
  // Example:
  //
  // competition allocation:
  // 15:00 - 17:00
  //
  // blocked:
  // 15:00 - 16:00
  // 16:00 - 17:00
  // 14:30 - 15:30
  // 16:30 - 17:30
  //
  // allowed:
  // 09:00 - 10:00
  // 17:00 - 18:00
  // =====================================================

  async checkCompetitionCourtAllocationConflict(
    connection: PoolConnection,
    courtId: number,
    reservationDate: string,
    startTime: string,
    endTime: string
  ) {
    const [rows]: any =
      await connection.query(
        `
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

          -- Released allocations should no longer block
          AND status != 'released'

          -- Standard overlapping-time condition
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

  // =====================================================
  // CREATE RESERVATION
  // =====================================================

  async createReservation(data: {
    user_id?: number | null;
    customer_id?: number | null;

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

      // ===================================================
      // BEGIN TRANSACTION
      // ===================================================

      await connection.beginTransaction();

      // ===================================================
      // LOCK COURT
      // ===================================================

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

      // ===================================================
      // CHECK NORMAL RESERVATION CONFLICT
      // ===================================================

      const reservationConflict =
        await this.checkTimeConflict(
          connection,
          data.court_id,
          data.reservation_date,
          data.start_time,
          data.end_time
        );

      if (reservationConflict) {
        throw new Error(
          "RESERVATION_CONFLICT"
        );
      }

      // ===================================================
      // CHECK COMPETITION COURT ALLOCATION
      // ===================================================

      const competitionConflict =
        await this.checkCompetitionCourtAllocationConflict(
          connection,
          data.court_id,
          data.reservation_date,
          data.start_time,
          data.end_time
        );

      if (competitionConflict) {
        throw new Error(
          "COMPETITION_COURT_ALLOCATION_CONFLICT"
        );
      }

      // ===================================================
      // UUID
      // ===================================================

      const uuid =
        randomUUID();

      // ===================================================
      // INSERT
      // ===================================================

      const [result]: any =
        await connection.query(
          `
          INSERT INTO reservations
          (
            uuid,
            reservation_no,
            user_id,
            customer_id,
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
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            uuid,

            // Temporary reservation number.
            // Updated after AUTO_INCREMENT ID.
            "TMP",

            data.user_id ?? null,

            data.customer_id ?? null,

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

      // ===================================================
      // RESERVATION ID
      // ===================================================

      const reservationId =
        result.insertId;

      // ===================================================
      // RESERVATION NUMBER
      // ===================================================

      const reservationNo =
        await this.generateReservationNumber(
          reservationId
        );

      // ===================================================
      // UPDATE RESERVATION NUMBER
      // ===================================================

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

      // ===================================================
      // COMMIT
      // ===================================================

      await connection.commit();

      // ===================================================
      // GET CREATED RESERVATION
      // ===================================================

      return this.findById(
        reservationId
      );

    } catch (error) {

      await connection.rollback();

      throw error;

    } finally {

      connection.release();

    }
  }

  // =====================================================
  // FIND BY ID
  // =====================================================

  async findById(
    id: number
  ) {
    const [rows]: any =
      await pool.query(
        `
        SELECT
          r.*,

          c.name AS court_name,

          r.customer_id,

          cust.first_name
            AS customer_first_name,

          cust.last_name
            AS customer_last_name,

          cust.email
            AS customer_email,

          cust.phone
            AS customer_phone,

          CASE
            WHEN r.customer_id IS NOT NULL THEN
              CONCAT(
                cust.first_name,
                ' ',
                cust.last_name
              )

            WHEN r.user_id IS NOT NULL THEN
              CONCAT(
                u.first_name,
                ' ',
                u.last_name
              )

            ELSE
              r.guest_name
          END AS player_name,

          (
            SELECT
              p.payment_method
            FROM payments p
            WHERE p.reservation_id = r.id
            ORDER BY p.id DESC
            LIMIT 1
          ) AS payment_method,

          (
            SELECT
              p.payment_proof
            FROM payments p
            WHERE p.reservation_id = r.id
            ORDER BY p.id DESC
            LIMIT 1
          ) AS proof_url

        FROM reservations r

        INNER JOIN courts c
          ON c.id = r.court_id

        LEFT JOIN users u
          ON u.id = r.user_id

        LEFT JOIN customers cust
          ON cust.id = r.customer_id

        WHERE r.id = ?

        LIMIT 1
        `,
        [id]
      );

    return rows[0] ?? null;
  }

  // =====================================================
  // FIND USER RESERVATIONS
  // =====================================================

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

  // =====================================================
  // FIND ALL RESERVATIONS
  // =====================================================

  async findAll() {
    const [rows]: any =
      await pool.query(
        `
        SELECT
          r.*,

          c.name AS court_name,

          r.customer_id,

          cust.first_name
            AS customer_first_name,

          cust.last_name
            AS customer_last_name,

          cust.email
            AS customer_email,

          cust.phone
            AS customer_phone,

         CASE
            WHEN r.guest_name IS NOT NULL
                AND TRIM(r.guest_name) != ''
              THEN r.guest_name

            WHEN r.customer_id IS NOT NULL THEN
              CONCAT(
                cust.first_name,
                ' ',
                cust.last_name
              )

            WHEN r.user_id IS NOT NULL THEN
              CONCAT(
                u.first_name,
                ' ',
                u.last_name
              )

            ELSE
              NULL
          END AS player_name,

          (
            SELECT
              p.payment_method
            FROM payments p
            WHERE p.reservation_id = r.id
            ORDER BY p.id DESC
            LIMIT 1
          ) AS payment_method,

          (
            SELECT
              p.payment_proof
            FROM payments p
            WHERE p.reservation_id = r.id
            ORDER BY p.id DESC
            LIMIT 1
          ) AS proof_url

        FROM reservations r

        INNER JOIN courts c
          ON c.id = r.court_id

        LEFT JOIN users u
          ON u.id = r.user_id

        LEFT JOIN customers cust
          ON cust.id = r.customer_id

        ORDER BY
          r.reservation_date DESC,
          r.start_time DESC
        `
      );

    return rows;
  }

  // =====================================================
  // CANCEL RESERVATION
  // =====================================================

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

  // =====================================================
  // UPDATE STATUS
  // =====================================================

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

  // =====================================================
  // GET BY UUID
  // =====================================================

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

  // =====================================================
  // FIND RESERVATIONS BY COURT AND DATE
  // =====================================================

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
        ORDER BY start_time ASC
        `,
        [
          courtId,
          reservationDate,
        ]
      );

    return rows;
  }
}