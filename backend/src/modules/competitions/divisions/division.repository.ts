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
  const [rows] =
    await db.execute(
      `
        SELECT
          id,
          competition_id,
          name,
          skill_level,
          format,
          max_players,
          entry_fee,
          status,
          created_at,
          updated_at
        FROM competition_divisions
        WHERE competition_id = ?
        ORDER BY id ASC
      `,
      [competitionId]
    );

  return rows as any[];
}

// ==================================================
// GET ONE
// ==================================================

export async function findDivisionById(
  id: number
) {
  const [rows] =
    await db.execute(
      `
        SELECT
          id,
          competition_id,
          name,
          skill_level,
          format,
          max_players,
          entry_fee,
          status,
          created_at,
          updated_at
        FROM competition_divisions
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

  return (
    (rows as any[])[0] ??
    null
  );
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
    values.push(data.name.trim());
  }

  if (
    data.skillLevel !==
    undefined
  ) {
    fields.push(
      "skill_level = ?"
    );
    values.push(
      data.skillLevel
    );
  }

  if (data.format !== undefined) {
    fields.push("format = ?");
    values.push(data.format);
  }

  if (
    data.maxPlayers !==
    undefined
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
    fields.push("entry_fee = ?");
    values.push(
      data.entryFee
    );
  }

  if (data.status !== undefined) {
    fields.push("status = ?");
    values.push(data.status);
  }

  if (fields.length === 0) {
    return findDivisionById(id);
  }

  values.push(id);

  await db.execute(
    `
      UPDATE competition_divisions
      SET ${fields.join(", ")}
      WHERE id = ?
    `,
    values
  );

  return findDivisionById(id);
}