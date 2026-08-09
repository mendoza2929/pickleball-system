import { CourtScheduleRepository } from "./courtSchedule.repository";

export class CourtScheduleService {
  private repository = new CourtScheduleRepository();

  // =====================================================
  // GET ALL SCHEDULES FOR A COURT
  // =====================================================

  async getCourtSchedules(courtId: number) {
    if (!courtId || Number.isNaN(courtId)) {
      throw new Error("INVALID_COURT_ID");
    }

    const schedules =
      await this.repository.findByCourt(courtId);

    return schedules;
  }

  // =====================================================
  // GET SCHEDULE BY ID
  // =====================================================

  async getById(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new Error("INVALID_SCHEDULE_ID");
    }

    const schedule =
      await this.repository.findById(id);

    if (!schedule) {
      throw new Error(
        "COURT_SCHEDULE_NOT_FOUND"
      );
    }

    return schedule;
  }

  // =====================================================
  // GET SCHEDULE BY COURT AND DAY
  // =====================================================

  async getByCourtAndDay(
    courtId: number,
    dayOfWeek: string
  ) {
    if (!courtId || Number.isNaN(courtId)) {
      throw new Error("INVALID_COURT_ID");
    }

    const schedule =
      await this.repository.findByCourtAndDay(
        courtId,
        dayOfWeek
      );

    if (!schedule) {
      throw new Error(
        "COURT_SCHEDULE_NOT_FOUND"
      );
    }

    return schedule;
  }

  // =====================================================
  // UPDATE SCHEDULE
  // =====================================================

  async update(
    id: number,
    data: {
      day_of_week:
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
        | "Saturday"
        | "Sunday";

      open_time: string | null;

      close_time: string | null;

      is_closed: boolean;
    }
  ) {
    if (!id || Number.isNaN(id)) {
      throw new Error(
        "INVALID_SCHEDULE_ID"
      );
    }

    // ===================================================
    // VALIDATE CLOSED / OPEN STATE
    // ===================================================

    if (data.is_closed === true) {
      /**
       * When closed, the frontend is allowed
       * to send null times.
       *
       * The repository will keep the existing
       * database times because the columns are
       * NOT NULL.
       */
    } else {
      /**
       * When open, both times are required.
       */
      if (
        !data.open_time ||
        !data.close_time
      ) {
        throw new Error(
          "OPEN_TIME_AND_CLOSE_TIME_REQUIRED"
        );
      }

      // ================================================
      // VALIDATE TIME FORMAT
      // ================================================

      const timeRegex =
        /^([01]\d|2[0-3]):([0-5]\d)$/;

      if (
        !timeRegex.test(data.open_time)
      ) {
        throw new Error(
          "INVALID_OPEN_TIME"
        );
      }

      if (
        !timeRegex.test(data.close_time)
      ) {
        throw new Error(
          "INVALID_CLOSE_TIME"
        );
      }

      // ================================================
      // OPEN MUST BE BEFORE CLOSE
      // ================================================

      if (
        data.open_time >=
        data.close_time
      ) {
        throw new Error(
          "INVALID_COURT_SCHEDULE_TIME"
        );
      }
    }

    // ===================================================
    // UPDATE
    // ===================================================

    return this.repository.update(
      id,
      data
    );
  }
}