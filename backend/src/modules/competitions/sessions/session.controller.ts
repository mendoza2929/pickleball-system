import {
  Request,
  Response,
} from "express";

import {
  createOpenPlaySession,
  getSession,
  getDivisionSession,
  updateSession,
} from "./session.service";

// ==================================================
// CREATE SESSION
// ==================================================

export async function create(
  req: Request,
  res: Response
) {
  try {
    const divisionId =
      Number(
        req.params.divisionId
      );

    if (
      !Number.isInteger(
        divisionId
      ) ||
      divisionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid division ID",
      });
    }

    const data =
      await createOpenPlaySession(
        divisionId
      );

    return res.status(201).json({
      success: true,
      message:
        "Open Play session created successfully",
      data,
    });

  } catch (error: any) {
    console.error(
      "Create session error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create Open Play session",
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
      Number(
        req.params.id
      );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid session ID",
      });
    }

    const data =
      await getSession(id);

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error: any) {
    console.error(
      "Get session error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Open Play session not found",
    });
  }
}

// ==================================================
// GET BY DIVISION
// ==================================================

export async function getByDivision(
  req: Request,
  res: Response
) {
  try {
    const divisionId =
      Number(
        req.params.divisionId
      );

    if (
      !Number.isInteger(
        divisionId
      ) ||
      divisionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid division ID",
      });
    }

    const data =
      await getDivisionSession(
        divisionId
      );

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error: any) {
    console.error(
      "Get division session error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Failed to get session",
    });
  }
}

// ==================================================
// UPDATE SESSION
// ==================================================

export async function update(
  req: Request,
  res: Response
) {
  try {
    const id =
      Number(
        req.params.id
      );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid session ID",
      });
    }

    const {
      status,
    } = req.body;

    if (
      typeof status !== "string" ||
      !status.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Session status is required",
      });
    }

    const data =
      await updateSession(
        id,
        {
          status:
            status.trim() as any,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Open Play session updated successfully",
      data,
    });

  } catch (error: any) {
    console.error(
      "Update session error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update session",
    });
  }
}