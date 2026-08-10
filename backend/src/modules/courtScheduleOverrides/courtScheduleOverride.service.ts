import { CourtScheduleOverrideRepository } from "./courtScheduleOverride.repository";

import {
  CreateCourtScheduleOverrideInput,
  UpdateCourtScheduleOverrideInput,
  CreateHolidayInput
} from "./courtScheduleOverride.validator";

import { NotFoundError } from "../../shared/errors/NotFoundError";
import { ConflictError } from "../../shared/errors/ConflictError";


import pool from "../../config/database";

export class CourtScheduleOverrideService {
  private repository =
    new CourtScheduleOverrideRepository();

  // ============================================================
  // CHECK COURT EXISTS
  // ============================================================

  private async ensureCourtExists(
    courtId: number
  ) {
    const [rows]: any = await pool.query(
      `
      SELECT id
      FROM courts
      WHERE id = ?
        AND is_deleted = 0
      LIMIT 1
      `,
      [courtId]
    );

    if (!rows.length) {
      throw new NotFoundError(
        "Court not found."
      );
    }
  }

  // ============================================================
  // VALIDATE OPEN/CLOSED STATE
  // ============================================================

  private validateScheduleState(
    isClosed: boolean,
    openTime: string | null,
    closeTime: string | null
  ) {
    // ==========================================================
    // CLOSED
    // ==========================================================

    if (isClosed) {
      return;
    }

    // ==========================================================
    // OPEN
    // ==========================================================

    if (!openTime || !closeTime) {
      throw new ConflictError(
        "Open time and close time are required when the schedule is open."
      );
    }

    // ==========================================================
    // TIME FORMAT
    // ==========================================================

    const timeRegex =
      /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(openTime)) {
      throw new ConflictError(
        "Invalid open time. Use HH:mm format."
      );
    }

    if (!timeRegex.test(closeTime)) {
      throw new ConflictError(
        "Invalid close time. Use HH:mm format."
      );
    }

    // ==========================================================
    // TIME ORDER
    // ==========================================================

