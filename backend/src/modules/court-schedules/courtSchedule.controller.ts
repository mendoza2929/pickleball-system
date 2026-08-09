import { Request, Response } from "express";

import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";

import { CourtScheduleService } from "./courtSchedule.service";

import {
  updateCourtScheduleSchema,
} from "./courtSchedule.validator";

export class CourtScheduleController {
  private service =
    new CourtScheduleService();

  // =====================================================
  // GET ALL SCHEDULES FOR A COURT
  // =====================================================
  //
  // GET /api/court-schedules/court/:courtId
  //
  getCourtSchedules = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const courtId =
        Number(req.params.courtId);

      if (Number.isNaN(courtId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid court ID.",
        });
      }

      const schedules =
        await this.service.getCourtSchedules(
          courtId
        );

      return ApiResponse.success(
        res,
        schedules,
        "Court schedules retrieved successfully."
      );
    }
  );

  // =====================================================
  // GET SCHEDULE BY ID
  // =====================================================
  //
  // GET /api/court-schedules/:id
  //
  getById = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const id =
        Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid schedule ID.",
        });
      }

      const schedule =
        await this.service.getById(id);

      return ApiResponse.success(
        res,
        schedule,
        "Court schedule retrieved successfully."
      );
    }
  );

  // =====================================================
  // GET SCHEDULE BY COURT + DAY
  // =====================================================
  //
  // GET /api/court-schedules/court/:courtId/:day
  //
  // Example:
  //
  // /api/court-schedules/court/7/Friday
  //
  getByCourtAndDay = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const courtId =
        Number(req.params.courtId);

      // IMPORTANT:
      // Convert string | string[] into string
      const dayOfWeek =
        String(req.params.day);

      if (Number.isNaN(courtId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid court ID.",
        });
      }

      if (!dayOfWeek) {
        return res.status(400).json({
          success: false,
          message:
            "Day of week is required.",
        });
      }

      const schedule =
        await this.service.getByCourtAndDay(
          courtId,
          dayOfWeek
        );

      return ApiResponse.success(
        res,
        schedule,
        "Court schedule retrieved successfully."
      );
    }
  );

  // =====================================================
  // UPDATE COURT SCHEDULE
  // =====================================================
  //
  // PUT /api/court-schedules/:id
  //
  update = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const id =
        Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid schedule ID.",
        });
      }

      // =================================================
      // VALIDATE BODY
      // =================================================

      const data =
        updateCourtScheduleSchema.parse(
          req.body
        );

      // =================================================
      // UPDATE
      // =================================================

      const schedule =
        await this.service.update(
          id,
          data
        );

      return ApiResponse.success(
        res,
        schedule,
        "Court schedule updated successfully."
      );
    }
  );
}