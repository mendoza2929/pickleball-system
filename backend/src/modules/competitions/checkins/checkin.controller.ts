import {
  Request,
  Response,
} from "express";

import {
  checkInPlayer,
  getCheckin,
  getDivisionCheckins,
  markNoShow,
  cancelCheckin,
} from "./checkin.service";

// --------------------------------------------------
// CHECK IN
// --------------------------------------------------

export async function create(
  req: Request,
  res: Response
) {
  try {
    const registrationId =
      Number(
        req.params.registrationId
      );

    if (
      !Number.isInteger(
        registrationId
      ) ||
      registrationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid registration ID",
      });
    }

    const data =
      await checkInPlayer(
        registrationId
      );

    return res.status(201).json({
      success: true,
      message:
        "Player checked in successfully",
      data,
    });
  } catch (error: any) {
    console.error(
      "Check-in error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to check in player",
    });
  }
}

// --------------------------------------------------
// GET ONE
// --------------------------------------------------

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
          "Invalid check-in ID",
      });
    }

    const data =
      await getCheckin(id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      "Get check-in error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Check-in not found",
    });
  }
}

// --------------------------------------------------
// GET BY DIVISION
// --------------------------------------------------

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
      await getDivisionCheckins(
        divisionId
      );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      "Get division check-ins error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch check-ins",
    });
  }
}

// --------------------------------------------------
// MARK NO SHOW
// --------------------------------------------------

export async function noShow(
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
          "Invalid check-in ID",
      });
    }

    const data =
      await markNoShow(id);

    return res.status(200).json({
      success: true,
      message:
        "Player marked as no-show",
      data,
    });
  } catch (error: any) {
    console.error(
      "No-show error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to mark player as no-show",
    });
  }
}

// --------------------------------------------------
// CANCEL CHECK-IN
// --------------------------------------------------

export async function cancel(
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
          "Invalid check-in ID",
      });
    }

    const data =
      await cancelCheckin(id);

    return res.status(200).json({
      success: true,
      message:
        "Check-in cancelled successfully",
      data,
    });
  } catch (error: any) {
    console.error(
      "Cancel check-in error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to cancel check-in",
    });
  }
}