import {
  createSession,
  findSessionByDivisionId,
  findSessionById,
  updateSessionStatus,
} from "./session.repository";

import {
  findDivisionById,
} from "../divisions/division.repository";

import {
  findCompetitionById,
} from "../competition.repository";

import {
  SessionStatus,
  UpdateSessionInput,
} from "./session.types";

// ==================================================
// VALID STATUSES
// ==================================================

const VALID_STATUSES:
  SessionStatus[] = [
    "scheduled",
    "live",
    "paused",
    "completed",
    "cancelled",
  ];

// ==================================================
// CREATE SESSION
// ==================================================

export async function createOpenPlaySession(
  competitionDivisionId: number
) {
  // -----------------------------------------------
  // 1. Check division
  // -----------------------------------------------

  const division =
    await findDivisionById(
      competitionDivisionId
    );

  if (!division) {
    throw new Error(
      "Competition division not found"
    );
  }

  // -----------------------------------------------
  // 2. Check competition
  // -----------------------------------------------

  const competition =
    await findCompetitionById(
      division.competition_id
    );

  if (!competition) {
    throw new Error(
      "Competition not found"
    );
  }

  // -----------------------------------------------
  // 3. Check existing session
  // -----------------------------------------------

  const existing =
    await findSessionByDivisionId(
      competitionDivisionId
    );

  if (existing) {
    throw new Error(
      "An Open Play session already exists for this division"
    );
  }

  // -----------------------------------------------
  // 4. Division must be open
  // -----------------------------------------------

  if (
    division.status !== "open"
  ) {
    throw new Error(
      "This division is not available to start a session"
    );
  }

  // -----------------------------------------------
  // 5. Create
  // -----------------------------------------------

  return createSession(
    competitionDivisionId
  );
}

// ==================================================
// GET SESSION
// ==================================================

export async function getSession(
  id: number
) {
  const session =
    await findSessionById(id);

  if (!session) {
    throw new Error(
      "Open Play session not found"
    );
  }

  return session;
}

// ==================================================
// GET SESSION BY DIVISION
// ==================================================

export async function getDivisionSession(
  competitionDivisionId: number
) {
  const division =
    await findDivisionById(
      competitionDivisionId
    );

  if (!division) {
    throw new Error(
      "Competition division not found"
    );
  }

  return findSessionByDivisionId(
    competitionDivisionId
  );
}

// ==================================================
// UPDATE SESSION
// ==================================================

export async function updateSession(
  id: number,
  data: UpdateSessionInput
) {
  // -----------------------------------------------
  // 1. Find session
  // -----------------------------------------------

  const session =
    await findSessionById(id);

  if (!session) {
    throw new Error(
      "Open Play session not found"
    );
  }

  // -----------------------------------------------
  // 2. Validate status
  // -----------------------------------------------

  if (
    !VALID_STATUSES.includes(
      data.status
    )
  ) {
    throw new Error(
      "Invalid session status"
    );
  }

  // -----------------------------------------------
  // 3. Same status
  // -----------------------------------------------

  if (
    session.status === data.status
  ) {
    return session;
  }

  // -----------------------------------------------
  // 4. Completed cannot restart
  // -----------------------------------------------

  if (
    session.status === "completed"
  ) {
    throw new Error(
      "Completed session cannot be restarted"
    );
  }

  // -----------------------------------------------
  // 5. Cancelled cannot restart
  // -----------------------------------------------

  if (
    session.status === "cancelled"
  ) {
    throw new Error(
      "Cancelled session cannot be restarted"
    );
  }

  // =================================================
  // SCHEDULED
  // =================================================

  if (
    session.status === "scheduled"
  ) {
    if (
      data.status !== "live" &&
      data.status !== "cancelled"
    ) {
      throw new Error(
        "Scheduled session can only become live or cancelled"
      );
    }
  }

  // =================================================
  // LIVE
  // =================================================

  if (
    session.status === "live"
  ) {
    if (
      data.status !== "paused" &&
      data.status !== "completed" &&
      data.status !== "cancelled"
    ) {
      throw new Error(
        "Live session can only be paused, completed, or cancelled"
      );
    }
  }

  // =================================================
  // PAUSED
  // =================================================

  if (
    session.status === "paused"
  ) {
    if (
      data.status !== "live" &&
      data.status !== "completed" &&
      data.status !== "cancelled"
    ) {
      throw new Error(
        "Paused session can only be resumed, completed, or cancelled"
      );
    }
  }

  // =================================================
  // Update database
  // =================================================

  return updateSessionStatus(
    id,
    data.status
  );
}