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

// ==================================================
// VALID MATCH STATUSES
// ==================================================

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

async function getMatchFormat(
  session: any
) {
  let rawFormat =
    session?.format;

  // ------------------------------------------------
  // Fallback:
  // If findSessionById() does not return the format,
  // get it directly from competition_divisions.
  // ------------------------------------------------

  if (
    !rawFormat &&
    session?.competition_division_id
  ) {
    const [rows] =
      await db.execute(
        `
          SELECT
            format

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

  const normalizedFormat =
    String(
      rawFormat || ""
    )
      .trim()
      .toLowerCase()
      .replace(
        /[\s_-]+/g,
        ""
      );

  // ------------------------------------------------
  // Singles / Doubles
  // ------------------------------------------------

  const isSingles =
    normalizedFormat ===
      "single" ||
    normalizedFormat ===
      "singles";

  const playersPerTeam =
    isSingles
      ? 1
      : 2;

  return {
    isSingles,

    playersPerTeam,

    totalPlayersPerMatch:
      playersPerTeam * 2,

    label:
      isSingles
        ? "singles"
        : "doubles",
  };
}

// ==================================================
// AUTO ASSIGN EXISTING PENDING MATCH
// ==================================================
//
// This is important.
//
// When a court becomes free after another match
// completes, first look for an existing pending
// match before creating another match.
//
// ==================================================

async function assignPendingMatchCourt(
  competitionSessionId: number
) {
  const matches =
    await findMatchesBySessionId(
      competitionSessionId
    );

  if (
    !matches ||
    matches.length === 0
  ) {
    return null;
  }

  // ------------------------------------------------
  // Find oldest pending match without court
  // ------------------------------------------------

  const pendingMatch =
    matches
      .filter(
        (match: any) =>
          match.status ===
            "pending" &&
          (
            match.court_id ===
              null ||
            match.court_id ===
              undefined
          )
      )
      .sort(
        (a: any, b: any) =>
          Number(a.id) -
          Number(b.id)
      )[0];

  if (!pendingMatch) {
    return null;
  }

  // ------------------------------------------------
  // Try to assign court
  // ------------------------------------------------

  try {
    const assignedMatch =
      await assignAvailableCourt(
        Number(
          pendingMatch.id
        )
      );

    // ------------------------------------------------
    // IMPORTANT:
    //
    // assignAvailableCourt() may return the same
    // pending match when no court exists.
    //
    // Only return it as successful if it actually
    // received a court.
    // ------------------------------------------------

    if (
      assignedMatch &&
      assignedMatch.court_id !==
        null &&
      assignedMatch.court_id !==
        undefined
    ) {
      console.log(
        "[Open Play] Pending match automatically assigned",
        {
          sessionId:
            competitionSessionId,

          matchId:
            pendingMatch.id,

          courtId:
            assignedMatch.court_id,
        }
      );

      return assignedMatch;
    }

    return null;

  } catch (error: any) {
    console.log(
      "[Open Play] Pending match still waiting for court",
      {
        sessionId:
          competitionSessionId,

        matchId:
          pendingMatch.id,

        error:
          error?.message,
      }
    );

    return null;
  }
}

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

  if (
    session.status !==
    "live"
  ) {
    throw new Error(
      "Open Play session is not live"
    );
  }

  // ==================================================
  // 3. DETERMINE MATCH FORMAT
  // ==================================================

  const {
    playersPerTeam,
    totalPlayersPerMatch,
    label:
      matchFormatLabel,
  } =
    await getMatchFormat(
      session
    );

  // ==================================================
  // 4. DETERMINE PLAYERS
  // ==================================================

  let teamAssignments:
    Array<{
      team: "A" | "B";
      queueId: number;
      playerId: number;
      position: number;
    }>;

  // ==================================================
  // MANUAL TEAM SELECTION
  // ==================================================

  if (
    teamAQueueIds !==
      undefined ||
    teamBQueueIds !==
      undefined
  ) {
    // ------------------------------------------------
    // Validate arrays
    // ------------------------------------------------

    if (
      !Array.isArray(
        teamAQueueIds
      ) ||
      !Array.isArray(
        teamBQueueIds
      )
    ) {
      throw new Error(
        "Team A and Team B selections are required"
      );
    }

    // ------------------------------------------------
    // Validate number of players
    // ------------------------------------------------

    if (
      teamAQueueIds.length !==
        playersPerTeam ||
      teamBQueueIds.length !==
        playersPerTeam
    ) {
      throw new Error(
        `Team A and Team B must each contain exactly ${playersPerTeam} player${
          playersPerTeam ===
          1
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
          !Number.isInteger(
            id
          ) ||
          id <= 0
      )
    ) {
      throw new Error(
        "Invalid queue player selection"
      );
    }

    // ------------------------------------------------
    // Prevent same player in both teams
    // ------------------------------------------------

    if (
      new Set(
        selectedIds
      ).size !==
      totalPlayersPerMatch
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
            findQueueEntryById(
              queueId
            )
        )
      );

    // ------------------------------------------------
    // Validate queue entries
    // ------------------------------------------------

    if (
      selectedEntries.some(
        (entry) =>
          !entry
      )
    ) {
      throw new Error(
        "One or more selected queue players were not found"
      );
    }

    // ------------------------------------------------
    // Validate each player
    // ------------------------------------------------

    for (
      const entry of
        selectedEntries
    ) {
      if (!entry) {
        continue;
      }

      // ----------------------------------------------
      // Correct session
      // ----------------------------------------------

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

      // ----------------------------------------------
      // Must still be waiting
      // ----------------------------------------------

      if (
        entry.status !==
        "waiting"
      ) {
        throw new Error(
          "Only waiting players can be added to a new match"
        );
      }

      // ----------------------------------------------
      // Competition player required
      // ----------------------------------------------

      if (
        !entry.competition_player_id
      ) {
        throw new Error(
          "Selected queue player has no competition player"
        );
      }
    }

    // ------------------------------------------------
    // Map queue entries
    // ------------------------------------------------

    const entryById =
      new Map(
        selectedEntries
          .filter(Boolean)
          .map(
            (
              entry: any
            ) => [
              Number(
                entry.id
              ),
              entry,
            ]
          )
      );

    // ------------------------------------------------
    // Team A
    // ------------------------------------------------

    teamAssignments = [
      ...teamAQueueIds.map(
        (
          queueId,
          index
        ) => {
          const entry =
            entryById.get(
              Number(
                queueId
              )
            );

          return {
            team:
              "A" as const,

            queueId:
              Number(
                queueId
              ),

            playerId:
              Number(
                entry.competition_player_id
              ),

            position:
              index + 1,
          };
        }
      ),

      // ------------------------------------------------
      // Team B
      // ------------------------------------------------

      ...teamBQueueIds.map(
        (
          queueId,
          index
        ) => {
          const entry =
            entryById.get(
              Number(
                queueId
              )
            );

          return {
            team:
              "B" as const,

            queueId:
              Number(
                queueId
              ),

            playerId:
              Number(
                entry.competition_player_id
              ),

            position:
              index + 1,
          };
        }
      ),
    ];
  }

  // ==================================================
  // AUTOMATIC MATCH CREATION
  // ==================================================

  else {
    const waitingPlayers =
      await findWaitingQueue(
        competitionSessionId,
        totalPlayersPerMatch
      );

    // ------------------------------------------------
    // Not enough players
    // ------------------------------------------------

    if (
      waitingPlayers.length <
      totalPlayersPerMatch
    ) {
      throw new Error(
        `At least ${totalPlayersPerMatch} players are required to create a ${matchFormatLabel} match`
      );
    }

    teamAssignments =
      [];

    // ------------------------------------------------
    // Automatically assign teams
    // ------------------------------------------------

    for (
      let index = 0;
      index <
      totalPlayersPerMatch;
      index++
    ) {
      const team =
        index <
        playersPerTeam
          ? "A"
          : "B";

      const position =
        (index %
          playersPerTeam) +
        1;

      const player =
        waitingPlayers[
          index
        ];

      if (
        !player.competition_player_id
      ) {
        throw new Error(
          "A waiting player has no competition player"
        );
      }

      teamAssignments.push({
        team,

        queueId:
          Number(
            player.id
          ),

        playerId:
          Number(
            player.competition_player_id
          ),

        position,
      });
    }
  }

  // ==================================================
  // 5. CREATE MATCH NUMBER
  // ==================================================

  const matchNumber =
    await getNextMatchNumber(
      competitionSessionId
    );

  // ==================================================
  // 6. CREATE MATCH
  // ==================================================

  const matchId =
    await createMatch(
      competitionSessionId,
      matchNumber
    );

  // ==================================================
  // 7. ADD PLAYERS
  // ==================================================

  for (
    const assignment of
      teamAssignments
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

  // ==================================================
  // 8. AUTOMATIC COURT ASSIGNMENT
  // ==================================================

  let createdMatch =
    await findMatchById(
      matchId
    );

  try {
    createdMatch =
      await assignAvailableCourt(
        Number(
          matchId
        )
      );

  } catch (error: any) {
    // ------------------------------------------------
    // No court available.
    //
    // Keep match pending.
    // ------------------------------------------------

    console.log(
      "[Open Play] No court available for match:",
      matchId,
      error?.message
    );

    createdMatch =
      await findMatchById(
        Number(
          matchId
        )
      );
  }

  // ==================================================
  // 9. RETURN CREATED MATCH
  // ==================================================

  return createdMatch;
}

