import {
  Request,
  Response,
} from "express";

import {
  AuthRequest,
} from "../../middleware/authenticate";

import {
  asyncHandler,
} from "../../shared/utils/asyncHandler";

import {
  ApiResponse,
} from "../../utils/apiResponse";

import {
  ReservationService,
} from "./reservation.service";

import {
  createReservationSchema,
  createWalkInReservationSchema,
} from "./reservation.validator";


export class ReservationController {

  private reservationService =
    new ReservationService();


  // =====================================================
  // CREATE ONLINE RESERVATION
  // =====================================================

  create = asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {

      const data =
        createReservationSchema.parse(
          req.body
        );

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
    }
  );


  // =====================================================
  // GET ALL
  // =====================================================

  getAll = asyncHandler(
    async (
      _req: Request,
      res: Response
    ) => {

      const reservations =
        await this.reservationService.getAll();

      return ApiResponse.success(
        res,
        reservations,
        "Reservations retrieved successfully."
      );
    }
  );


  // =====================================================
  // MY RESERVATIONS
  // =====================================================

  getMyReservations = asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {

      const reservations =
        await this.reservationService
          .getMyReservations(
            req.user!.id
          );

      return ApiResponse.success(
        res,
        reservations,
        "My reservations retrieved successfully."
      );
    }
  );


  // =====================================================
  // GET BY ID
  // =====================================================

  getById = asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {

      const id =
        Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid reservation ID.",
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const roleName =
        req.user.role_name;

      if (!roleName) {
        return res.status(403).json({
          success: false,
          message:
            "User role is required.",
        });
      }

      const reservation =
        await this.reservationService
          .getById(
            id,
            req.user.id,
            roleName
          );

      return ApiResponse.success(
        res,
        reservation,
        "Reservation retrieved successfully."
      );
    }
  );


  // =====================================================
  // GET BY UUID
  // =====================================================

  getByUuid = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {

      const uuid = String(req.params.uuid);

      const reservation =
        await this.reservationService.getByUuid(
          uuid
        );

      return ApiResponse.success(
        res,
        reservation,
        "Reservation retrieved successfully."
      );
    }
  );


  // =====================================================
  // CANCEL
  // =====================================================

  cancel = asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {

      const id =
        Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid reservation ID.",
        });
      }

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


  // =====================================================
  // UPDATE STATUS
  // =====================================================

  updateStatus = asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {

      const id =
        Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid reservation ID.",
        });
      }

      const reservation =
        await this.reservationService
          .updateStatus(
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


  // =====================================================
  // WALK-IN
  // =====================================================

  createWalkIn = asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {

      const data =
        createWalkInReservationSchema.parse(
          req.body
        );

      const reservation =
        await this.reservationService
          .createWalkIn(data);

      return ApiResponse.success(
        res,
        reservation,
        "Walk-in reservation created successfully.",
        201
      );
    }
  );
}