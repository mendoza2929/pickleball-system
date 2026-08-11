import db from "../../../config/database";

// --------------------------------------------------
// GET NEXT MATCH NUMBER
// --------------------------------------------------

export async function getNextMatchNumber(
  competitionSessionId: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        COALESCE(
          MAX(match_number),
          0
        ) + 1 AS next_match_number

      FROM competition_matches

      WHERE competition_session_id = ?
    `,
    [competitionSessionId]
  );

  return Number(
    (rows as any[])[0]?.next_match_number ?? 1
  );
}

// --------------------------------------------------
// CREATE MATCH
// --------------------------------------------------

export async function createMatch(
  competitionSessionId: number,
  matchNumber: number
) {
  const [result]: any =
    await db.execute(
      `
        INSERT INTO competition_matches (
          competition_session_id,
          match_number,
          status
        )

        VALUES (?, ?, 'pending')
      `,
      [
        competitionSessionId,
        matchNumber,
      ]
    );

  return result.insertId;
}

// --------------------------------------------------
// ADD MATCH PLAYER
// --------------------------------------------------

export async function addMatchPlayer(
  competitionMatchId: number,
  competitionPlayerId: number,
  team: "A" | "B",
  position: number
) {
  await db.execute(
    `
      INSERT INTO competition_match_players (
        competition_match_id,
        competition_player_id,
        team,
        position
      )

      VALUES (?, ?, ?, ?)
    `,
    [
      competitionMatchId,
      competitionPlayerId,
      team,
      position,
    ]
  );
}

// --------------------------------------------------
// GET MATCH
// --------------------------------------------------

export async function findMatchById(
  id: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        cm.id,
        cm.competition_session_id,
        cm.court_id,
        cm.court_assigned_at,
        cm.match_number,
        cm.status,

        cm.team_a_score,
        cm.team_b_score,

        cm.started_at,
        cm.completed_at,
        cm.created_at,
        cm.updated_at,

        cs.competition_division_id,
        cs.status AS session_status,

        cd.competition_id,
        cd.name AS division_name,
        cd.skill_level,
        cd.format

      FROM competition_matches cm

      INNER JOIN competition_sessions cs
        ON cs.id =
           cm.competition_session_id

      INNER JOIN competition_divisions cd
        ON cd.id =
           cs.competition_division_id

      WHERE cm.id = ?

      LIMIT 1
    `,
    [id]
  );

  const match =
    (rows as any[])[0] ?? null;

  if (!match) {
    return null;
  }

  // -----------------------------------------------
  // MATCH PLAYERS
  // -----------------------------------------------

  const [players] =
    await db.execute(
      `
        SELECT
          cmp.id,
          cmp.competition_player_id,
          cmp.team,
          cmp.position,

          cp.customer_id,
          cp.skill_level,

          c.customer_no,
          c.first_name,
          c.last_name,
          c.email,
          c.phone

        FROM competition_match_players cmp

        INNER JOIN competition_players cp
          ON cp.id =
             cmp.competition_player_id

        INNER JOIN customers c
          ON c.id =
             cp.customer_id

        WHERE
          cmp.competition_match_id = ?

        ORDER BY
          cmp.position ASC
      `,
      [id]
    );

  return {
    ...match,
    players,
  };
}

// --------------------------------------------------
// GET MATCHES BY SESSION
// --------------------------------------------------

export async function findMatchesBySessionId(
  competitionSessionId: number
) {
  const [rows] =
    await db.execute(
      `
        SELECT
          cm.id,
          cm.competition_session_id,
          cm.court_id,
          cm.court_assigned_at,
          cm.match_number,
          cm.status,

          cm.team_a_score,
          cm.team_b_score,

          cm.started_at,
          cm.completed_at,
          cm.created_at,
          cm.updated_at

        FROM competition_matches cm

        WHERE
          cm.competition_session_id = ?

        ORDER BY
          cm.match_number ASC
      `,
      [competitionSessionId]
    );

  const matches =
    rows as any[];

  // -----------------------------------------------
  // GET PLAYERS
  // -----------------------------------------------

  for (
    const match of matches
  ) {
    const [players] =
      await db.execute(
        `
          SELECT
            cmp.competition_player_id,
            cmp.team,
            cmp.position,

            c.first_name,
            c.last_name

          FROM competition_match_players cmp

          INNER JOIN competition_players cp
            ON cp.id =
               cmp.competition_player_id

          INNER JOIN customers c
            ON c.id =
               cp.customer_id

          WHERE
            cmp.competition_match_id = ?

          ORDER BY
            cmp.position ASC
        `,
        [match.id]
      );

    match.players = players;
  }

  return matches;
}

