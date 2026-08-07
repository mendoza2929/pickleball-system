import { randomUUID } from "crypto";
import pool from "../../config/database";
import { CreateReservationInput } from "./reservation.validator";

export class ReservationRepository {

  /**
   * Generate Reservation Number
   * Example:
   * RSV-20260807-000001
   */
  async generateReservationNumber() {
    const [rows]: any = await pool.query(`
      SELECT COUNT(*) AS total
      FROM reservations
    `);

    const total = Number(rows[0].total) + 1;

    const date = new Date();

    const reservationNo =
      `RSV-${
        date.getFullYear()
      }${
        String(date.getMonth() + 1).padStart(2, "0")
      }${
        String(date.getDate()).padStart(2, "0")
      }-${
        String(total).padStart(6, "0")
      }`;

    return reservationNo;
  }

  /**
   * Check Time Conflict
   */
  async checkTimeConflict(
    courtId: number,
    reservationDate: string,
    startTime: string,
    endTime: string
  ) {

    const [rows]: any = await pool.query(
      `
      SELECT id
      FROM reservations
      WHERE court_id = ?
      AND reservation_date = ?
      AND reservation_status != 'Cancelled'
      AND (
            start_time < ?
        AND end_time > ?
      )
      LIMIT 1
      `,
      [
        courtId,
        reservationDate,
        endTime,
        startTime,
      ]
    );

    return rows[0];
  }

  /**
   * Create Reservation
   */
  async createReservation(data: {
    user_id: number;
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

    const uuid = randomUUID();

    const reservationNo =
      await this.generateReservationNumber();

    const [result]: any = await pool.query(
      `
      INSERT INTO reservations
      (
        uuid,
        reservation_no,
        user_id,
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
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        uuid,
        reservationNo,
        data.user_id,
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

    return this.findById(result.insertId);
  }

  /**
   * Reservation Details
   */
  async findById(id: number) {

    const [rows]: any = await pool.query(
      `
      SELECT
        r.*,

        c.name AS court_name,

        CONCAT(
            u.first_name,
            ' ',
            u.last_name
        ) AS player_name

      FROM reservations r

      INNER JOIN courts c
        ON c.id = r.court_id

      INNER JOIN users u
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
  async findUserReservations(userId: number) {

    const [rows]: any = await pool.query(
      `
      SELECT
        *
      FROM reservations
      WHERE user_id = ?
      ORDER BY reservation_date DESC,
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

    const [rows]: any = await pool.query(
      `
      SELECT
        *
      FROM reservations
      ORDER BY reservation_date DESC,
               start_time DESC
      `
    );

    return rows;
  }

  /**
   * Cancel Reservation
   */
  async cancelReservation(id: number) {

    await pool.query(
      `
      UPDATE reservations
      SET reservation_status='Cancelled'
      WHERE id=?
      `,
      [id]
    );

    return this.findById(id);
  }

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
  }

}