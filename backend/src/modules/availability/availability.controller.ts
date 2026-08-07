import { Request, Response } from "express";

import { AvailabilityService } from "./availability.service";

import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";

export class AvailabilityController {
  private availabilityService =
    new AvailabilityService();

  /**
   * GET /api/availability
   *
   * Query:
   * ?courtId=1
   * &date=2026-08-15
   */
  getAvailability = asyncHandler(
    async (req: Request, res: Response) => {
      const courtId = Number(req.query.courtId);

      const date = String(req.query.date);

      const result =
        await this.availabilityService.getAvailability(
          courtId,
          date
        );

      return ApiResponse.success(
        res,
        result,
        "Availability retrieved successfully."
      );
    }
  );
}