import { PaymentRepository } from "./payment.repository";
import { ReservationRepository } from "../reservations/reservation.repository";

import { CreatePaymentInput } from "./payment.validator";

import { ConflictError } from "../../shared/errors/ConflictError";
import { NotFoundError } from "../../shared/errors/NotFoundError";

import { PAYMENT_STATUS } from "../../constants/payment-status";
import { RESERVATION_STATUS } from "../../constants/reservation-status";

export class PaymentService {
    private paymentRepository = new PaymentRepository();
    private reservationRepository = new ReservationRepository();

    /**
     * Create Payment
     */
    async create(data: CreatePaymentInput) {
        // 1. Reservation exists
        const reservation =
            await this.reservationRepository.findById(
                data.reservation_id
            );

        if (!reservation) {
            throw new NotFoundError(
                "Reservation not found."
            );
        }

        // 2. Prevent duplicate payment
        const existing =
            await this.paymentRepository.findByReservationId(
                data.reservation_id
            );

        if (existing) {
            throw new ConflictError(
                "Payment already exists for this reservation."
            );
        }

        // 3. Generate payment number
        const paymentNo =
            this.generatePaymentNumber();

        // 4. Create payment
        return this.paymentRepository.create(
            data,
            paymentNo,
            reservation.total_amount
        );
    }

    /**
     * Get All Payments
     */
    async getAll() {
        return this.paymentRepository.getAll();
    }

    /**
     * Mark Payment Paid
     */
    async markPaid(
        paymentId: number,
        referenceNo?: string
    ) {

        const payment =
            await this.paymentRepository.findById(
                paymentId
            );

        if (!payment) {
            throw new NotFoundError(
                "Payment not found."
            );
        }

        await this.paymentRepository.updateStatus(
            paymentId,
            PAYMENT_STATUS.PAID,
            referenceNo
        );

        // Update reservation status
        await this.reservationRepository.updateStatus(
            payment.reservation_id,
            RESERVATION_STATUS.CONFIRMED,
            PAYMENT_STATUS.PAID
        );

        return this.paymentRepository.findById(
            paymentId
        );
    }

    /**
     * Generate Payment Number
     */
    private generatePaymentNumber() {

        const now = new Date();

        const yyyy = now.getFullYear();

        const mm = String(
            now.getMonth() + 1
        ).padStart(2, "0");

        const dd = String(
            now.getDate()
        ).padStart(2, "0");

        const random = Math.floor(
            Math.random() * 999999
        )
            .toString()
            .padStart(6, "0");

        return `PAY-${yyyy}${mm}${dd}-${random}`;
    }
}