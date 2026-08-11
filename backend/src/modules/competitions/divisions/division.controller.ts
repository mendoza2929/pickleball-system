import {
  Request,
  Response,
} from "express";

import {
  getDivisionsByCompetition,
  getDivision,
  createNewDivision,
  editDivision,
} from "./division.service";

// ==================================================
// GET DIVISIONS BY COMPETITION
// ==================================================

export async function getByCompetition(
  req: Request,
  res: Response
) {
  try {
    const competitionId =
      Number(
        req.params.competitionId
      );

    if (
      !Number.isInteger(
        competitionId
      ) ||
      competitionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid competition ID",
      });
    }

    const data =
      await getDivisionsByCompetition(
        competitionId
      );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      "Get competition divisions error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch divisions",
    });
  }
}

// ==================================================
// GET ONE
// ==================================================

export async function getOne(
  req: Request,
  res: Response
) {
  try {
    const id =
      Number(req.params.id);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid division ID",
      });
    }

    const data =
      await getDivision(id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Division not found",
    });
  }
}

// ==================================================
// CREATE
// ==================================================

export async function create(
  req: Request,
  res: Response
) {
  try {
    const competitionId =
      Number(
        req.params.competitionId
      );

    if (
      !Number.isInteger(
        competitionId
      ) ||
      competitionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid competition ID",
      });
    }

    const {
      name,
      skillLevel,
      format,
      maxPlayers,
      entryFee,
      status,
    } = req.body;

    const data =
      await createNewDivision({
        competitionId,
        name,
        skillLevel,
        format,

        maxPlayers:
          maxPlayers !==
          undefined &&
          maxPlayers !== null &&
          maxPlayers !== ""
            ? Number(maxPlayers)
            : null,

        entryFee:
          entryFee !==
            undefined &&
          entryFee !== ""
            ? Number(entryFee)
            : 0,

        status:
          status ?? "open",
      });

    return res.status(201).json({
      success: true,
      message:
        "Division created successfully",
      data,
    });
  } catch (error: any) {
    console.error(
      "Create division error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create division",
    });
  }
}

// ==================================================
// UPDATE
// ==================================================

export async function update(
  req: Request,
  res: Response
) {
  try {
    const id =
      Number(req.params.id);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid division ID",
      });
    }

    const data =
      await editDivision(
        id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Division updated successfully",
      data,
    });
  } catch (error: any) {
    console.error(
      "Update division error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update division",
    });
  }
}