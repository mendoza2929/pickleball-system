import db from "../../../config/database";

// ==================================================
// FIND SESSION BY ID
// ==================================================

export async function findSessionById(
  id: number
) {
  const [rows] = await db.execute(
    `
    SELECT
      cs.id,
      cs.competition_division_id,
      cs.status,
      cs.started_at,
      cs.ended_at,
      cs.created_at,
      cs.updated_at,

      cd.competition_id,
      cd.name AS division_name,
      cd.skill_level,
      cd.format,
      cd.max_players,
      cd.entry_fee,
      cd.status AS division_status

    FROM competition_sessions cs

    INNER JOIN competition_divisions cd
      ON cd.id =
         cs.competition_division_id

    WHERE cs.id = ?

    LIMIT 1
    `,
    [id]
  );

  return (rows as any[])[0] ?? null;
}

// ==================================================
// FIND SESSION BY DIVISION
// ==================================================

// ==================================================
// FIND SESSION BY DIVISION
// ==================================================

export async function findSessionByDivisionId(
  competitionDivisionId: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        cs.id,
        cs.competition_division_id,
        cs.status,
        cs.started_at,
        cs.ended_at,
        cs.created_at,
        cs.updated_at,

        cd.competition_id,
        cd.name AS division_name,
        cd.skill_level,
        cd.format,
        cd.max_players,
        cd.entry_fee,
        cd.status AS division_status

      FROM competition_sessions cs

      INNER JOIN competition_divisions cd
        ON cd.id = cs.competition_division_id

      WHERE cs.competition_division_id = ?

      LIMIT 1
    `,
    [competitionDivisionId]
  );

  return (rows as any[])[0] ?? null;
}
// ==================================================
// CREATE SESSION
// ==================================================

export async function createSession(
  competitionDivisionId: number
) {
  const [result]: any =
    await db.execute(
      `
      INSERT INTO competition_sessions (
        competition_division_id,
        status
      )

      VALUES (
        ?,
        'scheduled'
      )
      `,
      [competitionDivisionId]
    );

  return findSessionById(
    result.insertId
  );
}

// ==================================================
// UPDATE SESSION STATUS
// ==================================================

export async function updateSessionStatus(
  id: number,
  status: string
) {
  if (status === "live") {
    await db.execute(
      `
      UPDATE competition_sessions

      SET
        status = 'live',

        started_at =
          COALESCE(
            started_at,
            CURRENT_TIMESTAMP
          ),

        ended_at = NULL

      WHERE id = ?
      `,
      [id]
    );
  }

  else if (status === "paused") {
    await db.execute(
      `
      UPDATE competition_sessions

      SET
        status = 'paused'

      WHERE id = ?
      `,
      [id]
    );
  }

  else if (
    status === "completed"
  ) {
    await db.execute(
      `
      UPDATE competition_sessions

      SET
        status = 'completed',

        ended_at =
          CURRENT_TIMESTAMP

      WHERE id = ?
      `,
      [id]
    );
  }

  else if (
    status === "cancelled"
  ) {
    await db.execute(
      `
      UPDATE competition_sessions

      SET
        status = 'cancelled',

        ended_at =
          CURRENT_TIMESTAMP

      WHERE id = ?
      `,
      [id]
    );
  }

  else {
    await db.execute(
      `
      UPDATE competition_sessions

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

  return findSessionById(id);
}