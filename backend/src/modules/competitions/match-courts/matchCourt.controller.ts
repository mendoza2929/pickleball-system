import {
  Request,
  Response,
} from "express";

import {
  assignAvailableCourt,
  assignCourt,
  unassignCourt,
} from "./matchCourt.service";

// ==================================================
// AUTO ASSIGN COURT
// ==================================================

export async function autoAssign(
  req: Request,
  res: Response
) {
  try {
    const matchId =
      Number(req.params.matchId);

    if (
      !Number.isInteger(matchId) ||
      matchId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid match ID",
      });
    }

    const data =
      await assignAvailableCourt(
        matchId
      );

    return res.status(200).json({
      success: true,
      message:
        "Court assigned successfully",
      data,
    });
  } catch (error: any) {
    console.error(
      "Auto assign court error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ??
        "Failed to assign court",
    });
  }
}

// ==================================================
// MANUAL ASSIGN COURT
// ==================================================

export async function assign(
  req: Request,
  res: Response
) {
  try {
    const matchId =
      Number(req.params.matchId);

    const courtId =
      Number(req.body.courtId);

    if (
      !Number.isInteger(matchId) ||
      matchId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid match ID",
      });
    }

    if (
      !Number.isInteger(courtId) ||
      courtId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid court ID",
      });
    }

    const data =
      await assignCourt(
        matchId,
        courtId
      );

    return res.status(200).json({
      success: true,
      message:
        "Court assigned successfully",
      data,
    });
  } catch (error: any) {
    console.error(
      "Assign court error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ??
        "Failed to assign court",
    });
  }
}

// ==================================================
// REMOVE COURT
// ==================================================

export async function remove(
  req: Request,
  res: Response
) {
  try {
    const matchId =
      Number(req.params.matchId);

    if (
      !Number.isInteger(matchId) ||
      matchId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid match ID",
      });
    }

    const data =
      await unassignCourt(
        matchId
      );

    return res.status(200).json({
      success: true,
      message:
        "Court removed from match",
      data,
    });
  } catch (error: any) {
    console.error(
      "Remove court error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ??
        "Failed to remove court",
    });
  }
}