import { PaymentRepository } from "./payment.repository";
import { ReservationRepository } from "../reservations/reservation.repository";

import {
  CreatePaymentInput,
} from "./payment.validator";

import { BadRequestError } from "../../shared/errors/BadRequestError";
import { NotFoundError } from "../../shared/errors/NotFoundError";

export class PaymentService {
  private paymentRepository =
    new PaymentRepository();

  private reservationRepository =
    new ReservationRepository();

  /**
   * POST /api/payments
   *
   * Create local GCash payment
   * with uploaded payment proof.
   */
  async create(
    userId: number | null,
    data: CreatePaymentInput,
    proof: Express.Multer.File
  ) {
    // -----------------------------------------
    // 1. Validate payment method
    // -----------------------------------------

    if (
      data.payment_method !== "GCASH"
    ) {
      throw new BadRequestError(
        "Only GCash payment is currently supported."
      );
    }

    // -----------------------------------------
    // 2. Validate proof
    // -----------------------------------------

    if (!proof) {
      throw new BadRequestError(
        "Payment proof is required."
      );
    }

    // -----------------------------------------
    // 3. Find reservation
    // -----------------------------------------

    const reservation =
      await this.reservationRepository.findById(
        data.reservation_id
      );

    if (!reservation) {
      throw new NotFoundError(
        "Reservation not found."
      );
    }

    // -----------------------------------------
    // 4. Check ownership
    // -----------------------------------------

    if (
      reservation.user_id !== null &&
      reservation.user_id !== undefined &&
      userId !== null &&
      Number(reservation.user_id) !==
        Number(userId)
    ) {
      throw new BadRequestError(
        "You are not allowed to pay for this reservation."
      );
    }

    // -----------------------------------------
    // 5. Validate reservation amount
    // -----------------------------------------

    const amount = Number(
      reservation.total_amount
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new BadRequestError(
        "Invalid reservation amount."
      );
    }

    // -----------------------------------------
    // 6. Check existing payment
    // -----------------------------------------

    const existingPayment =
      await this.paymentRepository.findByReservationId(
        data.reservation_id
      );

    // Already paid
    if (
      existingPayment &&
      existingPayment.status === "Paid"
    ) {
      throw new BadRequestError(
        "This reservation has already been paid."
      );
    }

    // Already has pending payment
    if (
      existingPayment &&
      existingPayment.status === "Pending"
    ) {
      throw new BadRequestError(
        "A payment proof has already been submitted for this reservation."
      );
    }

    // -----------------------------------------
    // 7. Payment proof path
    // -----------------------------------------

    const paymentProof =
      `/uploads/payment-proofs/${proof.filename}`;

    // -----------------------------------------
    // 8. Create local payment
    // -----------------------------------------

    const payment =
      await this.paymentRepository.createPayment({
        reservation_id:
          data.reservation_id,

        amount,

        payment_method:
          "GCASH",

        payment_proof:
          paymentProof,

        status:
          "Pending",
      });

    // -----------------------------------------
    // 9. Return
    // -----------------------------------------

    return {
      payment,

      payment_proof:
        paymentProof,

      status:
        "Pending",
    };
  }

  /**
   * GET /api/payments/uuid/:uuid
   */
  async getByUuid(
    uuid: string
  ) {
    return this.paymentRepository.getByUuid(
      uuid
    );
  }

  /**
   * GET /api/payments/reservation/:reservationId
   */
  async getByReservation(
    reservationId: number
  ) {
    return this.paymentRepository.findByReservationId(
      reservationId
    );
  }
}