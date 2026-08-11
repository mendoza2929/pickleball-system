import db from "../../../config/database";

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
// MATCH FORMAT HELPERS
// ==================================================

async function getMatchFormat(session: any) {
  let rawFormat = session?.format;

  // ------------------------------------------------
  // Fallback: get format directly from division
  // ------------------------------------------------

  if (
    !rawFormat &&
    session?.competition_division_id
  ) {
    const [rows] = await db.execute(
      `
        SELECT format
        FROM competition_divisions
        WHERE id = ?
        LIMIT 1
      `,
      [
        session.competition_division_id,
      ]
    );

    rawFormat =
      (rows as any[])?.[0]?.format;
  }

  // ------------------------------------------------
  // Normalize format
  // ------------------------------------------------

  const normalizedFormat = String(
    rawFormat || ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  // ------------------------------------------------
  // Singles / Doubles
  // ------------------------------------------------

  const isSingles =
    normalizedFormat === "single" ||
    normalizedFormat === "singles";

  const playersPerTeam =
    isSingles ? 1 : 2;

  return {
    isSingles,

    playersPerTeam,

    totalPlayersPerMatch:
      playersPerTeam * 2,

    label: isSingles
      ? "singles"
      : "doubles",
  };
}

// ==================================================
// CREATE MATCH FROM QUEUE
// ==================================================

export async function createMatchFromQueue(
  competitionSessionId: number,
  teamAQueueIds?: number[],
  teamBQueueIds?: number[]
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

  if (session.status !== "live") {
    throw new Error(
      "Open Play session is not live"
    );
  }

  // ------------------------------------------------
  // 3. Determine Singles / Doubles
  // ------------------------------------------------

  const {
    playersPerTeam,
    totalPlayersPerMatch,
    label: matchFormatLabel,
  } = await getMatchFormat(session);

  // ------------------------------------------------
  // 4. Determine players
  // ------------------------------------------------

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
    // ------------------------------------------------
    // Validate arrays
    // ------------------------------------------------

    if (
      !Array.isArray(teamAQueueIds) ||
      !Array.isArray(teamBQueueIds)
    ) {
      throw new Error(
        "Team A and Team B selections are required"
      );
    }

    // ------------------------------------------------
    // Validate team sizes
    // ------------------------------------------------

    if (
      teamAQueueIds.length !==
        playersPerTeam ||
      teamBQueueIds.length !==
        playersPerTeam
    ) {
      throw new Error(
        `Team A and Team B must each contain exactly ${playersPerTeam} player${
          playersPerTeam === 1
            ? ""
            : "s"
        }`
      );
    }

    // ------------------------------------------------
    // Convert IDs to numbers
    // ------------------------------------------------

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
    // Prevent same queue player in both teams
    // ------------------------------------------------

    if (
      new Set(selectedIds).size !==
      totalPlayersPerMatch
    ) {
      throw new Error(
        "A player cannot be assigned to both teams"
      );
    }

    // ------------------------------------------------
    // Load queue entries
    // ------------------------------------------------

    const selectedEntries =
      await Promise.all(
        selectedIds.map(
          (queueId) =>
            findQueueEntryById(
              queueId
            )
        )
      );

    // ------------------------------------------------
    // Validate entries exist
    // ------------------------------------------------

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

      if (
        !entry.competition_player_id
      ) {
        throw new Error(
          "Selected queue player has no competition player"
        );
      }
    }

    // ------------------------------------------------
    // Map entries by queue ID
    // ------------------------------------------------

    const entryById =
      new Map(
        selectedEntries
          .filter(Boolean)
          .map((entry: any) => [
            Number(entry.id),
            entry,
          ])
      );

    // =================================================
    // IMPORTANT:
    // position MUST be unique inside a match.
    //
    // Singles:
    // Team A = position 1
    // Team B = position 2
    //
    // Doubles:
    // Team A = positions 1,2
    // Team B = positions 3,4
    // =================================================

    teamAssignments = [
      // ------------------------------------------------
      // TEAM A
      // ------------------------------------------------

      ...teamAQueueIds.map(
        (queueId, index) => {
          const entry =
            entryById.get(
              Number(queueId)
            );

          return {
            team: "A" as const,

            queueId:
              Number(queueId),

            playerId:
              Number(
                entry.competition_player_id
              ),

            // Team A starts at position 1
            position:
              index + 1,
          };
        }
      ),

      // ------------------------------------------------
      // TEAM B
      // ------------------------------------------------

      ...teamBQueueIds.map(
        (queueId, index) => {
          const entry =
            entryById.get(
              Number(queueId)
            );

          return {
            team: "B" as const,

            queueId:
              Number(queueId),

            playerId:
              Number(
                entry.competition_player_id
              ),

            // IMPORTANT:
            // Team B continues after Team A.
            //
            // Singles:
            // playersPerTeam = 1
            // B position = 1 + 1 = 2
            //
            // Doubles:
            // playersPerTeam = 2
            // B positions = 3,4
            //
            position:
              playersPerTeam +
              index +
              1,
          };
        }
      ),
    ];
  } else {
    // =================================================
    // AUTOMATIC MATCH CREATION
    // =================================================

    const waitingPlayers =
      await findWaitingQueue(
        competitionSessionId,
        totalPlayersPerMatch
      );

    // ------------------------------------------------
    // Validate player count
    // ------------------------------------------------

    if (
      waitingPlayers.length <
      totalPlayersPerMatch
    ) {
      throw new Error(
        `At least ${totalPlayersPerMatch} players are required to create a ${matchFormatLabel} match`
      );
    }

    // ------------------------------------------------
    // Build assignments
    // ------------------------------------------------

    teamAssignments = [];

    for (
      let index = 0;
      index < totalPlayersPerMatch;
      index++
    ) {
      const team =
        index < playersPerTeam
          ? "A"
          : "B";

      const player =
        waitingPlayers[index];

      if (
        !player.competition_player_id
      ) {
        throw new Error(
          "A waiting player has no competition player"
        );
      }

      // ------------------------------------------------
      // IMPORTANT:
      //
      // Position is GLOBAL within the match.
      //
      // Singles:
      // index 0 → A → position 1
      // index 1 → B → position 2
      //
      // Doubles:
      // index 0 → A → position 1
      // index 1 → A → position 2
      // index 2 → B → position 3
      // index 3 → B → position 4
      // ------------------------------------------------

      const position =
        index + 1;

      teamAssignments.push({
        team,

        queueId:
          Number(player.id),

        playerId:
          Number(
            player.competition_player_id
          ),

        position,
      });
    }
  }

  // ------------------------------------------------
  // Safety check before database insert
  // ------------------------------------------------

  const positions =
    teamAssignments.map(
      (assignment) =>
        assignment.position
    );

  if (
    new Set(positions).size !==
    positions.length
  ) {
    throw new Error(
      "Duplicate match positions detected before creating the match"
    );
  }

  // ------------------------------------------------
  // 5. Create match number
  // ------------------------------------------------

  const matchNumber =
    await getNextMatchNumber(
      competitionSessionId
    );

  // ------------------------------------------------
  // 6. Create match
  // ------------------------------------------------

  const matchId =
    await createMatch(
      competitionSessionId,
      matchNumber
    );

  // ------------------------------------------------
  // 7. Add selected players
  // ------------------------------------------------

  try {
    for (
      const assignment of teamAssignments
    ) {
      await addMatchPlayer(
        matchId,
        assignment.playerId,
        assignment.team,
        assignment.position
      );

      await updateQueueStatus(
        assignment.queueId,
        "matched"
      );
    }
  } catch (error) {
    // ------------------------------------------------
    // IMPORTANT:
    // If inserting players fails, don't leave the
    // match partially created.
    //
    // The safest solution is to delete the match here
    // if your repository supports deleteMatch().
    //
    // For now rethrow the original database error.
    // ------------------------------------------------

    throw error;
  }

  // ------------------------------------------------
  // 8. Return created match
  // ------------------------------------------------

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

  // ------------------------------------------------
  // Validate status
  // ------------------------------------------------

  if (
    !VALID_STATUSES.includes(
      data.status
    )
  ) {
    throw new Error(
      "Invalid match status"
    );
  }

  // ------------------------------------------------
  // Same status
  // ------------------------------------------------

  if (
    match.status === data.status
  ) {
    return match;
  }

  // ------------------------------------------------
  // Completed protection
  // ------------------------------------------------

  if (
    match.status === "completed"
  ) {
    throw new Error(
      "Completed match cannot be changed"
    );
  }

  // ------------------------------------------------
  // Cancelled protection
  // ------------------------------------------------

  if (
    match.status === "cancelled"
  ) {
    throw new Error(
      "Cancelled match cannot be restarted"
    );
  }

  // ------------------------------------------------
  // Start playing
  // ------------------------------------------------

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

  // ------------------------------------------------
  // Completed
  // ------------------------------------------------

  if (
    data.status === "completed"
  ) {
    throw new Error(
      "Use the complete match endpoint with scores"
    );
  }

  // ------------------------------------------------
  // Other statuses
  // ------------------------------------------------

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

  // ------------------------------------------------
  // Must be called
  // ------------------------------------------------

  if (
    match.status !== "called"
  ) {
    throw new Error(
      "Only called matches can start"
    );
  }

  // ------------------------------------------------
  // Court required
  // ------------------------------------------------

  if (
    match.court_id === null
  ) {
    throw new Error(
      "A court must be assigned before starting the match"
    );
  }

  // ------------------------------------------------
  // Start match
  // ------------------------------------------------

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

  // ------------------------------------------------
  // 1. Must be playing
  // ------------------------------------------------

  if (
    match.status !== "playing"
  ) {
    throw new Error(
      "Only playing matches can be completed"
    );
  }

  // ------------------------------------------------
  // 2. Validate scores
  // ------------------------------------------------

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

  // ------------------------------------------------
  // 3. No negative scores
  // ------------------------------------------------

  if (
    teamAScore < 0 ||
    teamBScore < 0
  ) {
    throw new Error(
      "Scores cannot be negative"
    );
  }

  // ------------------------------------------------
  // 4. No tie
  // ------------------------------------------------

  if (
    teamAScore === teamBScore
  ) {
    throw new Error(
      "A match cannot end in a tie"
    );
  }

  // ------------------------------------------------
  // 5. Complete current match
  // ------------------------------------------------

  const completedMatch =
    await completeMatch(
      id,
      teamAScore,
      teamBScore
    );

  // ------------------------------------------------
  // 6. Check session
  // ------------------------------------------------

  const session =
    await findSessionById(
      match.competition_session_id
    );

  // ------------------------------------------------
  // Session no longer live
  // ------------------------------------------------

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

  // ------------------------------------------------
  // 7. Determine Singles / Doubles
  // ------------------------------------------------

  const {
    totalPlayersPerMatch,
  } = await getMatchFormat(
    session
  );

  // ------------------------------------------------
  // 8. Check waiting players
  // ------------------------------------------------

  const waitingPlayers =
    await findWaitingQueue(
      match.competition_session_id,
      totalPlayersPerMatch
    );

  // ------------------------------------------------
  // Not enough players
  // ------------------------------------------------

  if (
    waitingPlayers.length <
    totalPlayersPerMatch
  ) {
    return {
      completed_match:
        completedMatch,

      next_match: null,
    };
  }

  // ------------------------------------------------
  // 9. Create next match
  // ------------------------------------------------

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

  // ------------------------------------------------
  // 10. Automatically assign available court
  // ------------------------------------------------

  try {
    nextMatch =
      await assignAvailableCourt(
        Number(nextMatch.id)
      );
  } catch (error: any) {
    // ----------------------------------------------
    // No available court.
    //
    // Keep match pending.
    // Admin can manually assign a court later.
    // ----------------------------------------------

    console.log(
      "No court available for next Open Play match:",
      error.message
    );

    nextMatch =
      await findMatchById(
        Number(nextMatch.id)
      );
  }

  // ------------------------------------------------
  // 11. Return both matches
  // ------------------------------------------------

  return {
    completed_match:
      completedMatch,

    next_match:
      nextMatch,
  };
}