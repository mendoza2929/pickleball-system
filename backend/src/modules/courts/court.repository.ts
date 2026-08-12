import { randomUUID } from "crypto";
import pool from "../../config/database";
import {
  CreateCourtInput,
  UpdateCourtInput,
} from "./court.validator";

export class CourtRepository {
  /**
   * Create Court
   *
   * Creates the court and automatically creates
   * a default schedule for all 7 days:
   *
   * Monday    09:00 - 22:00
   * Tuesday   09:00 - 22:00
   * Wednesday 09:00 - 22:00
   * Thursday  09:00 - 22:00
   * Friday    09:00 - 22:00
   * Saturday  09:00 - 22:00
   * Sunday    09:00 - 22:00
   */
  async createCourt(data: CreateCourtInput) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // =====================================================
      // CREATE COURT
      // =====================================================

      const uuid = randomUUID();

      const [result]: any = await connection.query(
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

      const courtId = result.insertId;

      // =====================================================
      // CREATE DEFAULT COURT SCHEDULES
      // =====================================================

      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      for (const day of days) {
        await connection.query(
          `
          INSERT INTO court_schedules (
            uuid,
            court_id,
            day_of_week,
            open_time,
            close_time,
            is_closed
          )
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            randomUUID(),
            courtId,
            day,
            "09:00:00",
            "22:00:00",
            false,
          ]
        );
      }

      // =====================================================
      // COMMIT
      // =====================================================

      await connection.commit();

      // Return the newly created court
      return this.findById(courtId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
          status = ?,
          updated_at = NOW()
        WHERE id = ?
        `,
        [
          data.court_number,
          data.name,
          data.description ?? null,
          data.surface_type,
          data.hourly_rate,
          data.status ?? "Available",
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

  async findAvailableCourts() {
    const [rows]: any = await pool.query(
      `
      SELECT
        c.id,
        c.uuid,
        c.court_number,
        c.name,
        c.description,
        c.surface_type,
        c.hourly_rate,
        c.status
      FROM courts c

      WHERE c.is_deleted = 0
        AND c.status = 'Available'

      ORDER BY c.court_number ASC
      `
    );

    return rows;
  }
}