import { randomUUID } from "crypto";
import pool from "../../config/database";
import {
  CreateCourtInput,
  UpdateCourtInput,
} from "./court.validator";

export class CourtRepository {
  /**
   * Create Court
   */
  async createCourt(data: CreateCourtInput) {
    const uuid = randomUUID();

    const [result]: any = await pool.query(
      `
      INSERT INTO courts (
        uuid,
        court_number,
        name,
        description,
        surface_type,
        hourly_rate
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        uuid,
        data.court_number,
        data.name,
        data.description ?? null,
        data.surface_type,
        data.hourly_rate,
      ]
    );

    return this.findById(result.insertId);
  }

  /**
   * Get All Courts
   */
  async findAll() {
    const [rows]: any = await pool.query(
      `
      SELECT
        id,
        uuid,
        court_number,
        name,
        description,
        surface_type,
        hourly_rate,
        status,
        created_at,
        updated_at
      FROM courts
      WHERE is_deleted = 0
      ORDER BY court_number ASC
      `
    );

    return rows;
  }

  /**
   * Get Court by ID
   */
  async findById(id: number) {
    const [rows]: any = await pool.query(
      `
      SELECT
        id,
        uuid,
        court_number,
        name,
        description,
        surface_type,
        hourly_rate,
        status,
        created_at,
        updated_at
      FROM courts
      WHERE id = ?
      AND is_deleted = 0
      LIMIT 1
      `,
      [id]
    );

    return rows[0];
  }

  /**
   * Check Duplicate Court Number
   */
  async findByCourtNumber(courtNumber: number) {
    const [rows]: any = await pool.query(
      `
      SELECT id
      FROM courts
      WHERE court_number = ?
      AND is_deleted = 0
      LIMIT 1
      `,
      [courtNumber]
    );

    return rows[0];
  }

  /**
   * Update Court
   */
  async updateCourt(
    id: number,
    data: UpdateCourtInput
  ) {
    await pool.query(
      `
      UPDATE courts
      SET
        court_number = ?,
        name = ?,
        description = ?,
        surface_type = ?,
        hourly_rate = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        data.court_number,
        data.name,
        data.description ?? null,
        data.surface_type,
        data.hourly_rate,
        id,
      ]
    );

    return this.findById(id);
  }

  /**
   * Soft Delete
   */
  async deleteCourt(id: number) {
    await pool.query(
      `
      UPDATE courts
      SET
        is_deleted = 1,
        updated_at = NOW()
      WHERE id = ?
      `,
      [id]
    );
  }
}