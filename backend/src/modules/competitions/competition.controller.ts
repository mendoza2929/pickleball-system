import {
  Request,
  Response,
} from "express";

import {
  getCompetitions,
  getCompetition,
  createNewCompetition,
  editCompetition,
} from "./competition.service";

// ==================================================
// GET ALL
// ==================================================

export async function getAll(
  req: Request,
  res: Response
) {
  try {
    const data =
      await getCompetitions();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Get competitions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch competitions",
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
          "Invalid competition ID",
      });
    }

    const data =
      await getCompetition(id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Competition not found",
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
    // --------------------------------------------
    // Get authenticated admin/user
    // --------------------------------------------

    const userId =
      Number(
        (req as any).user?.id
      );

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user is required",
      });
    }

    const {
      name,
      type,
      startAt,
      endAt,
      registrationStartAt,
      registrationEndAt,
      description,
    } = req.body;

    // --------------------------------------------
    // Create
    // --------------------------------------------

    const data =
      await createNewCompetition({
        name,
        type,
        startAt,
        endAt,
        registrationStartAt,
        registrationEndAt,
        description,

        // IMPORTANT
        createdBy: userId,
      });

    return res.status(201).json({
      success: true,
      message:
        "Competition created successfully",
      data,
    });
  } catch (error: any) {
    console.error(
      "Create competition error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create competition",
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
          "Invalid competition ID",
      });
    }

    const data =
      await editCompetition(
        id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Competition updated successfully",
      data,
    });
  } catch (error: any) {
    console.error(
      "Update competition error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update competition",
    });
  }
}