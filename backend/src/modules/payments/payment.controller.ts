import { Request, Response } from "express";

import { AuthRequest } from "../../middleware/authenticate";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";

import { PaymentService } from "./payment.service";
import { createPaymentSchema } from "./payment.validator";

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService =
      new PaymentService();
  }

  /**
   * POST /api/payments
   *
   * Create GCash payment
   *
   * multipart/form-data
   *
   * reservation_id
   * payment_method
   * proof
   */
  create = asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {
      // -----------------------------------------
      // Validate body
      // -----------------------------------------

      const data =
        createPaymentSchema.parse(
          req.body
        );

      // -----------------------------------------
      // Validate uploaded proof
      // -----------------------------------------

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Payment proof is required.",
        });
      }

      // -----------------------------------------
      // Create payment
      // -----------------------------------------

      const result =
        await this.paymentService.create(
          req.user?.id ?? null,
          data,
          req.file
        );

      return ApiResponse.success(
        res,
        result,
        "Payment proof uploaded successfully.",
        201
      );
    }
  );

  /**
   * GET /api/payments/uuid/:uuid
   *
   * Public payment lookup
   */
  getByUuid = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const uuid =
        req.params.uuid as string;

      const payment =
        await this.paymentService.getByUuid(
          uuid
        );

      return ApiResponse.success(
        res,
        payment,
        "Payment retrieved successfully."
      );
    }
  );

  /**
   * GET /api/payments/reservation/:reservationId
   *
   * Get payment for reservation
   */
  getByReservation =
    asyncHandler(
      async (
        req: AuthRequest,
        res: Response
      ) => {
        if (!req.user?.id) {
          return res.status(401).json({
            success: false,
            message:
              "Authentication required.",
          });
        }

        const reservationId =
          Number(
            req.params.reservationId
          );

        if (
          !Number.isInteger(
            reservationId
          ) ||
          reservationId <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid reservation ID.",
          });
        }

        const payment =
          await this.paymentService.getByReservation(
            reservationId
          );

        return ApiResponse.success(
          res,
          payment,
          "Payment retrieved successfully."
        );
      }
    );
}