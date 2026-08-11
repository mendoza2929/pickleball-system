import {
  Request,
  Response,
} from "express";

import {
  createNextOpenPlayMatch,
} from "./open-play.service";

// --------------------------------------------------
// CREATE NEXT OPEN PLAY MATCH
// --------------------------------------------------

export async function createNextMatch(
  req: Request,
  res: Response
) {
  try {
    const sessionId =
      Number(req.params.sessionId);

    // ------------------------------------------------
    // Validate session ID
    // ------------------------------------------------

    if (
      !Number.isInteger(sessionId) ||
      sessionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid session ID",
      });
    }

    // ------------------------------------------------
    // Create next match
    // ------------------------------------------------

    const result =
      await createNextOpenPlayMatch(
        sessionId
      );

    // ------------------------------------------------
    // Not enough players
    // ------------------------------------------------

    if (!result.created) {
      return res.status(200).json({
        success: true,
        message:
          result.reason,
        data: result,
      });
    }

    // ------------------------------------------------
    // Success
    // ------------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        result.message,
      data: result,
    });

  } catch (error: any) {
    console.error(
      "Create next Open Play match error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create Open Play match",
    });
  }
}