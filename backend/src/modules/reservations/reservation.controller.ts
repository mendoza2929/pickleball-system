import { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { AuthRequest } from "../../middleware/authenticate";

import { ReservationService } from "./reservation.service";
import {
  createReservationSchema,
} from "./reservation.validator";

export class ReservationController {
  private reservationService = new ReservationService();

  /**
   * POST /api/reservations
   */
  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = createReservationSchema.parse(req.body);

    const reservation = await this.reservationService.create(
      req.user!.id,
      data
    );

    return ApiResponse.success(
      res,
      reservation,
      "Reservation created successfully.",
      201
    );
  });

  /**
   * GET /api/reservations
   */
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const reservations = await this.reservationService.getAll();

    return ApiResponse.success(
      res,
      reservations,
      "Reservations retrieved successfully."
    );
  });

  /**
   * GET /api/reservations/me
   */
  getMyReservations = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const reservations =
        await this.reservationService.getMyReservations(
          req.user!.id
        );

      return ApiResponse.success(
        res,
        reservations,
        "My reservations retrieved successfully."
      );
    }
  );

  /**
   * GET /api/reservations/:id
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const reservation =
      await this.reservationService.getById(id);

    return ApiResponse.success(
      res,
      reservation,
      "Reservation retrieved successfully."
    );
  });

  /**
   * PATCH /api/reservations/:id/cancel
   */
  cancel = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const reservation =
      await this.reservationService.cancel(id);

    return ApiResponse.success(
      res,
      reservation,
      "Reservation cancelled successfully."
    );
  });
}