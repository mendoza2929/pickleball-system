// player.repository.ts

import db from "../../../config/database";
import {
  CreateCompetitionPlayerInput,
  UpdateCompetitionPlayerInput,
} from "./player.types";

export async function findAllCompetitionPlayers() {
  const [rows] = await db.execute(`
    SELECT
      cp.id,
      cp.customer_id,
      cp.skill_level,
      cp.status,
      cp.created_at,
      cp.updated_at,
      c.customer_no,
      c.first_name,
      c.last_name,
      c.email,
      c.phone
    FROM competition_players cp
    INNER JOIN customers c
      ON c.id = cp.customer_id
    ORDER BY cp.created_at DESC
  `);

  return rows;
}

export async function findCompetitionPlayerById(id: number) {
  const [rows] = await db.execute(
    `
      SELECT
        cp.id,
        cp.customer_id,
        cp.skill_level,
        cp.status,
        cp.created_at,
        cp.updated_at,
        c.customer_no,
        c.first_name,
        c.last_name,
        c.email,
        c.phone
      FROM competition_players cp
      INNER JOIN customers c
        ON c.id = cp.customer_id
      WHERE cp.id = ?
      LIMIT 1
    `,
    [id]
  );

  return (rows as any[])[0] ?? null;
}

export async function findByCustomerId(customerId: number) {
  const [rows] = await db.execute(
    `
      SELECT *
      FROM competition_players
      WHERE customer_id = ?
      LIMIT 1
    `,
    [customerId]
  );

  return (rows as any[])[0] ?? null;
}

export async function createCompetitionPlayer(
  data: CreateCompetitionPlayerInput
) {
  const [result]: any = await db.execute(
    `
      INSERT INTO competition_players (
        customer_id,
        skill_level
      )
      VALUES (?, ?)
    `,
    [data.customerId, data.skillLevel]
  );

  return findCompetitionPlayerById(result.insertId);
}

export async function updateCompetitionPlayer(
  id: number,
  data: UpdateCompetitionPlayerInput
) {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.skillLevel !== undefined) {
    fields.push("skill_level = ?");
    values.push(data.skillLevel);
  }

  if (data.status !== undefined) {
    fields.push("status = ?");
    values.push(data.status);
  }

  if (!fields.length) {
    return findCompetitionPlayerById(id);
  }

  values.push(id);

  await db.execute(
    `
      UPDATE competition_players
      SET ${fields.join(", ")}
      WHERE id = ?
    `,
    values
  );

  return findCompetitionPlayerById(id);
}