// ==================================================
// GET ONE MATCH
// ==================================================

export async function getMatch(
  id: number
) {
  const match =
    await findMatchById(
      id
    );

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
    await findMatchById(
      id
    );

  if (!match) {
    throw new Error(
      "Match not found"
    );
  }

  // ==================================================
  // VALIDATE STATUS
  // ==================================================

  if (
    !VALID_STATUSES.includes(
      data.status
    )
  ) {
    throw new Error(
      "Invalid match status"
    );
  }

  // ==================================================
  // SAME STATUS
  // ==================================================

  if (
    match.status ===
    data.status
  ) {
    return match;
  }

  // ==================================================
  // COMPLETED PROTECTION
  // ==================================================

  if (
    match.status ===
    "completed"
  ) {
    throw new Error(
      "Completed match cannot be changed"
    );
  }

  // ==================================================
  // CANCELLED PROTECTION
  // ==================================================

  if (
    match.status ===
    "cancelled"
  ) {
    throw new Error(
      "Cancelled match cannot be restarted"
    );
  }

  // ==================================================
  // START PLAYING
  // ==================================================

  if (
    data.status ===
    "playing"
  ) {
    // ------------------------------------------------
    // Must be called
    // ------------------------------------------------

    if (
      match.status !==
      "called"
    ) {
      throw new Error(
        "Only called matches can start"
      );
    }

    // ------------------------------------------------
    // Court required
    // ------------------------------------------------

    if (
      match.court_id ===
      null
    ) {
      throw new Error(
        "A court must be assigned before starting the match"
      );
    }

    return startMatch(
      id
    );
  }

  // ==================================================
  // COMPLETED
  // ==================================================

  if (
    data.status ===
    "completed"
  ) {
    throw new Error(
      "Use the complete match endpoint with scores"
    );
  }

  // ==================================================
  // OTHER STATUSES
  // ==================================================

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
    await findMatchById(
      id
    );

  if (!match) {
    throw new Error(
      "Match not found"
    );
  }

  // ==================================================
  // MUST BE CALLED
  // ==================================================

  if (
    match.status !==
    "called"
  ) {
    throw new Error(
      "Only called matches can start"
    );
  }

  // ==================================================
  // COURT REQUIRED
  // ==================================================

  if (
    match.court_id ===
    null
  ) {
    throw new Error(
      "A court must be assigned before starting the match"
    );
  }

  // ==================================================
  // START MATCH
  // ==================================================

  return startMatch(
    id
  );
}

