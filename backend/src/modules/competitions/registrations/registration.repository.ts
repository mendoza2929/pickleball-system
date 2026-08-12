import db from "../../../config/database";

// --------------------------------------------------
// FIND REGISTRATION BY ID
// --------------------------------------------------

export async function findRegistrationById(
  id: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        cr.id,
        cr.competition_division_id,
        cr.competition_player_id,
        cr.status,
        cr.registered_at,

        -- PAYMENT
        cr.payment_method,
        cr.payment_amount,
        cr.payment_status,
        cr.payment_proof_url,
        cr.payment_reference,
        cr.payment_paid_at,

        cd.competition_id,
        cd.name AS division_name,
        cd.skill_level AS division_skill_level,
        cd.format,
        cd.max_players,
        cd.entry_fee,
        cd.status AS division_status,

        cp.customer_id,
        cp.skill_level AS player_skill_level,
        cp.status AS player_status,

        c.customer_no,
        c.first_name,
        c.last_name,
        c.email,
        c.phone

      FROM competition_registrations cr

      INNER JOIN competition_divisions cd
        ON cd.id = cr.competition_division_id

      INNER JOIN competition_players cp
        ON cp.id = cr.competition_player_id

      INNER JOIN customers c
        ON c.id = cp.customer_id

      WHERE cr.id = ?

      LIMIT 1
    `,
    [id]
  );

  return (rows as any[])[0] ?? null;
}

// --------------------------------------------------
// FIND EXISTING REGISTRATION
// --------------------------------------------------

export async function findRegistration(
  competitionDivisionId: number,
  competitionPlayerId: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        competition_division_id,
        competition_player_id,
        status,
        registered_at,

        payment_method,
        payment_amount,
        payment_status,
        payment_proof_url,
        payment_reference,
        payment_paid_at

      FROM competition_registrations

      WHERE competition_division_id = ?
        AND competition_player_id = ?

      LIMIT 1
    `,
    [
      competitionDivisionId,
      competitionPlayerId,
    ]
  );

  return (rows as any[])[0] ?? null;
}

// --------------------------------------------------
// COUNT CONFIRMED REGISTRATIONS
//
// IMPORTANT:
//
// ONLY "confirmed" consumes a division slot.
//
// pending     = does NOT consume slot
// confirmed   = consumes slot
// waitlisted  = does NOT consume slot
// cancelled   = does NOT consume slot
// --------------------------------------------------

export async function countConfirmedRegistrations(
  competitionDivisionId: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        COUNT(*) AS total

      FROM competition_registrations

      WHERE competition_division_id = ?

        AND status = 'confirmed'
    `,
    [competitionDivisionId]
  );

  return Number(
    (rows as any[])[0]?.total ?? 0
  );
}

// --------------------------------------------------
// GET DIVISION CAPACITY
//
// Returns:
//
// max_players
// confirmed_players
// remaining_slots
// is_full
// --------------------------------------------------

export async function getDivisionCapacity(
  competitionDivisionId: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        cd.id AS competition_division_id,

        cd.max_players,

        COUNT(
          CASE
            WHEN cr.status = 'confirmed'
            THEN 1
          END
        ) AS confirmed_players

      FROM competition_divisions cd

      LEFT JOIN competition_registrations cr
        ON cr.competition_division_id = cd.id

      WHERE cd.id = ?

      GROUP BY
        cd.id,
        cd.max_players
    `,
    [competitionDivisionId]
  );

  const row =
    (rows as any[])[0] ?? null;

  if (!row) {
    return null;
  }

  const maxPlayers =
    row.max_players === null ||
    row.max_players === undefined
      ? null
      : Number(row.max_players);

  const confirmedPlayers =
    Number(row.confirmed_players ?? 0);

  const remainingSlots =
    maxPlayers === null
      ? null
      : Math.max(
          maxPlayers - confirmedPlayers,
          0
        );

  const isFull =
    maxPlayers !== null &&
    confirmedPlayers >= maxPlayers;

  return {
    competition_division_id:
      Number(
        row.competition_division_id
      ),

    max_players:
      maxPlayers,

    confirmed_players:
      confirmedPlayers,

    remaining_slots:
      remainingSlots,

    is_full:
      isFull,
  };
}

