import { Request, Response } from "express";

import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";

import { CourtScheduleOverrideService } from "./courtScheduleOverride.service";

import {
  createCourtScheduleOverrideSchema,
  updateCourtScheduleOverrideSchema,
} from "./courtScheduleOverride.validator";

export class CourtScheduleOverrideController {
  private service =
    new CourtScheduleOverrideService();

  // ============================================================
  // CREATE OVERRIDE
  // ============================================================
  //
  // POST /api/court-schedule-overrides
  //
  create = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      // ========================================================
      // VALIDATE BODY
      // ========================================================

      const data =
        createCourtScheduleOverrideSchema.parse(
          req.body
        );

      // ========================================================
      // CREATE
      // ========================================================

      const override =
        await this.service.create(data);

      return ApiResponse.success(
        res,
        override,
        "Court schedule override created successfully.",
        201
      );
    }
  );

  // ============================================================
  // GET ALL OVERRIDES FOR COURT
  // ============================================================
  //
  // GET /api/court-schedule-overrides/court/:courtId
  //
  getByCourt = asyncHandler(
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

      const overrides =
        await this.service.getByCourt(
          courtId
        );

      return ApiResponse.success(
        res,
        overrides,
        "Court schedule overrides retrieved successfully."
      );
    }
  );

  // ============================================================
  // GET OVERRIDE BY COURT + DATE
  // ============================================================
  //
  // GET /api/court-schedule-overrides/court/:courtId/date/:date
  //
  // Example:
  //
  // /api/court-schedule-overrides/court/1/date/2026-08-20
  //
  getByCourtAndDate = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const courtId =
        Number(req.params.courtId);

      const scheduleDate =
        String(req.params.date);

      if (Number.isNaN(courtId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid court ID.",
        });
      }

      if (!scheduleDate) {
        return res.status(400).json({
          success: false,
          message:
            "Schedule date is required.",
        });
      }

      const override =
        await this.service.getByCourtAndDate(
          courtId,
          scheduleDate
        );

      return ApiResponse.success(
        res,
        override,
        "Court schedule override retrieved successfully."
      );
    }
  );

  // ============================================================
  // GET OVERRIDE BY ID
  // ============================================================
  //
  // GET /api/court-schedule-overrides/:id
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
          message:
            "Invalid schedule override ID.",
        });
      }

      const override =
        await this.service.getById(id);

      return ApiResponse.success(
        res,
        override,
        "Court schedule override retrieved successfully."
      );
    }
  );

  // ============================================================
  // UPDATE OVERRIDE
  // ============================================================
  //
  // PUT /api/court-schedule-overrides/:id
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
          message:
            "Invalid schedule override ID.",
        });
      }

      // ========================================================
      // VALIDATE BODY
      // ========================================================

      const data =
        updateCourtScheduleOverrideSchema.parse(
          req.body
        );

      // ========================================================
      // UPDATE
      // ========================================================

      const override =
        await this.service.update(
          id,
          data
        );

      return ApiResponse.success(
        res,
        override,
        "Court schedule override updated successfully."
      );
    }
  );

  // ============================================================
  // DELETE OVERRIDE
  // ============================================================
  //
  // DELETE /api/court-schedule-overrides/:id
  //
  delete = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const id =
        Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid schedule override ID.",
        });
      }

      const result =
        await this.service.delete(id);

      return ApiResponse.success(
        res,
        null,
        result.message
      );
    }
  );

  // ============================================================
  // GET ALL HOLIDAYS
  // ============================================================
  //
  // GET /api/court-schedule-overrides/holidays
  //

  getHolidays = asyncHandler(
    async (_req: Request, res: Response) => {
      const holidays =
        await this.service.getHolidays();

      return ApiResponse.success(
        res,
        holidays,
        "Holidays retrieved successfully."
      );
    }
  );

  // ============================================================
  // CREATE HOLIDAY
  // ============================================================
  //
  // POST /api/court-schedule-overrides/holidays
  //

  createHoliday = asyncHandler(
    async (req: Request, res: Response) => {
      const data =
        await this.service.createHoliday(
          req.body
        );

      return ApiResponse.success(
        res,
        data,
        "Holiday created successfully.",
        201
      );
    }
  );

  // ============================================================
  // DELETE HOLIDAY
  // ============================================================
  //
  // DELETE /api/court-schedule-overrides/holidays/:id
  //

  deleteHoliday = asyncHandler(
    async (req: Request, res: Response) => {
      const id =
        Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid holiday ID.",
        });
      }

      const result =
        await this.service.deleteHoliday(id);

      return ApiResponse.success(
        res,
        null,
        result.message
      );
    }
  );
  
}