import { CourtScheduleRepository } from "./courtSchedule.repository";
import { CourtRepository } from "../courts/court.repository";

import {
  CreateCourtScheduleInput,
  UpdateCourtScheduleInput,
} from "./courtSchedule.validator";

import { BadRequestError } from "../../shared/errors/BadRequestError";
import { ConflictError } from "../../shared/errors/ConflictError";
import { NotFoundError } from "../../shared/errors/NotFoundError";

export class CourtScheduleService {
  private scheduleRepository = new CourtScheduleRepository();
  private courtRepository = new CourtRepository();

  /**
   * Create Schedule
   */
  async createSchedule(data: CreateCourtScheduleInput) {
    // Check court exists
    const court = await this.courtRepository.findById(data.court_id);

    if (!court) {
      throw new NotFoundError("Court not found.");
    }

    // Check duplicate day
    const existing = await this.scheduleRepository.findByCourtAndDay(
      data.court_id,
      data.day_of_week
    );

    if (existing) {
      throw new ConflictError(
        `${data.day_of_week} schedule already exists for this court.`
      );
    }

    // Validate time
    if (data.open_time >= data.close_time) {
      throw new BadRequestError(
        "Close time must be greater than open time."
      );
    }

    return await this.scheduleRepository.create(data);
  }

  /**
   * Get All Schedules
   */
  async getSchedules() {
    return await this.scheduleRepository.findAll();
  }

  /**
   * Get Schedules By Court
   */
  async getCourtSchedules(courtId: number) {
    const court = await this.courtRepository.findById(courtId);

    if (!court) {
      throw new NotFoundError("Court not found.");
    }

    return await this.scheduleRepository.findByCourt(courtId);
  }

  /**
   * Update Schedule
   */
  async updateSchedule(
    id: number,
    data: UpdateCourtScheduleInput
  ) {
    const schedule = await this.scheduleRepository.findById(id);

    if (!schedule) {
      throw new NotFoundError("Schedule not found.");
    }

    if (
      data.open_time &&
      data.close_time &&
      data.open_time >= data.close_time
    ) {
      throw new BadRequestError(
        "Close time must be greater than open time."
      );
    }

    return await this.scheduleRepository.update(id, data);
  }

  /**
   * Delete Schedule
   */
  async deleteSchedule(id: number) {
    const schedule = await this.scheduleRepository.findById(id);

    if (!schedule) {
      throw new NotFoundError("Schedule not found.");
    }

    await this.scheduleRepository.delete(id);

    return {
      message: "Schedule deleted successfully.",
    };
  }
}