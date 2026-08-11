import db from "../../../config/database";

// --------------------------------------------------
// FIND CHECK-IN BY ID
// --------------------------------------------------

export async function findCheckinById(
  id: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        cc.id,
        cc.competition_registration_id,
        cc.status,
        cc.checked_in_at,
        cc.checked_out_at,
        cc.created_at,
        cc.updated_at,

        cr.competition_division_id,
        cr.competition_player_id,
        cr.status AS registration_status,

        cd.competition_id,
        cd.name AS division_name,
        cd.skill_level,
        cd.format,

        cp.customer_id,
        cp.skill_level AS player_skill_level,

        c.customer_no,
        c.first_name,
        c.last_name,
        c.email,
        c.phone

      FROM competition_checkins cc

      INNER JOIN competition_registrations cr
        ON cr.id =
           cc.competition_registration_id

      INNER JOIN competition_divisions cd
        ON cd.id =
           cr.competition_division_id

      INNER JOIN competition_players cp
        ON cp.id =
           cr.competition_player_id

      INNER JOIN customers c
        ON c.id =
           cp.customer_id

      WHERE cc.id = ?

      LIMIT 1
    `,
    [id]
  );

  return (rows as any[])[0] ?? null;
}

// --------------------------------------------------
// FIND CHECK-IN BY REGISTRATION
// --------------------------------------------------

export async function findCheckinByRegistrationId(
  competitionRegistrationId: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        competition_registration_id,
        status,
        checked_in_at,
        checked_out_at,
        created_at,
        updated_at

      FROM competition_checkins

      WHERE competition_registration_id = ?

      LIMIT 1
    `,
    [competitionRegistrationId]
  );

  return (rows as any[])[0] ?? null;
}

// --------------------------------------------------
// CREATE CHECK-IN
// --------------------------------------------------

export async function createCheckin(
  competitionRegistrationId: number
) {
  const [result]: any = await db.execute(
    `
      INSERT INTO competition_checkins (
        competition_registration_id,
        status,
        checked_in_at
      )

      VALUES (
        ?,
        'checked_in',
        CURRENT_TIMESTAMP
      )
    `,
    [competitionRegistrationId]
  );

  return findCheckinById(
    result.insertId
  );
}

// --------------------------------------------------
// GET CHECK-INS BY DIVISION
// --------------------------------------------------

export async function findCheckinsByDivisionId(
  competitionDivisionId: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        cc.id,
        cc.competition_registration_id,
        cc.status,
        cc.checked_in_at,
        cc.checked_out_at,

        cr.competition_player_id,

        cp.customer_id,
        cp.skill_level AS player_skill_level,

        c.customer_no,
        c.first_name,
        c.last_name,
        c.email,
        c.phone

      FROM competition_checkins cc

      INNER JOIN competition_registrations cr
        ON cr.id =
           cc.competition_registration_id

      INNER JOIN competition_players cp
        ON cp.id =
           cr.competition_player_id

      INNER JOIN customers c
        ON c.id =
           cp.customer_id

      WHERE cr.competition_division_id = ?

      ORDER BY cc.checked_in_at ASC
    `,
    [competitionDivisionId]
  );

  return rows;
}

// --------------------------------------------------
// UPDATE CHECK-IN STATUS
// --------------------------------------------------

export async function updateCheckinStatus(
  id: number,
  status: string
) {
  if (status === "checked_in") {
    await db.execute(
      `
        UPDATE competition_checkins

        SET
          status = 'checked_in',
          checked_in_at =
            COALESCE(
              checked_in_at,
              CURRENT_TIMESTAMP
            ),
          checked_out_at = NULL

        WHERE id = ?
      `,
      [id]
    );
  }

  if (status === "no_show") {
    await db.execute(
      `
        UPDATE competition_checkins

        SET
          status = 'no_show',
          checked_out_at = NULL

        WHERE id = ?
      `,
      [id]
    );
  }

  if (status === "cancelled") {
    await db.execute(
      `
        UPDATE competition_checkins

        SET
          status = 'cancelled',
          checked_out_at = CURRENT_TIMESTAMP

        WHERE id = ?
      `,
      [id]
    );
  }

  return findCheckinById(id);
}