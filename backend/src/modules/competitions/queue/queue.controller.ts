import {
  Request,
  Response,
} from "express";

import {
  joinQueue,
  getSessionQueue,
  getQueueEntry,
  getWaitingPlayers,
  updateQueueEntry,
  removeFromQueue,
} from "./queue.service";

// ==================================================
// JOIN QUEUE
// ==================================================

export async function create(
  req: Request,
  res: Response
) {
  try {
    const sessionId =
      Number(req.params.sessionId);

    const competitionCheckinId =
      Number(
        req.body.competitionCheckinId
      );

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

    if (
      !Number.isInteger(
        competitionCheckinId
      ) ||
      competitionCheckinId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid competition check-in ID",
      });
    }

    const data =
      await joinQueue(
        sessionId,
        competitionCheckinId
      );

    return res.status(201).json({
      success: true,
      message:
        "Player joined the queue successfully",
      data,
    });
  } catch (error: any) {
    console.error(
      "Join queue error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to join queue",
    });
  }
}

// ==================================================
// GET QUEUE BY SESSION
// ==================================================

export async function getBySession(
  req: Request,
  res: Response
) {
  try {
    const sessionId =
      Number(req.params.sessionId);

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

    const data =
      await getSessionQueue(
        sessionId
      );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      "Get session queue error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch queue",
    });
  }
}

// ==================================================
// GET WAITING PLAYERS
// ==================================================

export async function getWaiting(
  req: Request,
  res: Response
) {
  try {
    const sessionId =
      Number(req.params.sessionId);

    const limit =
      req.query.limit !== undefined
        ? Number(req.query.limit)
        : 4;

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

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 4
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Queue limit must be between 1 and 4",
      });
    }

    const data =
      await getWaitingPlayers(
        sessionId,
        limit
      );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      "Get waiting queue error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch waiting queue",
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
          "Invalid queue ID",
      });
    }

    const data =
      await getQueueEntry(id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      "Get queue entry error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Queue entry not found",
    });
  }
}

// ==================================================
// UPDATE STATUS
// ==================================================

export async function update(
  req: Request,
  res: Response
) {
  try {
    const id =
      Number(req.params.id);

    const {
      status,
    } = req.body;

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid queue ID",
      });
    }

    if (
      typeof status !== "string" ||
      !status.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Queue status is required",
      });
    }

    const data =
      await updateQueueEntry(
        id,
        {
          status: status as any,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Queue status updated successfully",
      data,
    });
  } catch (error: any) {
    console.error(
      "Update queue error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update queue",
    });
  }
}

// ==================================================
// REMOVE
// ==================================================

export async function remove(
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
          "Invalid queue ID",
      });
    }

    const data =
      await removeFromQueue(id);

    return res.status(200).json({
      success: true,
      message:
        "Player removed from queue",
      data,
    });
  } catch (error: any) {
    console.error(
      "Remove queue error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to remove player",
    });
  }
}