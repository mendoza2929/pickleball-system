import { randomUUID } from "crypto";
import pool from "../../config/database";

export class ReservationRepository {

  /**
   * Generate Reservation Number
   *
   * Example:
   * RSV-20260807-000001
   *
   * NOTE:
   * This uses the latest reservation ID instead of COUNT(*)
   * so cancelled/deleted records don't cause unnecessary
   * number reuse.
   */
  async generateReservationNumber() {
    const [rows]: any = await pool.query(`
      SELECT COALESCE(MAX(id), 0) + 1 AS next_number
      FROM reservations
    `);

    const nextNumber = Number(rows[0].next_number);

    const date = new Date();

    const reservationNo =
      `RSV-${
        date.getFullYear()
      }${
        String(date.getMonth() + 1).padStart(2, "0")
      }${
        String(date.getDate()).padStart(2, "0")
      }-${
        String(nextNumber).padStart(6, "0")
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

    return this.getByUuid(uuid);
  }

  /**
   * Reservation Details
   *
   * Used for authenticated/internal reservation details.
   */
  async findById(id: number) {
    const [rows]: any = await pool.query(
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
  async findUserReservations(userId: number) {
    const [rows]: any = await pool.query(
      `
      SELECT
        *
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
    const [rows]: any = await pool.query(
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
  async cancelReservation(id: number) {
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
  }

  /**
   * Public Reservation Lookup
   *
   * IMPORTANT:
   * Do NOT use SELECT * here.
   *
   * This endpoint is public because guests can view
   * their reservation using the UUID.
   */
  async getByUuid(uuid: string) {
  const [rows]: any = await pool.query(
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