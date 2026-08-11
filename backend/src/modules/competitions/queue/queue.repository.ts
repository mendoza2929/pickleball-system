import db from "../../../config/database";

// ==================================================
// FIND QUEUE ENTRY BY ID
// ==================================================

export async function findQueueEntryById(
  id: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        cq.id,
        cq.competition_session_id,
        cq.competition_checkin_id,
        cq.queue_position,
        cq.status,
        cq.joined_at,
        cq.called_at,
        cq.removed_at,
        cq.created_at,
        cq.updated_at,

        cs.competition_division_id,
        cs.status AS session_status,

        cd.competition_id,
        cd.name AS division_name,
        cd.skill_level,
        cd.format,

        cr.competition_player_id,

        cp.customer_id,

        c.customer_no,
        c.first_name,
        c.last_name,
        c.email,
        c.phone

      FROM competition_queue cq

      INNER JOIN competition_sessions cs
        ON cs.id =
          cq.competition_session_id

      INNER JOIN competition_divisions cd
        ON cd.id =
          cs.competition_division_id

      INNER JOIN competition_checkins cc
        ON cc.id =
          cq.competition_checkin_id

      INNER JOIN competition_registrations cr
        ON cr.id =
          cc.competition_registration_id

      INNER JOIN competition_players cp
        ON cp.id =
          cr.competition_player_id

      INNER JOIN customers c
        ON c.id =
          cp.customer_id

      WHERE cq.id = ?

      LIMIT 1
    `,
    [id]
  );

  return (
    rows as any[]
  )[0] ?? null;
}

// ==================================================
// FIND QUEUE ENTRY BY CHECK-IN
// ==================================================

export async function findQueueEntryByCheckinId(
  competitionCheckinId: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        competition_session_id,
        competition_checkin_id,
        queue_position,
        status,
        joined_at,
        called_at,
        removed_at

      FROM competition_queue

      WHERE competition_checkin_id = ?

      ORDER BY id DESC

      LIMIT 1
    `,
    [competitionCheckinId]
  );

  return (
    rows as any[]
  )[0] ?? null;
}

// ==================================================
// GET NEXT QUEUE POSITION
// ==================================================

export async function getNextQueuePosition(
  competitionSessionId: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        COALESCE(
          MAX(queue_position),
          0
        ) + 1 AS next_position

      FROM competition_queue

      WHERE competition_session_id = ?
    `,
    [competitionSessionId]
  );

  return Number(
    (rows as any[])[0]
      ?.next_position ?? 1
  );
}

// ==================================================
// CREATE QUEUE ENTRY
// ==================================================

export async function createQueueEntry(
  competitionSessionId: number,
  competitionCheckinId: number,
  queuePosition: number
) {
  const [result]: any =
    await db.execute(
      `
        INSERT INTO competition_queue (
          competition_session_id,
          competition_checkin_id,
          queue_position,
          status,
          joined_at
        )

        VALUES (
          ?,
          ?,
          ?,
          'waiting',
          CURRENT_TIMESTAMP
        )
      `,
      [
        competitionSessionId,
        competitionCheckinId,
        queuePosition,
      ]
    );

  return findQueueEntryById(
    result.insertId
  );
}

// ==================================================
// GET QUEUE BY SESSION
// ==================================================

export async function findQueueBySessionId(
  competitionSessionId: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        cq.id,
        cq.competition_session_id,
        cq.competition_checkin_id,
        cq.queue_position,
        cq.status,
        cq.joined_at,
        cq.called_at,
        cq.removed_at,

        cr.competition_player_id,

        cp.customer_id,
        cp.skill_level AS player_skill_level,

        c.customer_no,
        c.first_name,
        c.last_name,
        c.email,
        c.phone

      FROM competition_queue cq

      INNER JOIN competition_checkins cc
        ON cc.id =
          cq.competition_checkin_id

      INNER JOIN competition_registrations cr
        ON cr.id =
          cc.competition_registration_id

      INNER JOIN competition_players cp
        ON cp.id =
          cr.competition_player_id

      INNER JOIN customers c
        ON c.id =
          cp.customer_id

      WHERE cq.competition_session_id = ?

      ORDER BY
        CASE
          WHEN cq.status = 'waiting'
            THEN 1

          WHEN cq.status = 'matched'
            THEN 2

          WHEN cq.status = 'called'
            THEN 3

          WHEN cq.status = 'playing'
            THEN 4

          WHEN cq.status = 'completed'
            THEN 5

          ELSE 6
        END,

        cq.queue_position ASC
    `,
    [competitionSessionId]
  );

  return rows as any[];
}

// ==================================================
// GET WAITING QUEUE
// ==================================================

export async function findWaitingQueue(
  competitionSessionId: number,
  limit: number
) {
  const [rows] =
    await db.query(
      `
        SELECT
          cq.id,
          cq.competition_session_id,
          cq.competition_checkin_id,
          cq.queue_position,
          cq.status,
          cq.joined_at,

          cr.competition_player_id,

          cp.customer_id,
          cp.skill_level AS player_skill_level,

          c.customer_no,
          c.first_name,
          c.last_name,
          c.email,
          c.phone

        FROM competition_queue cq

        INNER JOIN competition_checkins cc
          ON cc.id =
            cq.competition_checkin_id

        INNER JOIN competition_registrations cr
          ON cr.id =
            cc.competition_registration_id

        INNER JOIN competition_players cp
          ON cp.id =
            cr.competition_player_id

        INNER JOIN customers c
          ON c.id =
            cp.customer_id

        WHERE cq.competition_session_id = ?

          AND cq.status = 'waiting'

        ORDER BY
          cq.queue_position ASC

        LIMIT ?
      `,
      [
        competitionSessionId,
        limit,
      ]
    );

  return rows as any[];
}

// ==================================================
// UPDATE QUEUE STATUS
// ==================================================

export async function updateQueueStatus(
  id: number,
  status: string
) {
  // -----------------------------------------------
  // CALLED
  // -----------------------------------------------

  if (status === "called") {
    await db.execute(
      `
        UPDATE competition_queue

        SET
          status = 'called',

          called_at =
            COALESCE(
              called_at,
              CURRENT_TIMESTAMP
            )

        WHERE id = ?
      `,
      [id]
    );
  }

  // -----------------------------------------------
  // MATCHED
  // -----------------------------------------------

  else if (status === "matched") {
    await db.execute(
      `
        UPDATE competition_queue

        SET
          status = 'matched'

        WHERE id = ?
      `,
      [id]
    );
  }

  // -----------------------------------------------
  // REMOVED
  // -----------------------------------------------

  else if (status === "removed") {
    await db.execute(
      `
        UPDATE competition_queue

        SET
          status = 'removed',

          removed_at =
            CURRENT_TIMESTAMP

        WHERE id = ?
      `,
      [id]
    );
  }

  // -----------------------------------------------
  // OTHER STATUSES
  // -----------------------------------------------

  else {
    await db.execute(
      `
        UPDATE competition_queue

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

  return findQueueEntryById(id);
}