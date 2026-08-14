import db from "../../../config/database";

import {
  CreateDivisionInput,
  UpdateDivisionInput,
} from "./division.types";

// ==================================================
// GET DIVISIONS BY COMPETITION
// ==================================================

export async function findDivisionsByCompetitionId(
  competitionId: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        cd.id,
        cd.competition_id,
        cd.name,
        cd.skill_level,
        cd.format,
        cd.max_players,
        cd.entry_fee,
        cd.status,
        cd.created_at,
        cd.updated_at,

        /* ==================================================
         * CONFIRMED REGISTRATIONS
         *
         * This is what counts toward division capacity.
         *
         * pending   = does NOT count
         * confirmed = COUNTS
         * cancelled = does NOT count
         *
         * Check-in status is intentionally NOT used here.
         * ================================================== */

        COUNT(
          DISTINCT CASE
            WHEN cr.status = 'confirmed'
            THEN cr.id
          END
        ) AS confirmed_players,

        /* ==================================================
         * CHECKED-IN PLAYERS
         *
         * Kept separately for check-in statistics.
         * This does NOT determine remaining slots.
         * ================================================== */

        COUNT(
          DISTINCT CASE
            WHEN cc.status = 'checked_in'
            THEN cc.id
          END
        ) AS checked_in_players,

        /* ==================================================
         * REMAINING SLOTS
         *
         * IMPORTANT:
         * Remaining capacity is based on CONFIRMED
         * registrations, NOT check-ins.
         * ================================================== */

        CASE
          WHEN cd.max_players IS NULL
          THEN NULL

          ELSE GREATEST(
            cd.max_players -
            COUNT(
              DISTINCT CASE
                WHEN cr.status = 'confirmed'
                THEN cr.id
              END
            ),
            0
          )
        END AS remaining_slots

      FROM competition_divisions cd

      LEFT JOIN competition_registrations cr
        ON cr.competition_division_id = cd.id

      LEFT JOIN competition_checkins cc
        ON cc.competition_registration_id = cr.id

      WHERE cd.competition_id = ?

      GROUP BY
        cd.id,
        cd.competition_id,
        cd.name,
        cd.skill_level,
        cd.format,
        cd.max_players,
        cd.entry_fee,
        cd.status,
        cd.created_at,
        cd.updated_at

      ORDER BY cd.id ASC
    `,
    [competitionId]
  );

  return (rows as any[]).map(
    (division) => ({
      ...division,

      // -----------------------------------------------
      // CONFIRMED REGISTRATIONS
      // -----------------------------------------------

      confirmed_players:
        Number(
          division.confirmed_players ?? 0
        ),

      // -----------------------------------------------
      // CHECKED-IN PLAYERS
      //
      // This remains separate.
      // -----------------------------------------------

      checked_in_players:
        Number(
          division.checked_in_players ?? 0
        ),

      // -----------------------------------------------
      // REMAINING SLOTS
      //
      // Based on confirmed registrations.
      // -----------------------------------------------

      remaining_slots:
        division.remaining_slots === null
          ? null
          : Number(
              division.remaining_slots
            ),
    })
  );
}

// ==================================================
// GET ONE DIVISION
// ==================================================

export async function findDivisionById(
  id: number
) {
  const [rows] = await db.execute(
    `
      SELECT
        cd.id,
        cd.competition_id,
        cd.name,
        cd.skill_level,
        cd.format,
        cd.max_players,
        cd.entry_fee,
        cd.status,
        cd.created_at,
        cd.updated_at,

        /* ==================================================
         * CONFIRMED REGISTRATIONS
         * ================================================== */

        COUNT(
          DISTINCT CASE
            WHEN cr.status = 'confirmed'
            THEN cr.id
          END
        ) AS confirmed_players,

        /* ==================================================
         * CHECKED-IN PLAYERS
         *
         * Separate from capacity.
         * ================================================== */

        COUNT(
          DISTINCT CASE
            WHEN cc.status = 'checked_in'
            THEN cc.id
          END
        ) AS checked_in_players,

        /* ==================================================
         * REMAINING SLOTS
         *
         * Based on CONFIRMED registrations.
         * ================================================== */

        CASE
          WHEN cd.max_players IS NULL
          THEN NULL

          ELSE GREATEST(
            cd.max_players -
            COUNT(
              DISTINCT CASE
                WHEN cr.status = 'confirmed'
                THEN cr.id
              END
            ),
            0
          )
        END AS remaining_slots

      FROM competition_divisions cd

      LEFT JOIN competition_registrations cr
        ON cr.competition_division_id = cd.id

      LEFT JOIN competition_checkins cc
        ON cc.competition_registration_id =
           cr.id

      WHERE cd.id = ?

      GROUP BY
        cd.id,
        cd.competition_id,
        cd.name,
        cd.skill_level,
        cd.format,
        cd.max_players,
        cd.entry_fee,
        cd.status,
        cd.created_at,
        cd.updated_at

      LIMIT 1
    `,
    [id]
  );

  const division =
    (rows as any[])[0] ?? null;

  if (!division) {
    return null;
  }

  return {
    ...division,

    // -----------------------------------------------
    // CONFIRMED
    // -----------------------------------------------

    confirmed_players:
      Number(
        division.confirmed_players ?? 0
      ),

    // -----------------------------------------------
    // CHECKED-IN
    // -----------------------------------------------

    checked_in_players:
      Number(
        division.checked_in_players ?? 0
      ),

    // -----------------------------------------------
    // REMAINING
    // -----------------------------------------------

    remaining_slots:
      division.remaining_slots === null
        ? null
        : Number(
            division.remaining_slots
          ),
  };
}

// ==================================================
// CREATE
// ==================================================

export async function createDivision(
  data: CreateDivisionInput
) {
  const [result]: any =
    await db.execute(
      `
        INSERT INTO competition_divisions (
          competition_id,
          name,
          skill_level,
          format,
          max_players,
          entry_fee,
          status
        )

        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.competitionId,
        data.name.trim(),
        data.skillLevel,
        data.format,
        data.maxPlayers ?? null,
        data.entryFee ?? 0,
        data.status ?? "open",
      ]
    );

  return findDivisionById(
    result.insertId
  );
}

// ==================================================
// UPDATE
// ==================================================

export async function updateDivision(
  id: number,
  data: UpdateDivisionInput
) {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(
      data.name.trim()
    );
  }

  if (
    data.skillLevel !== undefined
  ) {
    fields.push(
      "skill_level = ?"
    );

    values.push(
      data.skillLevel
    );
  }

  if (
    data.format !== undefined
  ) {
    fields.push(
      "format = ?"
    );

    values.push(
      data.format
    );
  }

  if (
    data.maxPlayers !== undefined
  ) {
    fields.push(
      "max_players = ?"
    );

    values.push(
      data.maxPlayers
    );
  }

  if (
    data.entryFee !== undefined
  ) {
    fields.push(
      "entry_fee = ?"
    );

    values.push(
      data.entryFee
    );
  }

  if (
    data.status !== undefined
  ) {
    fields.push(
      "status = ?"
    );

    values.push(
      data.status
    );
  }

  if (
    fields.length === 0
  ) {
    return findDivisionById(id);
  }

  values.push(id);

  await db.execute(
    `
      UPDATE competition_divisions

      SET
        ${fields.join(", ")}

      WHERE id = ?
    `,
    values
  );

  return findDivisionById(id);
}