// ==================================================
// COMPLETE MATCH
// ==================================================

export async function finishMatch(
  id: number,
  teamAScore: number,
  teamBScore: number
) {
  // ==================================================
  // 1. FIND MATCH
  // ==================================================

  const match =
    await findMatchById(
      id
    );

  if (!match) {
    throw new Error(
      "Match not found"
    );
  }

  // ==================================================
  // 2. MUST BE PLAYING
  // ==================================================

  if (
    match.status !==
    "playing"
  ) {
    throw new Error(
      "Only playing matches can be completed"
    );
  }

  // ==================================================
  // 3. VALIDATE SCORES
  // ==================================================

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

  // ==================================================
  // 4. NO NEGATIVE SCORES
  // ==================================================

  if (
    teamAScore < 0 ||
    teamBScore < 0
  ) {
    throw new Error(
      "Scores cannot be negative"
    );
  }

  // ==================================================
  // 5. NO TIE
  // ==================================================

  if (
    teamAScore ===
    teamBScore
  ) {
    throw new Error(
      "A match cannot end in a tie"
    );
  }

  // ==================================================
  // 6. SAVE COMPLETED MATCH
  // ==================================================

  const completedMatch =
    await completeMatch(
      id,
      teamAScore,
      teamBScore
    );

  // ==================================================
  // 7. GET SESSION
  // ==================================================

  const session =
    await findSessionById(
      match.competition_session_id
    );

  // ==================================================
  // SESSION NO LONGER LIVE
  // ==================================================

  if (
    !session ||
    session.status !==
      "live"
  ) {
    return {
      completed_match:
        completedMatch,

      next_match:
        null,
    };
  }

  // ==================================================
  // 8. FIRST:
  // ASSIGN COURT TO EXISTING PENDING MATCH
  // ==================================================
  //
  // This is the important new behavior.
  //
  // The court from the completed match is now free.
  //
  // Before creating another match, check whether
  // there is already a pending match waiting.
  //
  // ==================================================

  let nextMatch =
    await assignPendingMatchCourt(
      match.competition_session_id
    );

  // ==================================================
  // 9. EXISTING PENDING MATCH ASSIGNED
  // ==================================================

  if (
    nextMatch
  ) {
    return {
      completed_match:
        completedMatch,

      next_match:
        nextMatch,
    };
  }

  // ==================================================
  // 10. DETERMINE MATCH FORMAT
  // ==================================================

  const {
    totalPlayersPerMatch,
  } =
    await getMatchFormat(
      session
    );

  // ==================================================
  // 11. CHECK WAITING PLAYERS
  // ==================================================

  const waitingPlayers =
    await findWaitingQueue(
      match.competition_session_id,
      totalPlayersPerMatch
    );

  // ==================================================
  // 12. NOT ENOUGH PLAYERS
  // ==================================================

  if (
    waitingPlayers.length <
    totalPlayersPerMatch
  ) {
    return {
      completed_match:
        completedMatch,

      next_match:
        null,
    };
  }

  // ==================================================
  // 13. CREATE NEXT MATCH
  // ==================================================

  nextMatch =
    await createMatchFromQueue(
      match.competition_session_id
    );

  if (!nextMatch) {
    return {
      completed_match:
        completedMatch,

      next_match:
        null,
    };
  }

  // ==================================================
  // 14. VERIFY COURT
  //
  // createMatchFromQueue() already attempts
  // automatic court allocation.
  // ==================================================

  if (
    nextMatch.court_id ===
      null ||
    nextMatch.court_id ===
      undefined
  ) {
    try {
      nextMatch =
        await assignAvailableCourt(
          Number(
            nextMatch.id
          )
        );

    } catch (
      error: any
    ) {
      console.log(
        "[Open Play] No court available for new match",
        {
          matchId:
            nextMatch.id,

          error:
            error?.message,
        }
      );

      nextMatch =
        await findMatchById(
          Number(
            nextMatch.id
          )
        );
    }
  }

  // ==================================================
  // 15. RETURN BOTH MATCHES
  // ==================================================

  return {
    completed_match:
      completedMatch,

    next_match:
      nextMatch,
  };
}