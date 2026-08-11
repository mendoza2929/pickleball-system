import {
  Request,
  Response,
} from "express";

import {
  asyncHandler,
} from "../../shared/utils/asyncHandler";

import {
  ApiResponse,
} from "../../utils/apiResponse";

import {
  ReportService,
} from "./report.service";

import {
  reportOverviewSchema,
} from "./report.validator";


export class ReportController {

  private reportService =
    new ReportService();


  // =====================================================
  // REPORT OVERVIEW
  // =====================================================

  getOverview = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {

      const query =
        reportOverviewSchema.parse(
          req.query
        );


      const report =
        await this.reportService.getOverview(
          query.date_from,
          query.date_to
        );


      return ApiResponse.success(
        res,
        report,
        "Report overview retrieved successfully."
      );
    }
  );

}