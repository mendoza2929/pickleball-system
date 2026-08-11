import {
  Request,
  Response,
} from "express";

import {
  registerPlayer,
  registerPublicPlayer,
  getDivisionRegistrations,
  getRegistration,
  updateRegistration,
  cancelRegistration,
  verifyRegistrationPayment,
} from "./registration.service";

// ==================================================
// PUBLIC REGISTRATION
// ==================================================

export async function publicRegister(
  req: Request,
  res: Response
) {
  try {
    const divisionId =
      Number(req.params.divisionId);

    // ----------------------------------------------
    // Validate division ID
    // ----------------------------------------------

    if (
      !Number.isInteger(divisionId) ||
      divisionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid division ID",
      });
    }

    // ----------------------------------------------
    // Request body
    // ----------------------------------------------

    const {
      firstName,
      lastName,
      email,
      phone,
      skillLevel,
      paymentMethod,
    } = req.body;

    // ----------------------------------------------
    // Payment proof
    // ----------------------------------------------

    const paymentProof =
      req.file;

    // ----------------------------------------------
    // Validate first name
    // ----------------------------------------------

    if (
      typeof firstName !== "string" ||
      !firstName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "First name is required",
      });
    }

    // ----------------------------------------------
    // Validate last name
    // ----------------------------------------------

    if (
      typeof lastName !== "string" ||
      !lastName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Last name is required",
      });
    }

    // ----------------------------------------------
    // Validate email
    // ----------------------------------------------

    if (
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email is required",
      });
    }

    // ----------------------------------------------
    // Validate skill level
    // ----------------------------------------------

    if (
      typeof skillLevel !== "string" ||
      !skillLevel.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Skill level is required",
      });
    }

    // ----------------------------------------------
    // Validate payment method
    // ----------------------------------------------

    if (
      paymentMethod !== "GCASH"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "GCash payment is required",
      });
    }

    // ----------------------------------------------
    // Validate payment proof
    // ----------------------------------------------

    if (!paymentProof) {
      return res.status(400).json({
        success: false,
        message:
          "GCash payment proof is required",
      });
    }

    // ----------------------------------------------
    // Payment proof URL
    // ----------------------------------------------

    const paymentProofUrl =
      `/uploads/payment-proofs/${paymentProof.filename}`;

    // ----------------------------------------------
    // Register public player
    // ----------------------------------------------

    const data =
      await registerPublicPlayer({
        divisionId,

        firstName:
          firstName.trim(),

        lastName:
          lastName.trim(),

        email:
          email.trim(),

        phone:
          typeof phone === "string" &&
          phone.trim()
            ? phone.trim()
            : null,

        skillLevel:
          skillLevel.trim(),

        paymentMethod:
          "GCASH",

        paymentProofUrl,
      });

    return res.status(201).json({
      success: true,

      message:
        "Registration submitted successfully. Your payment is pending confirmation.",

      data,
    });

  } catch (error: any) {
    console.error(
      "Public registration error:",
      error
    );

    return res.status(400).json({
      success: false,

      message:
        error.message ||
        "Failed to register player",
    });
  }
}
// ==================================================
// CREATE REGISTRATION
// ADMIN
// ==================================================

export async function create(
  req: Request,
  res: Response
) {
  try {
    const competitionDivisionId =
      Number(req.params.divisionId);

    const competitionPlayerId =
      Number(
        req.body.competitionPlayerId
      );

    // ----------------------------------------------
    // Validate division ID
    // ----------------------------------------------

    if (
      !Number.isInteger(
        competitionDivisionId
      ) ||
      competitionDivisionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid division ID",
      });
    }

    // ----------------------------------------------
    // Validate competition player ID
    // ----------------------------------------------

    if (
      !Number.isInteger(
        competitionPlayerId
      ) ||
      competitionPlayerId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid competition player ID",
      });
    }

    // ----------------------------------------------
    // Register
    // ----------------------------------------------

    const data =
      await registerPlayer(
        competitionDivisionId,
        competitionPlayerId
      );

    return res.status(201).json({
      success: true,
      message:
        "Player registered successfully",
      data,
    });
  } catch (error: any) {
    console.error(
      "Create registration error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to register player",
    });
  }
}

// ==================================================
// GET REGISTRATIONS BY DIVISION
// ==================================================

export async function getByDivision(
  req: Request,
  res: Response
) {
  try {
    const divisionId =
      Number(req.params.divisionId);

    if (
      !Number.isInteger(divisionId) ||
      divisionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid division ID",
      });
    }

    const data =
      await getDivisionRegistrations(
        divisionId
      );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      "Get division registrations error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch registrations",
    });
  }
}

// ==================================================
// GET ONE REGISTRATION
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
          "Invalid registration ID",
      });
    }

    const data =
      await getRegistration(id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      "Get registration error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Registration not found",
    });
  }
}

// ==================================================
// UPDATE REGISTRATION
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
          "Invalid registration ID",
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
          "Registration status is required",
      });
    }

    const data =
      await updateRegistration(
        id,
        {
          status:
            status.trim() as any,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Registration updated successfully",
      data,
    });
  } catch (error: any) {
    console.error(
      "Update registration error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update registration",
    });
  }
}



// ==================================================
// CANCEL REGISTRATION
// ==================================================

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
          "Invalid registration ID",
      });
    }

    const data =
      await cancelRegistration(id);

    return res.status(200).json({
      success: true,
      message:
        "Registration cancelled successfully",
      data,
    });
  } catch (error: any) {
    console.error(
      "Cancel registration error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to cancel registration",
    });
  }
}

// ==================================================
// VERIFY PAYMENT
// ==================================================

export async function verifyPayment(
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
          "Invalid registration ID",
      });
    }

    const {
      paymentStatus,
    } = req.body;

    if (
      ![
        "pending",
        "confirmed",
        "rejected",
      ].includes(paymentStatus)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment status",
      });
    }

    const data =
      await verifyRegistrationPayment(
        id,
        paymentStatus
      );

    return res.status(200).json({
      success: true,

      message:
        paymentStatus === "confirmed"
          ? "Payment verified successfully"
          : paymentStatus === "rejected"
            ? "Payment rejected successfully"
            : "Payment reset to pending",

      data,
    });

  } catch (error: any) {
    console.error(
      "Verify payment error:",
      error
    );

    return res.status(400).json({
      success: false,

      message:
        error.message ||
        "Failed to verify payment",
    });
  }
}