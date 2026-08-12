import { Request, Response } from "express";

import {
  asyncHandler,
} from "../../../shared/utils/asyncHandler";

import {
  CourtAllocationService,
} from "./courtAllocation.service";

import {
  createCourtAllocationSchema,
  updateCourtAllocationSchema,
} from "./courtAllocation.validator";

export class CourtAllocationController {
  private service =
    new CourtAllocationService();

  // ==================================================
  // GET ALL ALLOCATIONS
  // ==================================================

  getAllocations = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const competitionId = Number(
        req.params.competitionId
      );

      if (
        !Number.isInteger(competitionId) ||
        competitionId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid competition ID.",
        });
      }

      const allocations =
        await this.service.getAllocations(
          competitionId
        );

      return res.status(200).json({
        success: true,
        data: allocations,
      });
    }
  );

  // ==================================================
  // GET AVAILABLE COURTS
  // ==================================================

  getAvailableCourts = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      // IMPORTANT:
      // competitionId comes from the parent route.
      //
      // /api/competitions/:competitionId/
      // court-allocations/available

      const competitionId = Number(
        req.params.competitionId
      );

      if (
        !Number.isInteger(competitionId) ||
        competitionId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid competition ID.",
        });
      }

      const date = String(
        req.query.date ?? ""
      );

      const startTime = String(
        req.query.start_time ?? ""
      );

      const endTime = String(
        req.query.end_time ?? ""
      );

      if (
        !date ||
        !startTime ||
        !endTime
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Date, start time, and end time are required.",
        });
      }

      const courts =
        await this.service.getAvailableCourts(
          competitionId,
          date,
          startTime,
          endTime
        );

      return res.status(200).json({
        success: true,
        data: courts,
      });
    }
  );

  // ==================================================
  // GET BY ID
  // ==================================================

  getAllocation = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const id = Number(
        req.params.id
      );

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid allocation ID.",
        });
      }

      const allocation =
        await this.service.getAllocation(
          id
        );

      return res.status(200).json({
        success: true,
        data: allocation,
      });
    }
  );

  // ==================================================
  // CREATE
  // ==================================================

  create = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      // IMPORTANT:
      // Do NOT trust competition_id
      // from request body.

      const competitionId = Number(
        req.params.competitionId
      );

      if (
        !Number.isInteger(competitionId) ||
        competitionId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid competition ID.",
        });
      }

      const parsed =
        createCourtAllocationSchema.parse(
          req.body
        );

      const data = {
        ...parsed,
        competition_id:
          competitionId,
      };

      const allocation =
        await this.service.createAllocation(
          data
        );

      return res.status(201).json({
        success: true,
        message:
          "Court allocated successfully.",
        data: allocation,
      });
    }
  );

  // ==================================================
  // UPDATE
  // ==================================================

  update = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const id = Number(
        req.params.id
      );

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid allocation ID.",
        });
      }

      const data =
        updateCourtAllocationSchema.parse(
          req.body
        );

      const allocation =
        await this.service.updateAllocation(
          id,
          data
        );

      return res.status(200).json({
        success: true,
        message:
          "Court allocation updated successfully.",
        data: allocation,
      });
    }
  );

  // ==================================================
  // RELEASE
  // ==================================================

  release = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const id = Number(
        req.params.id
      );

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid allocation ID.",
        });
      }

      const allocation =
        await this.service.releaseAllocation(
          id
        );

      return res.status(200).json({
        success: true,
        message:
          "Court allocation released successfully.",
        data: allocation,
      });
    }
  );
}