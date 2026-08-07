import { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";

import { PaymentService } from "./payment.service";
import { createPaymentSchema } from "./payment.validator";

export class PaymentController {
  private paymentService = new PaymentService();

  /**
   * POST /api/payments
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const data = createPaymentSchema.parse(req.body);

    const payment = await this.paymentService.create(data);

    return ApiResponse.success(
      res,
      payment,
      "Payment created successfully.",
      201
    );
  });

  /**
   * GET /api/payments
   */
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const payments = await this.paymentService.getAll();

    return ApiResponse.success(
      res,
      payments,
      "Payments retrieved successfully."
    );
  });

  /**
   * PATCH /api/payments/:id/pay
   */
  markPaid = asyncHandler(async (req: Request, res: Response) => {
    const paymentId = Number(req.params.id);

    const { reference_no } = req.body;

    const payment =
      await this.paymentService.markPaid(
        paymentId,
        reference_no
      );

    return ApiResponse.success(
      res,
      payment,
      "Payment completed successfully."
    );
  });
}