import {
  createQueueEntry,
  findQueueBySessionId,
  findQueueEntryByCheckinId,
  findQueueEntryById,
  findWaitingQueue,
  getNextQueuePosition,
  updateQueueStatus,
} from "./queue.repository";

import {
  findSessionById,
} from "../sessions/session.repository";

import {
  findCheckinById,
} from "../checkins/checkin.repository";

import {
  QueueStatus,
  UpdateQueueStatusInput,
} from "./queue.types";

// ==================================================
// VALID STATUSES
// ==================================================

const VALID_STATUSES: QueueStatus[] = [
  "waiting",
  "matched",
  "called",
  "playing",
  "completed",
  "removed",
];

// ==================================================
// JOIN QUEUE
// ==================================================

export async function joinQueue(
  competitionSessionId: number,
  competitionCheckinId: number
) {
  // -----------------------------------------------
  // 1. CHECK SESSION
  // -----------------------------------------------

  const session = await findSessionById(
    competitionSessionId
  );

  if (!session) {
    throw new Error(
      "Open Play session not found"
    );
  }

  // -----------------------------------------------
  // 2. SESSION MUST BE LIVE
  // -----------------------------------------------

  if (session.status !== "live") {
    throw new Error(
      "Open Play session is not live"
    );
  }

  // -----------------------------------------------
  // 3. CHECK CHECK-IN
  // -----------------------------------------------

  const checkin = await findCheckinById(
    competitionCheckinId
  );

  if (!checkin) {
    throw new Error(
      "Competition check-in not found"
    );
  }

  // -----------------------------------------------
  // 4. MUST BE CHECKED IN
  // -----------------------------------------------

  if (checkin.status !== "checked_in") {
    throw new Error(
      "Player must be checked in before joining the queue"
    );
  }

  // -----------------------------------------------
  // 5. CHECK SESSION / DIVISION
  // -----------------------------------------------

  if (
    Number(
      checkin.competition_division_id
    ) !==
    Number(
      session.competition_division_id
    )
  ) {
    throw new Error(
      "Player check-in does not belong to this session"
    );
  }

  // -----------------------------------------------
  // 6. CHECK DUPLICATE
  // -----------------------------------------------

  const existing =
    await findQueueEntryByCheckinId(
      competitionCheckinId
    );

  if (existing) {
    // Already waiting/matched/etc.
    return existing;
  }

  // -----------------------------------------------
  // 7. GET NEXT POSITION
  // -----------------------------------------------

  const position =
    await getNextQueuePosition(
      competitionSessionId
    );

  // -----------------------------------------------
  // 8. CREATE QUEUE ENTRY
  // -----------------------------------------------

  return createQueueEntry(
    competitionSessionId,
    competitionCheckinId,
    position
  );
}

// ==================================================
// GET QUEUE
// ==================================================

export async function getSessionQueue(
  competitionSessionId: number
) {
  const session = await findSessionById(
    competitionSessionId
  );

  if (!session) {
    throw new Error(
      "Open Play session not found"
    );
  }

  return findQueueBySessionId(
    competitionSessionId
  );
}

// ==================================================
// GET ONE QUEUE ENTRY
// ==================================================

export async function getQueueEntry(
  id: number
) {
  const entry =
    await findQueueEntryById(id);

  if (!entry) {
    throw new Error(
      "Queue entry not found"
    );
  }

  return entry;
}

// ==================================================
// GET WAITING PLAYERS
// ==================================================

export async function getWaitingPlayers(
  competitionSessionId: number,
  limit = 4
) {
  const session = await findSessionById(
    competitionSessionId
  );

  if (!session) {
    throw new Error(
      "Open Play session not found"
    );
  }

  if (session.status !== "live") {
    throw new Error(
      "Open Play session is not live"
    );
  }

  if (
    limit < 1 ||
    limit > 4
  ) {
    throw new Error(
      "Queue limit must be between 1 and 4"
    );
  }

  return findWaitingQueue(
    competitionSessionId,
    limit
  );
}

// ==================================================
// UPDATE QUEUE ENTRY
// ==================================================

export async function updateQueueEntry(
  id: number,
  data: UpdateQueueStatusInput
) {
  const entry =
    await findQueueEntryById(id);

  if (!entry) {
    throw new Error(
      "Queue entry not found"
    );
  }

  // -----------------------------------------------
  // VALIDATE STATUS
  // -----------------------------------------------

  if (
    !VALID_STATUSES.includes(
      data.status
    )
  ) {
    throw new Error(
      "Invalid queue status"
    );
  }

  // -----------------------------------------------
  // SAME STATUS
  // -----------------------------------------------

  if (
    entry.status === data.status
  ) {
    return entry;
  }

  // -----------------------------------------------
  // REMOVED CANNOT RETURN
  // -----------------------------------------------

  if (
    entry.status === "removed"
  ) {
    throw new Error(
      "Removed queue entry cannot be reactivated"
    );
  }

  // -----------------------------------------------
  // COMPLETED CANNOT RETURN
  // -----------------------------------------------

  if (
    entry.status === "completed"
  ) {
    throw new Error(
      "Completed queue entry cannot be changed"
    );
  }

  // -----------------------------------------------
  // WAITING → MATCHED
  // -----------------------------------------------

  if (
    data.status === "matched"
  ) {
    if (
      entry.status !== "waiting"
    ) {
      throw new Error(
        "Only waiting players can be marked as matched"
      );
    }
  }

  // -----------------------------------------------
  // MATCHED → CALLED
  // -----------------------------------------------

  if (
    data.status === "called"
  ) {
    if (
      entry.status !== "matched"
    ) {
      throw new Error(
        "Only matched players can be called"
      );
    }
  }

  // -----------------------------------------------
  // CALLED → PLAYING
  // -----------------------------------------------

  if (
    data.status === "playing"
  ) {
    if (
      entry.status !== "called"
    ) {
      throw new Error(
        "Only called players can start playing"
      );
    }
  }

  // -----------------------------------------------
  // PLAYING → COMPLETED
  // -----------------------------------------------

  if (
    data.status === "completed"
  ) {
    if (
      entry.status !== "playing"
    ) {
      throw new Error(
        "Only playing players can be completed"
      );
    }
  }

  // -----------------------------------------------
  // REMOVE
  // -----------------------------------------------

  if (
    data.status === "removed"
  ) {
    if (
      entry.status !== "waiting" &&
      entry.status !== "matched"
    ) {
      throw new Error(
        "Only waiting or matched players can be removed"
      );
    }
  }

  // -----------------------------------------------
  // UPDATE
  // -----------------------------------------------

  return updateQueueStatus(
    id,
    data.status
  );
}

// ==================================================
// REMOVE FROM QUEUE
// ==================================================

export async function removeFromQueue(
  id: number
) {
  return updateQueueEntry(
    id,
    {
      status: "removed",
    }
  );
}