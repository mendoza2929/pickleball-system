import { Request, Response } from "express";

import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";

import { CourtScheduleService } from "./courtSchedule.service";

import {
  createCourtScheduleSchema,
  updateCourtScheduleSchema,
} from "./courtSchedule.validator";

export class CourtScheduleController {
  private courtScheduleService = new CourtScheduleService();

  /**
   * POST /api/court-schedules
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const data = createCourtScheduleSchema.parse(req.body);

    const schedule =
      await this.courtScheduleService.createSchedule(data);

    return ApiResponse.success(
      res,
      schedule,
      "Court schedule created successfully.",
      201
    );
  });

  /**
   * GET /api/court-schedules
   */
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const schedules =
      await this.courtScheduleService.getSchedules();

    return ApiResponse.success(
      res,
      schedules,
      "Court schedules retrieved successfully."
    );
  });

  /**
   * GET /api/court-schedules/court/:courtId
   */
  getByCourt = asyncHandler(async (req: Request, res: Response) => {
    const courtId = Number(req.params.courtId);

    const schedules =
      await this.courtScheduleService.getCourtSchedules(
        courtId
      );

    return ApiResponse.success(
      res,
      schedules,
      "Court schedules retrieved successfully."
    );
  });

  /**
   * PUT /api/court-schedules/:id
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const data = updateCourtScheduleSchema.parse(req.body);

    const schedule =
      await this.courtScheduleService.updateSchedule(
        id,
        data
      );

    return ApiResponse.success(
      res,
      schedule,
      "Court schedule updated successfully."
    );
  });

  /**
   * DELETE /api/court-schedules/:id
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const result =
      await this.courtScheduleService.deleteSchedule(id);

    return ApiResponse.success(
      res,
      result,
      result.message
    );
  });
}