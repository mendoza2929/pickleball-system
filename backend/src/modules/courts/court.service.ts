import { CourtRepository } from "./court.repository";
import {
  CreateCourtInput,
  UpdateCourtInput,
} from "./court.validator";

import { ConflictError } from "../../shared/errors/ConflictError";
import { NotFoundError } from "../../shared/errors/NotFoundError";

export class CourtService {
  private courtRepository = new CourtRepository();

  /**
   * Create Court
   */
  async createCourt(data: CreateCourtInput) {
    // Check duplicate court number
    const courtExists =
      await this.courtRepository.findByCourtNumber(data.court_number);

    if (courtExists) {
      throw new ConflictError("Court number already exists.");
    }

    return await this.courtRepository.createCourt(data);
  }

  /**
   * Get All Courts
   */
  async getAllCourts() {
    return await this.courtRepository.findAll();
  }

  /**
   * Get Court By ID
   */
  async getCourtById(id: number) {
    const court = await this.courtRepository.findById(id);

    if (!court) {
      throw new NotFoundError("Court not found.");
    }

    return court;
  }

  /**
   * Update Court
   */
  async updateCourt(
    id: number,
    data: UpdateCourtInput
  ) {
    const court = await this.courtRepository.findById(id);

    if (!court) {
      throw new NotFoundError("Court not found.");
    }

    // Check duplicate court number
    if (
      data.court_number &&
      data.court_number !== court.court_number
    ) {
      const exists =
        await this.courtRepository.findByCourtNumber(
          data.court_number
        );

      if (exists) {
        throw new ConflictError(
          "Court number already exists."
        );
      }
    }

    return await this.courtRepository.updateCourt(id, data);
  }

  /**
   * Delete Court
   */
  async deleteCourt(id: number) {
    const court = await this.courtRepository.findById(id);

    if (!court) {
      throw new NotFoundError("Court not found.");
    }

    await this.courtRepository.deleteCourt(id);

    return {
      message: "Court deleted successfully.",
    };
  }

  async getAvailableCourts() {
    return await this.courtRepository.findAvailableCourts();
  }
}