// --------------------------------------------------
// CREATE REGISTRATION
// --------------------------------------------------

export async function createRegistration(
  competitionDivisionId: number,
  competitionPlayerId: number,
  paymentMethod: string | null = null,
  paymentAmount: number | null = null,
  paymentProofUrl: string | null = null
) {
  const [result]: any =
    await db.execute(
      `
        INSERT INTO competition_registrations (
          competition_division_id,
          competition_player_id,
          status,
          payment_method,
          payment_amount,
          payment_status,
          payment_proof_url
        )

        VALUES (
          ?,
          ?,
          'pending',
          ?,
          ?,
          'pending',
          ?
        )
      `,
      [
        competitionDivisionId,
        competitionPlayerId,
        paymentMethod,
        paymentAmount,
        paymentProofUrl,
      ]
    );

  return findRegistrationById(
    result.insertId
  );
}

// --------------------------------------------------
// GET REGISTRATIONS BY DIVISION
// --------------------------------------------------

export async function findRegistrationsByDivisionId(
  competitionDivisionId: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        cr.id,
        cr.competition_division_id,
        cr.competition_player_id,
        cr.status,
        cr.registered_at,

        -- PAYMENT
        cr.payment_method,
        cr.payment_amount,
        cr.payment_status,
        cr.payment_proof_url,
        cr.payment_reference,
        cr.payment_paid_at,

        cp.customer_id,
        cp.skill_level AS player_skill_level,
        cp.status AS player_status,

        c.id AS customer_id,
        c.customer_no,
        c.first_name,
        c.last_name,
        c.email,
        c.phone

      FROM competition_registrations cr

      INNER JOIN competition_players cp
        ON cp.id = cr.competition_player_id

      INNER JOIN customers c
        ON c.id = cp.customer_id

      WHERE cr.competition_division_id = ?

      ORDER BY cr.registered_at ASC
    `,
    [competitionDivisionId]
  );

  return rows;
}

// --------------------------------------------------
// UPDATE REGISTRATION STATUS
// --------------------------------------------------

export async function updateRegistrationStatus(
  id: number,
  status: string
) {
  await db.execute(
    `
      UPDATE competition_registrations

      SET status = ?

      WHERE id = ?
    `,
    [
      status,
      id,
    ]
  );

  return findRegistrationById(id);
}

// --------------------------------------------------
// UPDATE PAYMENT STATUS
// --------------------------------------------------

export async function updatePaymentStatus(
  id: number,
  paymentStatus:
    | "pending"
    | "confirmed"
    | "rejected"
) {
  await db.execute(
    `
      UPDATE competition_registrations

      SET
        payment_status = ?,

        payment_paid_at =
          CASE
            WHEN ? = 'confirmed'
            THEN NOW()

            ELSE payment_paid_at
          END

      WHERE id = ?
    `,
    [
      paymentStatus,
      paymentStatus,
      id,
    ]
  );

  return findRegistrationById(id);
}

// --------------------------------------------------
// UPDATE PAYMENT REFERENCE
// --------------------------------------------------

export async function updatePaymentDetails(
  id: number,
  data: {
    paymentStatus:
      | "pending"
      | "confirmed"
      | "rejected";

    paymentReference?: string | null;
  }
) {
  await db.execute(
    `
      UPDATE competition_registrations

      SET
        payment_status = ?,

        payment_reference = ?,

        payment_paid_at =
          CASE
            WHEN ? = 'confirmed'
            THEN NOW()

            ELSE payment_paid_at
          END

      WHERE id = ?
    `,
    [
      data.paymentStatus,
      data.paymentReference ?? null,
      data.paymentStatus,
      id,
    ]
  );

  return findRegistrationById(id);
}