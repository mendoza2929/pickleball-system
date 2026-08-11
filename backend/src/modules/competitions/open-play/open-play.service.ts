import {
  findSessionById,
} from "../sessions/session.repository";

import {
  findWaitingQueue,
} from "../queue/queue.repository";

import {
  createMatchFromQueue,
} from "../matches/match.service";

import {
  assignAvailableCourt,
} from "../match-courts/matchCourt.service";

import {
  findMatchById,
} from "../matches/match.repository";

// --------------------------------------------------
// CREATE NEXT OPEN PLAY MATCH
// --------------------------------------------------

export async function createNextOpenPlayMatch(
  competitionSessionId: number
) {
  // ------------------------------------------------
  // 1. Check session
  // ------------------------------------------------

  const session =
    await findSessionById(
      competitionSessionId
    );

  if (!session) {
    throw new Error(
      "Open Play session not found"
    );
  }

  // ------------------------------------------------
  // 2. Session must be live
  // ------------------------------------------------

  if (
    session.status !== "live"
  ) {
    throw new Error(
      "Open Play session is not live"
    );
  }

  // ------------------------------------------------
  // 3. Check waiting players
  // ------------------------------------------------

  const waitingPlayers =
    await findWaitingQueue(
      competitionSessionId,
      4
    );

  if (
    waitingPlayers.length < 4
  ) {
    return {
      created: false,

      reason:
        "Not enough players waiting",

      waiting_count:
        waitingPlayers.length,

      court_assigned: false,

      match: null,
    };
  }

  // ------------------------------------------------
  // 4. Create match from queue
  // ------------------------------------------------

  const createdMatch =
    await createMatchFromQueue(
      competitionSessionId
    );

  if (!createdMatch) {
    throw new Error(
      "Failed to create Open Play match"
    );
  }

  const matchId =
    Number(createdMatch.id);

  // ------------------------------------------------
  // 5. Try to assign available court
  // ------------------------------------------------

  let courtAssigned = false;

  try {
    await assignAvailableCourt(
      matchId
    );

    courtAssigned = true;
  } catch (error: any) {
    console.warn(
      "No court assigned:",
      error.message
    );
  }

  // ------------------------------------------------
  // 6. Get final match
  // ------------------------------------------------

  const match =
    await findMatchById(
      matchId
    );

  if (!match) {
    throw new Error(
      "Created match could not be found"
    );
  }

  // ------------------------------------------------
  // 7. Return result
  // ------------------------------------------------

  return {
    created: true,

    court_assigned:
      courtAssigned,

    message:
      courtAssigned
        ? "Open Play match created and court assigned"
        : "Open Play match created but no court is currently available",

    match,
  };
}