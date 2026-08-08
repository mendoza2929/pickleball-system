import axios from "axios";

import { PaymentRepository } from "./payment.repository";
import { ReservationRepository } from "../reservations/reservation.repository";

import {
  CreatePaymentInput,
} from "./payment.validator";

import { BadRequestError } from "../../shared/errors/BadRequestError";
import { NotFoundError } from "../../shared/errors/NotFoundError";

const PAYMONGO_API_URL =
  "https://api.paymongo.com/v1";

export class PaymentService {
  private paymentRepository =
    new PaymentRepository();

  private reservationRepository =
    new ReservationRepository();

  /**
   * PayMongo authentication headers
   *
   * PayMongo uses Basic Authentication:
   *
   * username = secret key
   * password = empty
   */
  private getPayMongoHeaders() {
    const secretKey =
      process.env.PAYMONGO_SECRET_KEY;

    if (!secretKey) {
      throw new Error(
        "PAYMONGO_SECRET_KEY is not configured."
      );
    }

    const encoded =
      Buffer.from(
        `${secretKey}:`
      ).toString("base64");

    return {
      Authorization: `Basic ${encoded}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  /**
   * Create PayMongo Payment Intent
   */
  private async createPaymentIntent(
    amount: number,
    description: string
  ) {
    try {
      const response =
        await axios.post(
          `${PAYMONGO_API_URL}/payment_intents`,
          {
            data: {
              attributes: {
                amount: Math.round(
                  amount * 100
                ),

                currency: "PHP",

                payment_method_allowed: [
                  "gcash",
                ],

                description,
              },
            },
          },
          {
            headers:
              this.getPayMongoHeaders(),
          }
        );

      return response.data.data;
    } catch (error: any) {
      console.error(
        "========== PAYMONGO PAYMENT INTENT ERROR =========="
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      console.error(
        "==============================================="
      );

      throw new BadRequestError(
        error.response?.data?.errors?.[0]
          ?.detail ||
          error.response?.data?.message ||
          "Unable to create PayMongo payment."
      );
    }
  }

  /**
   * Create GCash Payment Method
   */
  private async createGCashPaymentMethod(
    reservation: any
  ) {
    try {
      const response =
        await axios.post(
          `${PAYMONGO_API_URL}/payment_methods`,
          {
            data: {
              attributes: {
                type: "gcash",

                billing: {
                  name:
                    reservation.guest_name ||
                    "Guest",

                  email:
                    reservation.guest_email ||
                    undefined,

                  phone:
                    reservation.guest_phone ||
                    undefined,
                },
              },
            },
          },
          {
            headers:
              this.getPayMongoHeaders(),
          }
        );

      return response.data.data;
    } catch (error: any) {
      console.error(
        "========== PAYMONGO GCASH ERROR =========="
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      console.error(
        "========================================"
      );

      throw new BadRequestError(
        error.response?.data?.errors?.[0]
          ?.detail ||
          error.response?.data?.message ||
          "Unable to create GCash payment method."
      );
    }
  }

  /**
   * Attach GCash Payment Method
   * to Payment Intent
   */
  private async attachPaymentMethod(
    paymentIntentId: string,
    paymentMethodId: string,
    returnUrl: string
  ) {
    try {
      const response =
        await axios.post(
          `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}/attach`,
          {
            data: {
              attributes: {
                payment_method:
                  paymentMethodId,

                return_url:
                  returnUrl,
              },
            },
          },
          {
            headers:
              this.getPayMongoHeaders(),
          }
        );

      return response.data.data;
    } catch (error: any) {
      console.error(
        "========== PAYMONGO ATTACH ERROR =========="
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      console.error(
        "=========================================="
      );

      throw new BadRequestError(
        error.response?.data?.errors?.[0]
          ?.detail ||
          error.response?.data?.message ||
          "Unable to start GCash payment."
      );
    }
  }

  /**
   * POST /api/payments
   *
   * Create GCash payment for reservation
   */
  async create(
    userId: number | null,
    data: CreatePaymentInput
  ) {
    console.log(
      "\n========== CREATE PAYMENT =========="
    );

    console.log(
      "Reservation ID:",
      data.reservation_id
    );

    console.log(
      "Payment method:",
      data.payment_method
    );

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
    // 2. Find reservation
    // -----------------------------------------

    console.log(
      "Finding reservation..."
    );

    const reservation =
      await this.reservationRepository.findById(
        data.reservation_id
      );

    console.log(
      "Reservation:",
      reservation
    );

    if (!reservation) {
      throw new NotFoundError(
        "Reservation not found."
      );
    }

    // -----------------------------------------
    // 3. Check ownership
    //
    // Guest reservation:
    // user_id = null
    //
    // Authenticated reservation:
    // make sure it belongs to user
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
    // 4. Validate reservation amount
    // -----------------------------------------

    const amount = Number(
      reservation.total_amount
    );

    console.log(
      "Payment amount:",
      amount
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
    // 5. Check existing payment
    // -----------------------------------------

    console.log(
      "Checking existing payment..."
    );

    const existingPayment =
      await this.paymentRepository.findByReservationId(
        data.reservation_id
      );

    console.log(
      "Existing payment:",
      existingPayment
    );

    /**
     * If there is already a paid payment,
     * don't create another one.
     */
    if (
      existingPayment &&
      existingPayment.payment_status ===
        "Paid"
    ) {
      throw new BadRequestError(
        "This reservation has already been paid."
      );
    }

    // -----------------------------------------
    // 6. Frontend return URL
    // -----------------------------------------

    const frontendUrl =
      process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw new Error(
        "FRONTEND_URL is not configured."
      );
    }

    const successUrl =
      `${frontendUrl}/reservation/success/${reservation.uuid}`;

    // -----------------------------------------
    // 7. Create PayMongo Payment Intent
    // -----------------------------------------

    console.log(
      "Creating PayMongo Payment Intent..."
    );

    const paymentIntent =
      await this.createPaymentIntent(
        amount,

        `Pickleball Reservation ${reservation.reservation_no}`
      );

    console.log(
      "Payment Intent:",
      paymentIntent.id
    );

    // -----------------------------------------
    // 8. Create GCash Payment Method
    // -----------------------------------------

    console.log(
      "Creating GCash Payment Method..."
    );

    const paymentMethod =
      await this.createGCashPaymentMethod(
        reservation
      );

    console.log(
      "Payment Method:",
      paymentMethod.id
    );

    // -----------------------------------------
    // 9. Attach GCash to Payment Intent
    // -----------------------------------------

    console.log(
      "Attaching GCash Payment Method..."
    );

    const attachedIntent =
      await this.attachPaymentMethod(
        paymentIntent.id,

        paymentMethod.id,

        successUrl
      );

    console.log(
      "Attached Payment Intent:",
      attachedIntent.id
    );

    // -----------------------------------------
    // 10. Get PayMongo redirect URL
    // -----------------------------------------

    const nextAction =
      attachedIntent.attributes
        ?.next_action;

    const redirectUrl =
      nextAction?.redirect?.url;

    console.log(
      "PayMongo redirect URL:",
      redirectUrl
    );

    if (!redirectUrl) {
      console.error(
        "PayMongo response:",
        JSON.stringify(
          attachedIntent,
          null,
          2
        )
      );

      throw new BadRequestError(
        "PayMongo did not return a GCash redirect URL."
      );
    }

    // -----------------------------------------
    // 11. Create local payment
    // -----------------------------------------

    console.log(
      "Creating local payment..."
    );

    const payment =
      await this.paymentRepository.createPayment({
        reservation_id:
          data.reservation_id,

        amount,

        payment_method:
          "GCash",

        status: "Pending",

        paymongo_payment_intent_id:
          paymentIntent.id,

        paymongo_payment_method_id:
          paymentMethod.id,
      });

    console.log(
      "Local payment created:",
      payment
    );

    // -----------------------------------------
    // 12. Return payment information
    // -----------------------------------------

    console.log(
      "========== PAYMENT READY ==========\n"
    );

    return {
      payment,

      checkout_url:
        redirectUrl,

      payment_intent_id:
        paymentIntent.id,

      payment_method_id:
        paymentMethod.id,
    };
  }

  /**
   * Get payment by PayMongo Payment Intent
   *
   * Useful for checking payment status.
   */
  async getPaymentStatus(
    paymentIntentId: string
  ) {
    try {
      const response =
        await axios.get(
          `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}`,
          {
            headers:
              this.getPayMongoHeaders(),
          }
        );

      const intent =
        response.data.data;

      return {
        id: intent.id,

        status:
          intent.attributes?.status,

        amount:
          intent.attributes?.amount,

        currency:
          intent.attributes?.currency,

        payment_method:
          intent.attributes
            ?.payment_method,

        next_action:
          intent.attributes
            ?.next_action,
      };
    } catch (error: any) {
      console.error(
        "PayMongo status error:",
        error.response?.data ||
          error.message
      );

      throw new BadRequestError(
        "Unable to retrieve PayMongo payment status."
      );
    }
  }
}