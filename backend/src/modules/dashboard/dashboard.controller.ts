import { Response } from "express";

import { AuthRequest } from "../../middleware/authenticate";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";

import { DashboardService } from "./dashboard.service";

export class DashboardController {
  private dashboardService =
    new DashboardService();

  /**
   * GET /api/dashboard
   */
  getDashboard = asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {
      const dashboard =
        await this.dashboardService.getDashboard();

      return ApiResponse.success(
        res,
        dashboard,
        "Dashboard retrieved successfully."
      );
    }
  );
}