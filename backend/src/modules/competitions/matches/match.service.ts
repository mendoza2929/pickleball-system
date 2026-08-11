import {
  createMatch,
  addMatchPlayer,
  findMatchById,
  findMatchesBySessionId,
  getNextMatchNumber,
  updateMatchStatus,
  startMatch,
  completeMatch,
} from "./match.repository";

import {
  findSessionById,
} from "../sessions/session.repository";

import {
  findWaitingQueue,
  findQueueEntryById,
  updateQueueStatus,
} from "../queue/queue.repository";

import {
  assignAvailableCourt,
} from "../match-courts/matchCourt.service";

import {
  MatchStatus,
  UpdateMatchStatusInput,
} from "./match.types";

const VALID_STATUSES: MatchStatus[] = [
  "pending",
  "called",
  "playing",
  "completed",
  "cancelled",
];

// ==================================================
// CREATE MATCH FROM QUEUE
// ==================================================

export async function createMatchFromQueue(
  competitionSessionId: number,
  teamAQueueIds?: number[],
  teamBQueueIds?: number[]
) {
  // ==================================================
  // 1. CHECK SESSION
  // ==================================================

  const session =
    await findSessionById(
      competitionSessionId
    );

  if (!session) {
    throw new Error(
      "Open Play session not found"
    );
  }

  // ==================================================
  // 2. SESSION MUST BE LIVE
  // ==================================================

  if (session.status !== "live") {
    throw new Error(
      "Open Play session is not live"
    );
  }

  // ==================================================
  // 3. DETERMINE PLAYERS
  // ==================================================

  let teamAssignments: Array<{
    team: "A" | "B";
    queueId: number;
    playerId: number;
    position: number;
  }>;

  // ==================================================
  // MANUAL TEAM SELECTION
  // ==================================================

  if (
    teamAQueueIds !== undefined ||
    teamBQueueIds !== undefined
  ) {
    if (
      !Array.isArray(teamAQueueIds) ||
      !Array.isArray(teamBQueueIds) ||
      teamAQueueIds.length !== 2 ||
      teamBQueueIds.length !== 2
    ) {
      throw new Error(
        "Team A and Team B must each contain exactly 2 players"
      );
    }

    const selectedIds = [
      ...teamAQueueIds,
      ...teamBQueueIds,
    ].map(Number);

    // ------------------------------------------------
    // Validate IDs
    // ------------------------------------------------

    if (
      selectedIds.some(
        (id) =>
          !Number.isInteger(id) ||
          id <= 0
      )
    ) {
      throw new Error(
        "Invalid queue player selection"
      );
    }

    // ------------------------------------------------
    // Player cannot be in both teams
    // ------------------------------------------------

    if (
      new Set(selectedIds).size !== 4
    ) {
      throw new Error(
        "A player cannot be assigned to both teams"
      );
    }

    // ------------------------------------------------
    // Get queue entries
    // ------------------------------------------------

    const selectedEntries =
      await Promise.all(
        selectedIds.map(
          (queueId) =>
            findQueueEntryById(queueId)
        )
      );

    if (
      selectedEntries.some(
        (entry) => !entry
      )
    ) {
      throw new Error(
        "One or more selected queue players were not found"
      );
    }

    // ------------------------------------------------
    // Validate queue entries
    // ------------------------------------------------

    for (
      const entry of selectedEntries
    ) {
      if (!entry) {
        continue;
      }

      if (
        Number(
          entry.competition_session_id
        ) !==
        Number(
          competitionSessionId
        )
      ) {
        throw new Error(
          "Selected player does not belong to this Open Play session"
        );
      }

      if (
        entry.status !== "waiting"
      ) {
        throw new Error(
          "Only waiting players can be added to a new match"
        );
      }
    }

    // ------------------------------------------------
    // Map queue IDs → queue entries
    // ------------------------------------------------

    const entryById =
      new Map(
        selectedEntries
          .filter(Boolean)
          .map(
            (entry: any) => [
              Number(entry.id),
              entry,
            ]
          )
      );

    // ==================================================
    // IMPORTANT
    //
    // position is GLOBAL inside the match:
    //
    // Team A:
    //   position 1
    //   position 2
    //
    // Team B:
    //   position 3
    //   position 4
    //
    // This matches uq_match_position:
    // (competition_match_id, position)
    // ==================================================

    teamAssignments = [
      ...teamAQueueIds.map(
        (queueId, index) => {
          const entry =
            entryById.get(
              Number(queueId)
            );

          return {
            team: "A" as const,
            queueId: Number(queueId),
            playerId: Number(
              entry.competition_player_id
            ),
            position: index + 1,
          };
        }
      ),

      ...teamBQueueIds.map(
        (queueId, index) => {
          const entry =
            entryById.get(
              Number(queueId)
            );

          return {
            team: "B" as const,
            queueId: Number(queueId),
            playerId: Number(
              entry.competition_player_id
            ),

            // Team B starts at position 3
            position: index + 3,
          };
        }
      ),
    ];
  }

  // ==================================================
  // AUTOMATIC MATCH
  // ==================================================

  else {
    const waitingPlayers =
      await findWaitingQueue(
        competitionSessionId,
        4
      );

    if (
      waitingPlayers.length < 4
    ) {
      throw new Error(
        "At least 4 players are required to create a doubles match"
      );
    }

    // ------------------------------------------------
    // Global positions 1,2,3,4
    // ------------------------------------------------

    teamAssignments = [
      {
        team: "A",
        queueId: Number(
          waitingPlayers[0].id
        ),
        playerId: Number(
          waitingPlayers[0]
            .competition_player_id
        ),
        position: 1,
      },

      {
        team: "A",
        queueId: Number(
          waitingPlayers[1].id
        ),
        playerId: Number(
          waitingPlayers[1]
            .competition_player_id
        ),
        position: 2,
      },

      {
        team: "B",
        queueId: Number(
          waitingPlayers[2].id
        ),
        playerId: Number(
          waitingPlayers[2]
            .competition_player_id
        ),
        position: 3,
      },

      {
        team: "B",
        queueId: Number(
          waitingPlayers[3].id
        ),
        playerId: Number(
          waitingPlayers[3]
            .competition_player_id
        ),
        position: 4,
      },
    ];
  }

  // ==================================================
  // 4. CREATE MATCH NUMBER
  // ==================================================

  const matchNumber =
    await getNextMatchNumber(
      competitionSessionId
    );

  // ==================================================
  // 5. CREATE MATCH
  // ==================================================

  const matchId =
    await createMatch(
      competitionSessionId,
      matchNumber
    );

  // ==================================================
  // 6. ADD PLAYERS
  // ==================================================

  for (
    const assignment of teamAssignments
  ) {
    await addMatchPlayer(
      matchId,
      assignment.playerId,
      assignment.team,
      assignment.position
    );

    // Queue → matched

    await updateQueueStatus(
      assignment.queueId,
      "matched"
    );
  }

  // ==================================================
  // 7. RETURN MATCH
  // ==================================================

  return findMatchById(
    matchId
  );
}

