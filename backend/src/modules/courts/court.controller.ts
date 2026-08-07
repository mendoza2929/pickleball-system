import { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { CourtService } from "./court.service";
import { ApiResponse } from "../../utils/apiResponse";
import {
  createCourtSchema,
  updateCourtSchema,
} from "./court.validator";

export class CourtController {
  private courtService = new CourtService();

  /**
   * POST /api/courts
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const data = createCourtSchema.parse(req.body);

    const court = await this.courtService.createCourt(data);
        return ApiResponse.success(
        res,
        court,
        "Court created successfully.",
        201
        );
  });

  /**
   * GET /api/courts
   */
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const courts = await this.courtService.getAllCourts();

    return res.status(200).json({
      success: true,
      data: courts,
    });
  });

  /**
   * GET /api/courts/:id
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const court = await this.courtService.getCourtById(id);

    return res.status(200).json({
      success: true,
      data: court,
    });
  });

  /**
   * PUT /api/courts/:id
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const data = updateCourtSchema.parse(req.body);

    const court = await this.courtService.updateCourt(id, data);

    return res.status(200).json({
      success: true,
      message: "Court updated successfully.",
      data: court,
    });
  });

  /**
   * DELETE /api/courts/:id
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const result = await this.courtService.deleteCourt(id);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  });
}