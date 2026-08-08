import { randomUUID } from "crypto";
import pool from "../../config/database";

export class PaymentRepository {
  /**
   * Create local payment record
   */
  async createPayment(data: {
    reservation_id: number;
    amount: number;
    payment_method: string;
    status: string;
    paymongo_payment_intent_id?: string;
    paymongo_payment_method_id?: string;
  }) {
    const uuid = randomUUID();

    const [result]: any = await pool.query(
      `
      INSERT INTO payments (
        uuid,
        reservation_id,
        amount,
        payment_method,
        status,
        paymongo_payment_intent_id,
        paymongo_payment_method_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        uuid,
        data.reservation_id,
        data.amount,
        data.payment_method,
        data.status,
        data.paymongo_payment_intent_id ?? null,
        data.paymongo_payment_method_id ?? null,
      ]
    );

    return this.findById(result.insertId);
  }

  /**
   * Find payment by ID
   */
  async findById(paymentId: number) {
    const [rows]: any = await pool.query(
      `
      SELECT
        p.id,
        p.uuid,
        p.reservation_id,
        p.amount,
        p.payment_method,
        p.status,
        p.paymongo_payment_intent_id,
        p.paymongo_payment_method_id,
        p.paid_at,
        p.created_at,
        p.updated_at
      FROM payments p
      WHERE p.id = ?
      LIMIT 1
      `,
      [paymentId]
    );

    return rows[0] ?? undefined;
  }

  /**
   * Find payment by public UUID
   */
  async getByUuid(uuid: string) {
    const [rows]: any = await pool.query(
      `
      SELECT
        p.id,
        p.uuid,
        p.reservation_id,
        p.amount,
        p.payment_method,
        p.status,
        p.paymongo_payment_intent_id,
        p.paymongo_payment_method_id,
        p.paid_at,
        p.created_at,
        p.updated_at
      FROM payments p
      WHERE p.uuid = ?
      LIMIT 1
      `,
      [uuid]
    );

    return rows[0] ?? undefined;
  }

  /**
   * Find latest payment belonging to a reservation
   */
  async findByReservationId(reservationId: number) {
    const [rows]: any = await pool.query(
      `
      SELECT
        p.id,
        p.uuid,
        p.reservation_id,
        p.amount,
        p.payment_method,
        p.status,
        p.paymongo_payment_intent_id,
        p.paymongo_payment_method_id,
        p.paid_at,
        p.created_at,
        p.updated_at
      FROM payments p
      WHERE p.reservation_id = ?
      ORDER BY p.created_at DESC
      LIMIT 1
      `,
      [reservationId]
    );

    return rows[0] ?? undefined;
  }

  /**
   * Update payment status
   */
  async updateStatus(
    paymentId: number,
    status: string
  ) {
    await pool.query(
      `
      UPDATE payments
      SET
        status = ?,
        paid_at =
          CASE
            WHEN ? = 'Paid'
            THEN CURRENT_TIMESTAMP
            ELSE paid_at
          END
      WHERE id = ?
      `,
      [
        status,
        status,
        paymentId,
      ]
    );

    return this.findById(paymentId);
  }

  /**
   * Find payment by PayMongo Payment Intent ID
   */
  async findByPayMongoPaymentIntentId(
    paymentIntentId: string
  ) {
    const [rows]: any = await pool.query(
      `
      SELECT
        p.id,
        p.uuid,
        p.reservation_id,
        p.amount,
        p.payment_method,
        p.status,
        p.paymongo_payment_intent_id,
        p.paymongo_payment_method_id,
        p.paid_at,
        p.created_at,
        p.updated_at
      FROM payments p
      WHERE p.paymongo_payment_intent_id = ?
      LIMIT 1
      `,
      [paymentIntentId]
    );

    return rows[0] ?? undefined;
  }

  /**
   * Update PayMongo payment information
   */
  async updatePayMongoReference(
    paymentId: number,
    paymentIntentId: string,
    paymentMethodId: string
  ) {
    await pool.query(
      `
      UPDATE payments
      SET
        paymongo_payment_intent_id = ?,
        paymongo_payment_method_id = ?
      WHERE id = ?
      `,
      [
        paymentIntentId,
        paymentMethodId,
        paymentId,
      ]
    );

    return this.findById(paymentId);
  }
}