// ==================================================
// GET ONE MATCH
// ==================================================

export async function getMatch(
  id: number
) {
  const match =
    await findMatchById(id);

  if (!match) {
    throw new Error(
      "Match not found"
    );
  }

  return match;
}

// ==================================================
// GET MATCHES BY SESSION
// ==================================================

export async function getSessionMatches(
  competitionSessionId: number
) {
  const session =
    await findSessionById(
      competitionSessionId
    );

  if (!session) {
    throw new Error(
      "Open Play session not found"
    );
  }

  return findMatchesBySessionId(
    competitionSessionId
  );
}

// ==================================================
// UPDATE MATCH STATUS
// ==================================================

export async function updateMatch(
  id: number,
  data: UpdateMatchStatusInput
) {
  const match =
    await findMatchById(id);

  if (!match) {
    throw new Error(
      "Match not found"
    );
  }

  // -----------------------------------------------
  // Validate status
  // -----------------------------------------------

  if (
    !VALID_STATUSES.includes(
      data.status
    )
  ) {
    throw new Error(
      "Invalid match status"
    );
  }

  // -----------------------------------------------
  // Same status
  // -----------------------------------------------

  if (
    match.status === data.status
  ) {
    return match;
  }

  // -----------------------------------------------
  // Completed protection
  // -----------------------------------------------

  if (
    match.status === "completed"
  ) {
    throw new Error(
      "Completed match cannot be changed"
    );
  }

  // -----------------------------------------------
  // Cancelled protection
  // -----------------------------------------------

  if (
    match.status === "cancelled"
  ) {
    throw new Error(
      "Cancelled match cannot be restarted"
    );
  }

  // -----------------------------------------------
  // Start playing
  // -----------------------------------------------

  if (
    data.status === "playing"
  ) {
    if (
      match.status !== "called"
    ) {
      throw new Error(
        "Only called matches can start"
      );
    }

    if (
      match.court_id === null
    ) {
      throw new Error(
        "A court must be assigned before starting the match"
      );
    }

    return startMatch(id);
  }

  // -----------------------------------------------
  // Completed
  // -----------------------------------------------

  if (
    data.status === "completed"
  ) {
    throw new Error(
      "Use the complete match endpoint with scores"
    );
  }

  // -----------------------------------------------
  // Other statuses
  // -----------------------------------------------

  return updateMatchStatus(
    id,
    data.status
  );
}

