import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authenticate";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";


import { ReservationService } from "./reservation.service";
import {
  createReservationSchema,
  createWalkInReservationSchema,
} from "./reservation.validator";

export class ReservationController {
  private reservationService = new ReservationService();

  /**
   * POST /api/reservations
   */
  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = createReservationSchema.parse(req.body);

    const reservation =
    await this.reservationService.create(
      req.user?.id ?? null,
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
     /**
     * GET /api/reservations/:id
     */
    getById = asyncHandler(
      async (
        req: AuthRequest,
        res: Response
      ) => {
        const id = Number(req.params.id);

        // Validate reservation ID
        if (Number.isNaN(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid reservation ID.",
          });
        }

        // User must be authenticated
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: "Authentication required.",
          });
        }

        const userId = req.user.id;
        const roleName = req.user.role_name;

        // User role is required
        if (!roleName) {
          return res.status(403).json({
            success: false,
            message: "User role is required.",
          });
        }

        // Get reservation
        const reservation =
          await this.reservationService.getById(
            id,
            userId,
            roleName
          );

        return ApiResponse.success(
          res,
          reservation,
          "Reservation retrieved successfully."
        );
      }
    );

    getByUuid = asyncHandler(async (req: Request, res: Response) => {
      const uuid = req.params.uuid as string;

      const reservation =
        await this.reservationService.getByUuid(uuid);

      return ApiResponse.success(
        res,
        reservation,
        "Reservation retrieved successfully."
      );
    });

  /**
   * PATCH /api/reservations/:id/cancel
   */
  cancel = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = Number(req.params.id);

      const reservation =
        await this.reservationService.cancel(
          id,
          req.user!.id
        );

      return ApiResponse.success(
        res,
        reservation,
        "Reservation cancelled successfully."
      );
    }
  );

  updateStatus = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reservation ID.",
        });
      }

      const reservation =
        await this.reservationService.updateStatus(
          id,
          req.body
        );

      return ApiResponse.success(
        res,
        reservation,
        "Reservation status updated successfully."
      );
    }
  );

  createWalkIn = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const data =
        createWalkInReservationSchema.parse(
          req.body
        );

      const reservation =
        await this.reservationService.createWalkIn(
          data
        );

      return ApiResponse.success(
        res,
        reservation,
        "Walk-in reservation created successfully.",
        201
      );
    }
  );
}