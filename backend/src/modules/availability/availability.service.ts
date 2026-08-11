import {
  AvailabilityRepository,
} from "./availability.repository";

import {
  NotFoundError,
} from "../../shared/errors/NotFoundError";

import {
  BadRequestError,
} from "../../shared/errors/BadRequestError";

import {
  getDayOfWeek,
} from "../../shared/utils/date";

import {
  timeToMinutes,
} from "../../shared/utils/time";

export class AvailabilityService {
  private repository =
    new AvailabilityRepository();

  /**
   * Get Available Time Slots
   */
  async getAvailability(
    courtId: number,
    reservationDate: string
  ) {
    // --------------------------------------------
    // Court
    // --------------------------------------------

    const court =
      await this.repository.getCourt(
        courtId
      );

    if (!court) {
      throw new NotFoundError(
        "Court not found."
      );
    }

    // --------------------------------------------
    // Day of Week
    // --------------------------------------------

    const day =
      getDayOfWeek(
        reservationDate
      );

    // --------------------------------------------
    // Court Status
    // --------------------------------------------

    if (
      court.status !== "Available"
    ) {
      return {
        court,
        date: reservationDate,
        day,
        open_time: null,
        close_time: null,
        slots: [],
        schedule_source:
          "court_status",
        reason:
          court.status === "Maintenance"
            ? "Court is under maintenance."
            : "Court is inactive.",
      };
    }

    // --------------------------------------------
    // Specific Date Override
    // --------------------------------------------

    const override =
      await this.repository.getScheduleOverride(
        courtId,
        reservationDate
      );

    // --------------------------------------------
    // Determine Schedule
    // --------------------------------------------

    let schedule: {
      open_time: string | null;
      close_time: string | null;
      is_closed: boolean;
      reason: string | null;
    };

    if (override) {
      schedule = {
        open_time:
          override.open_time,

        close_time:
          override.close_time,

        is_closed:
          Boolean(
            override.is_closed
          ),

        reason:
          override.reason ?? null,
      };
    } else {
      const weeklySchedule =
        await this.repository.getSchedule(
          courtId,
          day
        );

      if (!weeklySchedule) {
        throw new BadRequestError(
          "Court has no operating schedule."
        );
      }

      schedule = {
        open_time:
          weeklySchedule.open_time,

        close_time:
          weeklySchedule.close_time,

        is_closed:
          Boolean(
            weeklySchedule.is_closed
          ),

        reason: null,
      };
    }

    // --------------------------------------------
    // Court Closed
    // --------------------------------------------

    if (
      schedule.is_closed
    ) {
      return {
        court,
        date: reservationDate,
        day,
        open_time: null,
        close_time: null,
        slots: [],
        schedule_source:
          override
            ? "override"
            : "weekly",
        reason:
          schedule.reason,
      };
    }

    // --------------------------------------------
    // Validate Schedule Times
    // --------------------------------------------

    if (
      !schedule.open_time ||
      !schedule.close_time
    ) {
      throw new BadRequestError(
        "Court schedule has invalid operating hours."
      );
    }

    // --------------------------------------------
    // Existing Reservations
    // --------------------------------------------

    const reservations =
      await this.repository.getReservations(
        courtId,
        reservationDate
      );

    // --------------------------------------------
    // Open Play Matches
    // --------------------------------------------

    const competitionMatches =
      await this.repository.getCompetitionMatches(
        courtId,
        reservationDate
      );

    // --------------------------------------------
    // Generate Slots
    // --------------------------------------------

    const slots: {
      start: string;
      end: string;
      available: boolean;
      source:
        | "available"
        | "reservation"
        | "open_play";
    }[] = [];

    let current =
      timeToMinutes(
        schedule.open_time
      );

    const closing =
      timeToMinutes(
        schedule.close_time
      );

    // --------------------------------------------
    // Generate 60-Minute Slots
    // --------------------------------------------

    while (
      current + 60 <= closing
    ) {
      const end =
        current + 60;

      const startTime =
        this.minutesToTime(
          current
        );

      const endTime =
        this.minutesToTime(
          end
        );

      // ------------------------------------------
      // Reservation conflict
      // ------------------------------------------

      const reserved =
        reservations.some(
          (reservation: any) => {
            return (
              reservation.start_time <
                endTime &&
              reservation.end_time >
                startTime
            );
          }
        );

      // ------------------------------------------
      // Open Play conflict
      // ------------------------------------------

      const openPlay =
        competitionMatches.some(
          (match: any) => {
            const assignedAt =
              match.court_assigned_at ??
              match.started_at;

            if (!assignedAt) {
              return false;
            }

            const matchTime =
              this.extractTime(
                assignedAt
              );

            if (!matchTime) {
              return false;
            }

            const matchStart =
              timeToMinutes(
                matchTime
              );

            const matchEnd =
              matchStart + 60;

            return (
              matchStart <
                end &&
              matchEnd >
                current
            );
          }
        );

      let source:
        | "available"
        | "reservation"
        | "open_play";

      if (openPlay) {
        source = "open_play";
      } else if (reserved) {
        source = "reservation";
      } else {
        source = "available";
      }

      slots.push({
        start: startTime,
        end: endTime,
        available:
          !reserved &&
          !openPlay,
        source,
      });

      current += 60;
    }

    // --------------------------------------------
    // Return
    // --------------------------------------------

    return {
      court,
      date: reservationDate,
      day,

      open_time:
        schedule.open_time,

      close_time:
        schedule.close_time,

      slots,

      schedule_source:
        override
          ? "override"
          : "weekly",

      reason:
        schedule.reason,
    };
  }

  /**
   * Convert minutes to HH:mm
   */
  private minutesToTime(
    minutes: number
  ) {
    const hours =
      Math.floor(
        minutes / 60
      );

    const mins =
      minutes % 60;

    return `${String(hours).padStart(
      2,
      "0"
    )}:${String(mins).padStart(
      2,
      "0"
    )}`;
  }

  /**
   * Extract HH:mm from DATETIME
   */
  private extractTime(
    value: string | Date
  ): string | null {
    if (!value) {
      return null;
    }

    if (
      value instanceof Date
    ) {
      return `${String(
        value.getHours()
      ).padStart(
        2,
        "0"
      )}:${String(
        value.getMinutes()
      ).padStart(
        2,
        "0"
      )}`;
    }

    // MySQL DATETIME:
    //
    // 2026-08-15 14:00:00

    const match =
      value.match(
        /(\d{2}):(\d{2})/
      );

    if (!match) {
      return null;
    }

    return `${match[1]}:${match[2]}`;
  }

  async findAvailableCourt(
      reservationDate: string,
      startTime: string
    ) {
      const courts =
        await this.repository.getAvailableCourts();

      for (
        const court of courts
      ) {
        const availability =
          await this.getAvailability(
            Number(court.id),
            reservationDate
          );

        const slot =
          availability.slots.find(
            (item: any) =>
              item.start === startTime
          );

        if (
          slot?.available === true
        ) {
          return court;
        }
      }

      return null;
    }
}