// ==================================================
// START MATCH
// ==================================================

export async function startMatchPlay(
  id: number
) {
  const match =
    await findMatchById(id);

  if (!match) {
    throw new Error(
      "Match not found"
    );
  }

  // -----------------------------------------------
  // Must be called
  // -----------------------------------------------

  if (
    match.status !== "called"
  ) {
    throw new Error(
      "Only called matches can start"
    );
  }

  // -----------------------------------------------
  // Court required
  // -----------------------------------------------

  if (
    match.court_id === null
  ) {
    throw new Error(
      "A court must be assigned before starting the match"
    );
  }

  // -----------------------------------------------
  // Start match
  // -----------------------------------------------

  return startMatch(id);
}

// ==================================================
// COMPLETE MATCH
// ==================================================

export async function finishMatch(
  id: number,
  teamAScore: number,
  teamBScore: number
) {
  const match =
    await findMatchById(id);

  if (!match) {
    throw new Error(
      "Match not found"
    );
  }

  // -----------------------------------------------
  // 1. Must be playing
  // -----------------------------------------------

  if (
    match.status !== "playing"
  ) {
    throw new Error(
      "Only playing matches can be completed"
    );
  }

  // -----------------------------------------------
  // 2. Validate scores
  // -----------------------------------------------

  if (
    !Number.isInteger(
      teamAScore
    ) ||
    !Number.isInteger(
      teamBScore
    )
  ) {
    throw new Error(
      "Scores must be whole numbers"
    );
  }

  // -----------------------------------------------
  // 3. No negative scores
  // -----------------------------------------------

  if (
    teamAScore < 0 ||
    teamBScore < 0
  ) {
    throw new Error(
      "Scores cannot be negative"
    );
  }

  // -----------------------------------------------
  // 4. No tie
  // -----------------------------------------------

  if (
    teamAScore === teamBScore
  ) {
    throw new Error(
      "A match cannot end in a tie"
    );
  }

  // -----------------------------------------------
  // 5. Complete current match
  // -----------------------------------------------

  const completedMatch =
    await completeMatch(
      id,
      teamAScore,
      teamBScore
    );

  // -----------------------------------------------
  // 6. Check session
  // -----------------------------------------------

  const session =
    await findSessionById(
      match.competition_session_id
    );

  // -----------------------------------------------
  // If session is no longer live,
  // don't create another match.
  // -----------------------------------------------

  if (
    !session ||
    session.status !== "live"
  ) {
    return {
      completed_match:
        completedMatch,

      next_match: null,
    };
  }

  // -----------------------------------------------
  // 7. Check waiting players
  // -----------------------------------------------

  const waitingPlayers =
    await findWaitingQueue(
      match.competition_session_id,
      4
    );

  // -----------------------------------------------
  // Not enough players
  // -----------------------------------------------

  if (
    waitingPlayers.length < 4
  ) {
    return {
      completed_match:
        completedMatch,

      next_match: null,
    };
  }

  // -----------------------------------------------
  // 8. Create next match
  // -----------------------------------------------

  let nextMatch =
    await createMatchFromQueue(
      match.competition_session_id
    );

  if (!nextMatch) {
    return {
      completed_match:
        completedMatch,

      next_match: null,
    };
  }

  // -----------------------------------------------
  // 9. Automatically assign available court
  // -----------------------------------------------

  try {
    nextMatch =
      await assignAvailableCourt(
        Number(nextMatch.id)
      );
  } catch (error: any) {
    // ---------------------------------------------
    // No available court.
    //
    // Keep match pending.
    // Admin can manually assign a court later.
    // ---------------------------------------------

    console.log(
      "No court available for next Open Play match:",
      error.message
    );

    // Get latest match state
    nextMatch =
      await findMatchById(
        Number(nextMatch.id)
      );
  }

  // -----------------------------------------------
  // 10. Return both matches
  // -----------------------------------------------

  return {
    completed_match:
      completedMatch,

    next_match:
      nextMatch,
  };
}