import { AvailabilityRepository } from "./availability.repository";

import { NotFoundError } from "../../shared/errors/NotFoundError";
import { BadRequestError } from "../../shared/errors/BadRequestError";

import { getDayOfWeek } from "../../shared/utils/date";
import { timeToMinutes } from "../../shared/utils/time";

export class AvailabilityService {
  private repository = new AvailabilityRepository();

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
      await this.repository.getCourt(courtId);

    if (!court) {
      throw new NotFoundError(
        "Court not found."
      );
    }

    //------------------------------------
    // Day of Week
    //------------------------------------

    const day = getDayOfWeek(
      reservationDate
    );

    //------------------------------------
    // Weekly Schedule
    //------------------------------------

    const schedule =
      await this.repository.getSchedule(
        courtId,
        day
      );

    if (!schedule) {
      throw new BadRequestError(
        "Court has no operating schedule."
      );
    }

    if (schedule.is_closed) {
      return {
        court,
        date: reservationDate,
        day,
        open_time: null,
        close_time: null,
        slots: [],
      };
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
      timeToMinutes(schedule.open_time);

    const closing =
      timeToMinutes(schedule.close_time);

    while (current < closing) {
      const end = current + 60;

      const startTime =
        this.minutesToTime(current);

      const endTime =
        this.minutesToTime(end);

      const reserved =
        reservations.some((reservation: any) => {
          return (
            reservation.start_time < endTime &&
            reservation.end_time > startTime
          );
        });

      slots.push({
        start: startTime,
        end: endTime,
        available: !reserved,
      });

      current += 60;
    }

    return {
      court,
      date: reservationDate,
      day,
      open_time: schedule.open_time,
      close_time: schedule.close_time,
      slots,
    };
  }

  /**
   * Minutes → HH:mm
   */
  private minutesToTime(
    minutes: number
  ) {
    const hours = Math.floor(minutes / 60);

    const mins = minutes % 60;

    return `${String(hours).padStart(
      2,
      "0"
    )}:${String(mins).padStart(2, "0")}`;
  }
}