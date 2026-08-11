import db from "../../config/database";

import {
  CreateCompetitionInput,
  UpdateCompetitionInput,
} from "./competition.types";

// ==================================================
// GET ALL
// ==================================================

export async function findAllCompetitions() {
  const [rows] =
    await db.execute(
      `
        SELECT
          id,
          name,
          type,
          status,
          start_at,
          end_at,
          registration_start_at,
          registration_end_at,
          description,
          created_by,
          created_at,
          updated_at
        FROM competitions
        ORDER BY start_at DESC
      `
    );

  return rows;
}

// ==================================================
// GET ONE
// ==================================================

export async function findCompetitionById(
  id: number
) {
  const [rows] =
    await db.execute(
      `
        SELECT
          id,
          name,
          type,
          status,
          start_at,
          end_at,
          registration_start_at,
          registration_end_at,
          description,
          created_by,
          created_at,
          updated_at
        FROM competitions
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

export async function createCompetition(
  data: CreateCompetitionInput
) {
  const [result]: any =
    await db.execute(
      `
        INSERT INTO competitions (
          name,
          type,
          status,
          start_at,
          end_at,
          registration_start_at,
          registration_end_at,
          description,
          created_by
        )
        VALUES (
          ?,
          ?,
          'draft',
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
      `,
      [
        data.name,
        data.type,
        data.startAt,
        data.endAt ?? null,
        data.registrationStartAt ??
          null,
        data.registrationEndAt ??
          null,
        data.description ??
          null,
        data.createdBy,
      ]
    );

  return findCompetitionById(
    result.insertId
  );
}

// ==================================================
// UPDATE
// ==================================================

export async function updateCompetition(
  id: number,
  data: UpdateCompetitionInput
) {
  const fields: string[] = [];

  const values: any[] = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(data.name);
  }

  if (data.type !== undefined) {
    fields.push("type = ?");
    values.push(data.type);
  }

  if (data.status !== undefined) {
    fields.push("status = ?");
    values.push(data.status);
  }

  if (data.startAt !== undefined) {
    fields.push("start_at = ?");
    values.push(data.startAt);
  }

  if (data.endAt !== undefined) {
    fields.push("end_at = ?");
    values.push(data.endAt);
  }

  if (
    data.registrationStartAt !==
    undefined
  ) {
    fields.push(
      "registration_start_at = ?"
    );

    values.push(
      data.registrationStartAt
    );
  }

  if (
    data.registrationEndAt !==
    undefined
  ) {
    fields.push(
      "registration_end_at = ?"
    );

    values.push(
      data.registrationEndAt
    );
  }

  if (
    data.description !== undefined
  ) {
    fields.push("description = ?");
    values.push(data.description);
  }

  if (fields.length === 0) {
    return findCompetitionById(id);
  }

  values.push(id);

  await db.execute(
    `
      UPDATE competitions
      SET ${fields.join(", ")}
      WHERE id = ?
    `,
    values
  );

  return findCompetitionById(id);
}

// ==================================================
// DELETE
// ==================================================

export async function deleteCompetition(
  id: number
) {
  const [result]: any =
    await db.execute(
      `
        DELETE FROM competitions
        WHERE id = ?
      `,
      [id]
    );

  return result.affectedRows > 0;
}