import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { ApiResponse } from "../../../utils/apiResponse";
import { ReservationAvailabilityService } from "./service";

export class ReservationAvailabilityController {
  private availabilityService =
    new ReservationAvailabilityService();

  getAvailability = asyncHandler(
    async (req: Request, res: Response) => {
      const courtId = Number(req.query.court_id);
      const reservationDate =
        String(req.query.reservation_date || "");
      const durationHours =
        Number(req.query.duration_hours || 1);

      if (
        Number.isNaN(courtId) ||
        courtId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid court_id.",
        });
      }

      if (!reservationDate) {
        return res.status(400).json({
          success: false,
          message: "reservation_date is required.",
        });
      }

      if (
        Number.isNaN(durationHours) ||
        durationHours < 1 ||
        durationHours > 2
      ) {
        return res.status(400).json({
          success: false,
          message:
            "duration_hours must be between 1 and 2.",
        });
      }

      const availability =
        await this.availabilityService.getAvailability(
          courtId,
          reservationDate,
          durationHours
        );

      return ApiResponse.success(
        res,
        availability,
        "Availability retrieved successfully."
      );
    }
  );
}