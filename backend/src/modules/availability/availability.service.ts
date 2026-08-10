import { AvailabilityRepository } from "./availability.repository";

import { NotFoundError } from "../../shared/errors/NotFoundError";
import { BadRequestError } from "../../shared/errors/BadRequestError";

import { getDayOfWeek } from "../../shared/utils/date";
import { timeToMinutes } from "../../shared/utils/time";

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
    //------------------------------------
    // Court
    //------------------------------------

    const court =
      await this.repository.getCourt(
        courtId
      );

    if (!court) {
      throw new NotFoundError(
        "Court not found."
      );
    }

    //------------------------------------
    // Day of Week
    //------------------------------------

    const day =
      getDayOfWeek(
        reservationDate
      );

    //------------------------------------
    // Court Status
    //------------------------------------

    if (court.status !== "Available") {
      return {
        court,
        date: reservationDate,
        day,
        open_time: null,
        close_time: null,
        slots: [],
        schedule_source: "court_status",
        reason:
          court.status === "Maintenance"
            ? "Court is under maintenance."
            : "Court is inactive.",
      };
    }

    //------------------------------------
    // Specific Date Override
    //------------------------------------

    const override =
      await this.repository.getScheduleOverride(
        courtId,
        reservationDate
      );

    //------------------------------------
    // Determine Schedule
    //------------------------------------

    let schedule;

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
          override.reason,
      };
    } else {
      schedule =
        await this.repository.getSchedule(
          courtId,
          day
        );

      if (!schedule) {
        throw new BadRequestError(
          "Court has no operating schedule."
        );
      }

      schedule = {
        open_time:
          schedule.open_time,

        close_time:
          schedule.close_time,

        is_closed:
          Boolean(
            schedule.is_closed
          ),

        reason: null,
      };
    }

    //------------------------------------
    // Court Closed
    //------------------------------------

    if (schedule.is_closed) {
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
          override?.reason ?? null,
      };
    }

    //------------------------------------
    // Validate Schedule Times
    //------------------------------------

    if (
      !schedule.open_time ||
      !schedule.close_time
    ) {
      throw new BadRequestError(
        "Court schedule has invalid operating hours."
      );
    }

    //------------------------------------
    // Reservations
    //------------------------------------

    const reservations =
      await this.repository.getReservations(
        courtId,
        reservationDate
      );

    //------------------------------------
    // Generate Slots
    //------------------------------------

    const slots: {
      start: string;
      end: string;
      available: boolean;
    }[] = [];

    let current =
      timeToMinutes(
        schedule.open_time
      );

    const closing =
      timeToMinutes(
        schedule.close_time
      );

    //------------------------------------
    // Generate 60-Minute Slots
    //------------------------------------

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

      slots.push({
        start: startTime,
        end: endTime,
        available:
          !reserved,
      });

      current += 60;
    }

    //------------------------------------
    // Return
    //------------------------------------

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
        override?.reason ?? null,
    };
  }

  /**
   * Minutes → HH:mm
   */
  private minutesToTime(
    minutes: number
  ) {
    const hours =
      Math.floor(minutes / 60);

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
}