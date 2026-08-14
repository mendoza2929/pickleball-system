import {
  Request,
  Response,
} from "express";

import {
  createMatchFromQueue,
  getSessionMatches,
  getMatch,
  updateMatch,
  startMatchPlay,
  finishMatch,
} from "./match.service";

// ==================================================
// CREATE MATCH
// ==================================================

export async function create(
  req: Request,
  res: Response
) {
  try {
    const competitionSessionId =
      Number(
        req.params.sessionId
      );

    // ------------------------------------------------
    // Validate session ID
    // ------------------------------------------------

    if (
      !Number.isInteger(
        competitionSessionId
      ) ||
      competitionSessionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID",
      });
    }

    // ------------------------------------------------
    // Team selections
    //
    // These are optional because the service
    // supports automatic queue selection.
    // ------------------------------------------------

    const {
      teamAQueueIds,
      teamBQueueIds,
    } = req.body ?? {};

    // ------------------------------------------------
    // CREATE MATCH
    //
    // The service is responsible for:
    //
    // 1. Getting waiting players
    // 2. Creating the match
    // 3. Adding players
    // 4. Marking queue players as matched
    // 5. Automatically assigning an available court
    // ------------------------------------------------

    const data =
      await createMatchFromQueue(
        competitionSessionId,
        teamAQueueIds,
        teamBQueueIds
      );

    // ------------------------------------------------
    // RETURN MATCH
    // ------------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        data?.court_id
          ? "Match created and court assigned successfully"
          : "Match created successfully. Waiting for an available court.",
      data,
    });

  } catch (error: any) {
    console.error(
      "Create match error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to create match",
    });
  }
}

// ==================================================
// GET MATCHES BY SESSION
// ==================================================

export async function getBySession(
  req: Request,
  res: Response
) {
  try {
    const competitionSessionId =
      Number(
        req.params.sessionId
      );

    if (
      !Number.isInteger(
        competitionSessionId
      ) ||
      competitionSessionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid session ID",
      });
    }

    const data =
      await getSessionMatches(
        competitionSessionId
      );

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error: any) {
    console.error(
      "Get session matches error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error?.message ||
        "Failed to fetch matches",
    });
  }
}

// ==================================================
// GET ONE MATCH
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
          "Invalid match ID",
      });
    }

    const data =
      await getMatch(id);

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error: any) {
    console.error(
      "Get match error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error?.message ||
        "Match not found",
    });
  }
}

// ==================================================
// UPDATE MATCH STATUS
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
          "Invalid match ID",
      });
    }

    const {
      status,
    } = req.body ?? {};

    if (!status) {
      return res.status(400).json({
        success: false,
        message:
          "Match status is required",
      });
    }

    const data =
      await updateMatch(
        id,
        {
          status,
        } as any
      );

    return res.status(200).json({
      success: true,
      message:
        "Match updated successfully",
      data,
    });

  } catch (error: any) {
    console.error(
      "Update match error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to update match",
    });
  }
}

// ==================================================
// START MATCH
// ==================================================

export async function start(
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
          "Invalid match ID",
      });
    }

    const data =
      await startMatchPlay(id);

    return res.status(200).json({
      success: true,
      message:
        "Match started successfully",
      data,
    });

  } catch (error: any) {
    console.error(
      "Start match error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to start match",
    });
  }
}

// ==================================================
// COMPLETE MATCH
// ==================================================

export async function complete(
  req: Request,
  res: Response
) {
  try {
    const id =
      Number(
        req.params.id
      );

    // ------------------------------------------------
    // Validate match ID
    // ------------------------------------------------

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid match ID",
      });
    }

    // ------------------------------------------------
    // Get scores
    // ------------------------------------------------

    const teamAScore =
      Number(
        req.body?.teamAScore
      );

    const teamBScore =
      Number(
        req.body?.teamBScore
      );

    // ------------------------------------------------
    // Validate Team A
    // ------------------------------------------------

    if (
      !Number.isInteger(
        teamAScore
      ) ||
      teamAScore < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Team A score",
      });
    }

    // ------------------------------------------------
    // Validate Team B
    // ------------------------------------------------

    if (
      !Number.isInteger(
        teamBScore
      ) ||
      teamBScore < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Team B score",
      });
    }

    // ------------------------------------------------
    // No tie
    // ------------------------------------------------

    if (
      teamAScore ===
      teamBScore
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A match cannot end in a tie",
      });
    }

    // ------------------------------------------------
    // Complete match
    //
    // finishMatch() also creates the next match
    // and attempts automatic court allocation.
    // ------------------------------------------------

    const data =
      await finishMatch(
        id,
        teamAScore,
        teamBScore
      );

    return res.status(200).json({
      success: true,
      message:
        "Match completed successfully",
      data,
    });

  } catch (error: any) {
    console.error(
      "Complete match error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to complete match",
    });
  }
}