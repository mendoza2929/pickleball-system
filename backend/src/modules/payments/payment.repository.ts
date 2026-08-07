import { randomUUID } from "crypto";
import pool from "../../config/database";
import { CreatePaymentInput } from "./payment.validator";

export class PaymentRepository {

    async create(
        data: CreatePaymentInput,
        paymentNo: string,
        amount: number
    ) {
        const uuid = randomUUID();

        const [result]: any = await pool.query(
            `
            INSERT INTO payments (
                uuid,
                payment_no,
                reservation_id,
                amount,
                payment_method
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                uuid,
                paymentNo,
                data.reservation_id,
                amount,
                data.payment_method,
            ]
        );

        return this.findById(result.insertId);
    }

    async findById(id: number) {
        const [rows]: any = await pool.query(
            `
            SELECT *
            FROM payments
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        return rows[0];
    }

    async findByReservationId(reservationId: number) {
        const [rows]: any = await pool.query(
            `
            SELECT *
            FROM payments
            WHERE reservation_id = ?
            LIMIT 1
            `,
            [reservationId]
        );

        return rows[0];
    }

    async getAll() {
        const [rows]: any = await pool.query(
            `
            SELECT
                p.*,
                r.reservation_no,
                u.first_name,
                u.last_name
            FROM payments p
            INNER JOIN reservations r
                ON r.id = p.reservation_id
            INNER JOIN users u
                ON u.id = r.user_id
            ORDER BY p.created_at DESC
            `
        );

        return rows;
    }

    async updateStatus(
        id: number,
        status: string,
        referenceNo?: string
    ) {
        await pool.query(
            `
            UPDATE payments
            SET
                payment_status = ?,
                reference_no = ?,
                paid_at = NOW()
            WHERE id = ?
            `,
            [
                status,
                referenceNo ?? null,
                id,
            ]
        );

        return this.findById(id);
    }
}