// --------------------------------------------------
// UPDATE MATCH STATUS
// --------------------------------------------------

export async function updateMatchStatus(
  id: number,
  status: string
) {
  if (
    status === "playing"
  ) {
    await db.execute(
      `
        UPDATE competition_matches

        SET
          status = 'playing',

          started_at =
            COALESCE(
              started_at,
              CURRENT_TIMESTAMP
            )

        WHERE id = ?
      `,
      [id]
    );
  } else if (
    status === "completed"
  ) {
    await db.execute(
      `
        UPDATE competition_matches

        SET
          status = 'completed',

          completed_at =
            CURRENT_TIMESTAMP

        WHERE id = ?
      `,
      [id]
    );
  } else {
    await db.execute(
      `
        UPDATE competition_matches

        SET
          status = ?

        WHERE id = ?
      `,
      [
        status,
        id,
      ]
    );
  }

  return findMatchById(id);
}

// --------------------------------------------------
// START MATCH
// --------------------------------------------------

export async function startMatch(
  id: number
) {
  await db.execute(
    `
      UPDATE competition_matches

      SET
        status = 'playing',

        started_at =
          COALESCE(
            started_at,
            CURRENT_TIMESTAMP
          )

      WHERE id = ?
    `,
    [id]
  );

  return findMatchById(id);
}

// --------------------------------------------------
// COMPLETE MATCH
// --------------------------------------------------

export async function completeMatch(
  id: number,
  teamAScore: number,
  teamBScore: number
) {
  const connection =
    await db.getConnection();

  try {
    await connection.beginTransaction();

    // ---------------------------------------------
    // FIND MATCH
    // ---------------------------------------------

    const [matchRows]: any[] =
      await connection.execute(
        `
          SELECT
            id,
            competition_session_id,
            status

          FROM competition_matches

          WHERE id = ?

          FOR UPDATE
        `,
        [id]
      );

    const match =
      matchRows[0];

    if (!match) {
      throw new Error(
        "Match not found"
      );
    }

    // ---------------------------------------------
    // COMPLETE MATCH
    // ---------------------------------------------

    await connection.execute(
      `
        UPDATE competition_matches

        SET
          status = 'completed',

          team_a_score = ?,
          team_b_score = ?,

          completed_at =
            CURRENT_TIMESTAMP

        WHERE id = ?
      `,
      [
        teamAScore,
        teamBScore,
        id,
      ]
    );

    // ---------------------------------------------
    // GET MATCH PLAYERS
    // ---------------------------------------------

    const [players]: any[] =
      await connection.execute(
        `
          SELECT
            competition_player_id

          FROM competition_match_players

          WHERE competition_match_id = ?
        `,
        [id]
      );

    // ---------------------------------------------
    // MOVE QUEUE PLAYERS
    // called/playing → completed
    // ---------------------------------------------

    for (
      const player of players
    ) {
      await connection.execute(
        `
          UPDATE competition_queue cq

          INNER JOIN competition_checkins cc
            ON cc.id =
               cq.competition_checkin_id

          INNER JOIN competition_registrations cr
            ON cr.id =
               cc.competition_registration_id

          SET
            cq.status = 'completed'

          WHERE
            cq.competition_session_id = ?

            AND cr.competition_player_id = ?

            AND cq.status IN (
              'called',
              'playing'
            )
        `,
        [
          match.competition_session_id,
          player.competition_player_id,
        ]
      );
    }

    await connection.commit();

    return findMatchById(id);
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }

  
}