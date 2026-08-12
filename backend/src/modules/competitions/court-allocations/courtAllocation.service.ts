import {
  CourtAllocationRepository,
} from "./courtAllocation.repository";

import {
  CreateCourtAllocationInput,
  UpdateCourtAllocationInput,
} from "./courtAllocation.validator";

import {
  ConflictError,
} from "../../../shared/errors/ConflictError";

import {
  NotFoundError,
} from "../../../shared/errors/NotFoundError";

import {
  BadRequestError,
} from "../../../shared/errors/BadRequestError";

export class CourtAllocationService {
  private repository =
    new CourtAllocationRepository();

  // ==================================================
  // GET ALL ALLOCATIONS
  // ==================================================

  async getAllocations(
    competitionId: number
  ) {
    return this.repository.findAllByCompetition(
      competitionId
    );
  }

  // ==================================================
  // GET AVAILABLE COURTS
  // ==================================================

  async getAvailableCourts(
    competitionId: number,
    date: string,
    startTime: string,
    endTime: string
  ) {
    // -----------------------------------------------
    // Validate competition
    // -----------------------------------------------

    if (
      !Number.isInteger(competitionId) ||
      competitionId <= 0
    ) {
      throw new BadRequestError(
        "Invalid competition ID."
      );
    }

    // -----------------------------------------------
    // Validate date/time
    // -----------------------------------------------

    if (
      !date ||
      !startTime ||
      !endTime
    ) {
      throw new BadRequestError(
        "Date, start time, and end time are required."
      );
    }

    // -----------------------------------------------
    // Validate time
    // -----------------------------------------------

    if (
      startTime >= endTime
    ) {
      throw new BadRequestError(
        "Start time must be earlier than end time."
      );
    }

    // -----------------------------------------------
    // Find available courts
    // -----------------------------------------------

    return this.repository.findAvailableCourts(
      competitionId,
      date,
      startTime,
      endTime
    );
  }

  // ==================================================
  // GET ALLOCATION
  // ==================================================

  async getAllocation(
    id: number
  ) {
    const allocation =
      await this.repository.findById(id);

    if (!allocation) {
      throw new NotFoundError(
        "Court allocation not found."
      );
    }

    return allocation;
  }

  // ==================================================
  // CREATE ALLOCATION
  // ==================================================

  async createAllocation(
    data: CreateCourtAllocationInput
  ) {
    // -----------------------------------------------
    // Validate time
    // -----------------------------------------------

    if (
      data.start_time >=
      data.end_time
    ) {
      throw new BadRequestError(
        "Start time must be earlier than end time."
      );
    }

    // -----------------------------------------------
    // Court
    // -----------------------------------------------

    const court =
      await this.repository.findCourtById(
        data.court_id
      );

    if (!court) {
      throw new NotFoundError(
        "Court not found."
      );
    }

    // -----------------------------------------------
    // Deleted court
    // -----------------------------------------------

    if (
      Number(court.is_deleted) === 1
    ) {
      throw new BadRequestError(
        "Cannot allocate a deleted court."
      );
    }

    // -----------------------------------------------
    // Court status
    // -----------------------------------------------

    if (
      court.status !== "Available"
    ) {
      throw new BadRequestError(
        `Court is ${String(
          court.status
        ).toLowerCase()} and cannot be allocated.`
      );
    }

    // -----------------------------------------------
    // Check existing allocation
    // -----------------------------------------------

    const conflict =
      await this.repository.findConflict(
        data.court_id,
        data.allocation_date,
        data.start_time,
        data.end_time
      );

    if (conflict) {
      throw new ConflictError(
        `Court ${court.court_number} is already allocated from ${conflict.start_time} to ${conflict.end_time}.`
      );
    }

    // -----------------------------------------------
    // Create allocation
    // -----------------------------------------------

    return this.repository.create(
      data
    );
  }

  // ==================================================
  // UPDATE
  // ==================================================

  async updateAllocation(
    id: number,
    data: UpdateCourtAllocationInput
  ) {
    const allocation =
      await this.repository.findById(id);

    if (!allocation) {
      throw new NotFoundError(
        "Court allocation not found."
      );
    }

    // -----------------------------------------------
    // Only reserved allocations can be changed
    // -----------------------------------------------

    if (
      allocation.status !==
      "reserved"
    ) {
      throw new BadRequestError(
        "Only reserved court allocations can be modified."
      );
    }

    const startTime =
      data.start_time ??
      allocation.start_time;

    const endTime =
      data.end_time ??
      allocation.end_time;

    // -----------------------------------------------
    // Validate time
    // -----------------------------------------------

    if (
      startTime >= endTime
    ) {
      throw new BadRequestError(
        "Start time must be earlier than end time."
      );
    }

    // -----------------------------------------------
    // Check conflict
    // -----------------------------------------------

    const conflict =
      await this.repository.findConflict(
        allocation.court_id,
        allocation.allocation_date,
        startTime,
        endTime,
        id
      );

    if (conflict) {
      throw new ConflictError(
        `Court is already allocated from ${conflict.start_time} to ${conflict.end_time}.`
      );
    }

    // -----------------------------------------------
    // Update
    // -----------------------------------------------

    return this.repository.update(
      id,
      data
    );
  }

  // ==================================================
  // RELEASE
  // ==================================================

  async releaseAllocation(
    id: number
  ) {
    const allocation =
      await this.repository.findById(id);

    if (!allocation) {
      throw new NotFoundError(
        "Court allocation not found."
      );
    }

    if (
      allocation.status !==
      "reserved"
    ) {
      throw new BadRequestError(
        "Court allocation is already released or cancelled."
      );
    }

    return this.repository.release(
      id
    );
  }
}