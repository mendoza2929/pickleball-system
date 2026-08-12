import {
  Request,
  Response,
} from "express";

import {
  AvailabilityService,
} from "./availability.service";

import {
  asyncHandler,
} from "../../shared/utils/asyncHandler";

import {
  ApiResponse,
} from "../../utils/apiResponse";

import {
  availabilityQuerySchema,
} from "./availability.validator";

export class AvailabilityController {
  private availabilityService =
    new AvailabilityService();

  /**
   * GET /api/availability
   *
   * Query:
   *
   * ?courtId=8
   * &date=2026-08-31
   */

  getAvailability =
    asyncHandler(
      async (
        req: Request,
        res: Response
      ) => {
        // ------------------------------------
        // Validate Query
        // ------------------------------------

        const query =
          availabilityQuerySchema.parse(
            req.query
          );

        // ------------------------------------
        // Get Availability
        // ------------------------------------

        const result =
          await this.availabilityService
            .getAvailability(
              query.courtId,
              query.date
            );

        // ------------------------------------
        // Response
        // ------------------------------------

        return ApiResponse.success(
          res,
          result,
          "Availability retrieved successfully."
        );
      }
    );
}