    if (openTime >= closeTime) {
      throw new ConflictError(
        "Close time must be later than open time."
      );
    }
  }

  // ============================================================
  // CREATE
  // ============================================================

  async create(
    data: CreateCourtScheduleOverrideInput
  ) {
    // ==========================================================
    // CHECK COURT
    // ==========================================================

    if (data.court_id !== null) {
      await this.ensureCourtExists(
        data.court_id
      );
    }

    // ==========================================================
    // VALIDATE SCHEDULE
    // ==========================================================

    this.validateScheduleState(
      data.is_closed,
      data.open_time ?? null,
      data.close_time ?? null
    );

    // ==========================================================
    // CHECK DUPLICATE
    // ==========================================================

    const existing =
      await this.repository.findExistingOverride(
        data.court_id,
        data.schedule_date
      );

    if (existing) {
      if (data.court_id === null) {
        throw new ConflictError(
          "A global schedule override already exists for this date."
        );
      }

      throw new ConflictError(
        "A schedule override already exists for this court on this date."
      );
    }

    // ==========================================================
    // CREATE
    // ==========================================================

    return this.repository.create({
      court_id: data.court_id,
      schedule_date: data.schedule_date,
      open_time: data.open_time ?? null,
      close_time: data.close_time ?? null,
      is_closed: data.is_closed,
      reason: data.reason ?? null,
    });
  }

  // ============================================================
  // GET BY ID
  // ============================================================

  async getById(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new ConflictError(
        "Invalid schedule override ID."
      );
    }

    const override =
      await this.repository.findById(id);

    if (!override) {
      throw new NotFoundError(
        "Schedule override not found."
      );
    }

    return override;
  }

  // ============================================================
  // GET BY COURT
  // ============================================================

  async getByCourt(courtId: number) {
    if (!courtId || Number.isNaN(courtId)) {
      throw new ConflictError(
        "Invalid court ID."
      );
    }

    await this.ensureCourtExists(
      courtId
    );

    return this.repository.findByCourt(
      courtId
    );
  }

  // ============================================================
  // GET BY COURT + DATE
  // ============================================================

  async getByCourtAndDate(
    courtId: number,
    scheduleDate: string
  ) {
    if (!courtId || Number.isNaN(courtId)) {
      throw new ConflictError(
        "Invalid court ID."
      );
    }

    await this.ensureCourtExists(
      courtId
    );

    return this.repository.findByCourtAndDate(
      courtId,
      scheduleDate
    );
  }

  // ============================================================
  // UPDATE
  // ============================================================

  async update(
    id: number,
    data: UpdateCourtScheduleOverrideInput
  ) {
    // ==========================================================
    // GET EXISTING
    // ==========================================================

    const existing =
      await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundError(
        "Schedule override not found."
      );
    }

    // ==========================================================
    // BUILD FINAL VALUES
    // ==========================================================

    const courtId =
      data.court_id !== undefined
        ? data.court_id
        : existing.court_id;

    const scheduleDate =
      data.schedule_date ??
      existing.schedule_date;

    const isClosed =
      data.is_closed !== undefined
        ? data.is_closed
        : existing.is_closed;

    const openTime =
      data.open_time !== undefined
        ? data.open_time
        : existing.open_time;

    const closeTime =
      data.close_time !== undefined
        ? data.close_time
        : existing.close_time;

    const reason =
      data.reason !== undefined
        ? data.reason
        : existing.reason;

    // ==========================================================
    // CHECK COURT
    // ==========================================================

    if (courtId !== null) {
      await this.ensureCourtExists(
        courtId
      );
    }

    // ==========================================================
    // VALIDATE SCHEDULE
    // ==========================================================

    this.validateScheduleState(
      isClosed,
      openTime,
      closeTime
    );

    // ==========================================================
    // CHECK DUPLICATE
    // ==========================================================

    const duplicate =
      await this.repository.findExistingOverride(
        courtId,
        scheduleDate,
        id
      );

    if (duplicate) {
      if (courtId === null) {
        throw new ConflictError(
          "A global schedule override already exists for this date."
        );
      }

      throw new ConflictError(
        "A schedule override already exists for this court on this date."
      );
    }

    // ==========================================================
    // UPDATE
    // ==========================================================

    return this.repository.update(
      id,
      {
        court_id: courtId,
        schedule_date: scheduleDate,
        open_time: isClosed
          ? null
          : openTime,
        close_time: isClosed
          ? null
          : closeTime,
        is_closed: isClosed,
        reason,
      }
    );
  }

  // ============================================================
  // DELETE
  // ============================================================

  async delete(id: number) {
    const existing =
      await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundError(
        "Schedule override not found."
      );
    }

    await this.repository.delete(id);

    return {
      message:
        "Schedule override deleted successfully.",
    };
  }

  async getHolidays() {
    return this.repository.findHolidays();
    }

    // ============================================================
  // CREATE HOLIDAY
  // ============================================================

  async createHoliday(
    data: CreateHolidayInput
  ) {
    // ==========================================================
    // CHECK DUPLICATE HOLIDAY
    // ==========================================================

    const existing =
      await this.repository.findExistingOverride(
        null,
        data.schedule_date
      );

    if (existing) {
      throw new ConflictError(
        "A holiday already exists for this date."
      );
    }

    // ==========================================================
    // CREATE GLOBAL CLOSED OVERRIDE
    // ==========================================================

    return this.repository.create({
      court_id: null,
      schedule_date:
        data.schedule_date,
      open_time: null,
      close_time: null,
      is_closed: true,
      reason: data.reason,
    });
  }

  // ============================================================
  // DELETE HOLIDAY
  // ============================================================

  async deleteHoliday(id: number) {
    const holiday =
      await this.repository.findHolidayById(
        id
      );

    if (!holiday) {
      throw new NotFoundError(
        "Holiday not found."
      );
    }

    await this.repository.delete(id);

    return {
      message:
        "Holiday deleted successfully.",
    };
  }
}