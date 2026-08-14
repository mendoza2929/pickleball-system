import db from "../../../config/database";

// ==================================================
// FIND COURT
// ==================================================

export async function findCourtById(
  courtId: number
) {
  const [rows] =
    await db.execute(
      `
        SELECT
          id,
          name,
          status
        FROM courts
        WHERE id = ?
        LIMIT 1
      `,
      [courtId]
    );

  return (
    rows as any[]
  )[0] ?? null;
}

// ==================================================
// FIND MATCH
// ==================================================

export async function findMatchForAssignment(
  matchId: number
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
          cm.started_at,
          cm.completed_at,

          c.name AS court_name

        FROM competition_matches cm

        LEFT JOIN courts c
          ON c.id = cm.court_id

        WHERE cm.id = ?

        LIMIT 1
      `,
      [matchId]
    );

  return (
    rows as any[]
  )[0] ?? null;
}

// ==================================================
// FIND ACTIVE MATCH USING COURT
// ==================================================

export async function findActiveMatchByCourtId(
  courtId: number,
  excludeMatchId?: number
) {
  let sql = `
    SELECT
      id,
      competition_session_id,
      court_id,
      match_number,
      status

    FROM competition_matches

    WHERE court_id = ?

      AND status IN (
        'called',
        'playing'
      )
  `;

  const params: any[] = [
    courtId,
  ];

  if (
    excludeMatchId !==
    undefined
  ) {
    sql += `
      AND id != ?
    `;

    params.push(
      excludeMatchId
    );
  }

  sql += `
    ORDER BY id ASC
    LIMIT 1
  `;

  const [rows] =
    await db.execute(
      sql,
      params
    );

  return (
    rows as any[]
  )[0] ?? null;
}

// ==================================================
// GET QUEUE ENTRIES FOR MATCH
// ==================================================

export async function findQueueEntriesForMatch(
  matchId: number
) {
  const [rows] =
    await db.execute(
      `
        SELECT
          cq.id,
          cq.status,
          cq.competition_session_id,
          cq.competition_checkin_id,
          cr.competition_player_id

        FROM competition_match_players cmp

        INNER JOIN competition_matches cm
          ON cm.id =
             cmp.competition_match_id

        INNER JOIN competition_checkins cc
          ON cc.id = (
            SELECT
              cq2.competition_checkin_id

            FROM competition_queue cq2

            INNER JOIN competition_checkins cc2
              ON cc2.id =
                 cq2.competition_checkin_id

            INNER JOIN competition_registrations cr2
              ON cr2.id =
                 cc2.competition_registration_id

            WHERE
              cq2.competition_session_id =
                cm.competition_session_id

              AND cr2.competition_player_id =
                cmp.competition_player_id

            ORDER BY
              cq2.id DESC

            LIMIT 1
          )

        INNER JOIN competition_registrations cr
          ON cr.id =
             cc.competition_registration_id

        INNER JOIN competition_queue cq
          ON cq.competition_checkin_id =
             cc.id

        WHERE
          cmp.competition_match_id = ?

        ORDER BY
          cmp.position ASC
      `,
      [matchId]
    );

  return rows as any[];
}

// ==================================================
// ASSIGN COURT
//
// Transaction:
// match -> called
// queue -> called
// ==================================================

export async function assignCourtToMatch(
  matchId: number,
  courtId: number
) {
  const connection =
    await db.getConnection();

  try {
    await connection.beginTransaction();

    // ----------------------------------------------
    // 1. Lock match
    // ----------------------------------------------

    const [
      matchRows,
    ]: any[] =
      await connection.execute(
        `
          SELECT
            id,
            competition_session_id,
            court_id,
            status

          FROM competition_matches

          WHERE id = ?

          FOR UPDATE
        `,
        [matchId]
      );

    const match =
      matchRows[0];

    if (!match) {
      throw new Error(
        "Match not found"
      );
    }

    // ----------------------------------------------
    // 2. Match must be pending
    // ----------------------------------------------

    if (
      match.status !==
      "pending"
    ) {
      throw new Error(
        `Match cannot be assigned a court while status is "${match.status}"`
      );
    }

    // ----------------------------------------------
    // 3. Match must not already have court
    // ----------------------------------------------

    if (
      match.court_id !== null
    ) {
      throw new Error(
        "A court is already assigned to this match"
      );
    }

    // ----------------------------------------------
    // 4. Lock court
    // ----------------------------------------------

    const [
      courtRows,
    ]: any[] =
      await connection.execute(
        `
          SELECT
            id,
            name,
            status

          FROM courts

          WHERE id = ?

          LIMIT 1

          FOR UPDATE
        `,
        [courtId]
      );

    const court =
      courtRows[0];

    if (!court) {
      throw new Error(
        "Court not found"
      );
    }

    if (
      court.status !==
      "Available"
    ) {
      throw new Error(
        "Court is not available"
      );
    }

    // ----------------------------------------------
    // 5. Check active Open Play match
    // ----------------------------------------------

    const [
      activeRows,
    ]: any[] =
      await connection.execute(
        `
          SELECT
            id,
            match_number,
            status

          FROM competition_matches

          WHERE court_id = ?

            AND status IN (
              'called',
              'playing'
            )

            AND id != ?

          LIMIT 1

          FOR UPDATE
        `,
        [
          courtId,
          matchId,
        ]
      );

    const activeMatch =
      activeRows[0];

    if (activeMatch) {
      throw new Error(
        `Court is already assigned to match #${activeMatch.match_number}`
      );
    }

    // ----------------------------------------------
    // 6. Assign court
    // ----------------------------------------------

    await connection.execute(
      `
        UPDATE competition_matches

        SET
          court_id = ?,
          court_assigned_at =
            CURRENT_TIMESTAMP,
          status = 'called'

        WHERE id = ?
      `,
      [
        courtId,
        matchId,
      ]
    );

    // ----------------------------------------------
    // 7. Get match players
    // ----------------------------------------------

    const [
      playerRows,
    ]: any[] =
      await connection.execute(
        `
          SELECT
            competition_player_id

          FROM competition_match_players

          WHERE competition_match_id = ?
        `,
        [matchId]
      );

    // ----------------------------------------------
    // 8. Queue -> called
    // ----------------------------------------------

    for (
      const player
      of playerRows
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
            cq.status = 'called',

            cq.called_at =
              COALESCE(
                cq.called_at,
                CURRENT_TIMESTAMP
              )

          WHERE
            cq.competition_session_id = ?

            AND cr.competition_player_id = ?

            AND cq.status = 'matched'
        `,
        [
          match.competition_session_id,
          player.competition_player_id,
        ]
      );
    }

    await connection.commit();

    // ----------------------------------------------
    // Return updated match
    // ----------------------------------------------

    return findMatchForAssignment(
      matchId
    );

  } catch (error) {
    await connection.rollback();

    throw error;

  } finally {
    connection.release();
  }
}

// ==================================================
// REMOVE COURT
//
// match -> pending
// queue -> matched
// ==================================================

export async function removeCourtFromMatch(
  matchId: number
) {
  const connection =
    await db.getConnection();

  try {
    await connection.beginTransaction();

    // ----------------------------------------------
    // 1. Lock match
    // ----------------------------------------------

    const [
      matchRows,
    ]: any[] =
      await connection.execute(
        `
          SELECT
            id,
            competition_session_id,
            court_id,
            status

          FROM competition_matches

          WHERE id = ?

          FOR UPDATE
        `,
        [matchId]
      );

    const match =
      matchRows[0];

    if (!match) {
      throw new Error(
        "Match not found"
      );
    }

    // ----------------------------------------------
    // 2. Must have court
    // ----------------------------------------------

    if (
      match.court_id === null
    ) {
      throw new Error(
        "Match does not have a court assigned"
      );
    }

    // ----------------------------------------------
    // 3. Cannot remove playing court
    // ----------------------------------------------

    if (
      match.status ===
      "playing"
    ) {
      throw new Error(
        "Cannot remove court from a playing match"
      );
    }

    // ----------------------------------------------
    // 4. Cannot change completed
    // ----------------------------------------------

    if (
      match.status ===
      "completed"
    ) {
      throw new Error(
        "Completed match cannot be changed"
      );
    }

    // ----------------------------------------------
    // 5. Remove court
    // ----------------------------------------------

    await connection.execute(
      `
        UPDATE competition_matches

        SET
          court_id = NULL,
          court_assigned_at = NULL,
          status = 'pending'

        WHERE id = ?
      `,
      [matchId]
    );

    // ----------------------------------------------
    // 6. Get players
    // ----------------------------------------------

    const [
      playerRows,
    ]: any[] =
      await connection.execute(
        `
          SELECT
            competition_player_id

          FROM competition_match_players

          WHERE competition_match_id = ?
        `,
        [matchId]
      );

    // ----------------------------------------------
    // 7. Queue -> matched
    // ----------------------------------------------

    for (
      const player
      of playerRows
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
            cq.status = 'matched',
            cq.called_at = NULL

          WHERE
            cq.competition_session_id = ?

            AND cr.competition_player_id = ?

            AND cq.status = 'called'
        `,
        [
          match.competition_session_id,
          player.competition_player_id,
        ]
      );
    }

    await connection.commit();

    return findMatchForAssignment(
      matchId
    );

  } catch (error) {
    await connection.rollback();

    throw error;

  } finally {
    connection.release();
  }
}