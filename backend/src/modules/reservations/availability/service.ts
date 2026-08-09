import { BadRequestError } from "../../../shared/errors/BadRequestError";
import { NotFoundError } from "../../../shared/errors/NotFoundError";

import { CourtRepository } from "../../courts/court.repository";
import { CourtScheduleRepository } from "../../court-schedules/courtSchedule.repository";

import pool from "../../../config/database";

export interface AvailableSlot {
  start_time: string;
  end_time: string;
}

export class ReservationAvailabilityService {
  private courtRepository =
    new CourtRepository();

  private courtScheduleRepository =
    new CourtScheduleRepository();

  async getAvailability(
    courtId: number,
    reservationDate: string,
    durationHours: number
  ) {
    // =====================================================
    // VALIDATE DURATION
    // =====================================================

    if (
      durationHours < 1 ||
      durationHours > 2
    ) {
      throw new BadRequestError(
        "Reservation duration must be between 1 and 2 hours."
      );
    }

    // =====================================================
    // VALIDATE DATE
    // =====================================================

    if (
      !reservationDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(
        reservationDate
      )
    ) {
      throw new BadRequestError(
        "Invalid reservation date."
      );
    }

    // =====================================================
    // FIND COURT
    // =====================================================

    const court =
      await this.courtRepository.findById(
        courtId
      );

    if (!court) {
      throw new NotFoundError(
        "Court not found."
      );
    }

    // =====================================================
    // GET DAY OF WEEK
    // =====================================================

    const date = new Date(
      `${reservationDate}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestError(
        "Invalid reservation date."
      );
    }

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const dayOfWeek =
      days[date.getDay()];

    // =====================================================
    // GET COURT SCHEDULE
    // =====================================================

    const schedule =
      await this.courtScheduleRepository
        .findByCourtAndDay(
          courtId,
          dayOfWeek
        );

    // =====================================================
    // NO SCHEDULE
    // =====================================================

    if (!schedule) {
      return {
        court_id: courtId,
        court_name: court.name,
        reservation_date: reservationDate,
        day_of_week: dayOfWeek,
        duration_hours: durationHours,
        is_closed: true,
        open_time: null,
        close_time: null,
        available_slots: [],
      };
    }

    // =====================================================
    // COURT CLOSED
    // =====================================================

    if (schedule.is_closed) {
      return {
        court_id: courtId,
        court_name: court.name,
        reservation_date: reservationDate,
        day_of_week: dayOfWeek,
        duration_hours: durationHours,
        is_closed: true,
        open_time: schedule.open_time,
        close_time: schedule.close_time,
        available_slots: [],
      };
    }

    // =====================================================
    // TIME HELPERS
    // =====================================================

    const timeToMinutes = (
      value: string
    ): number => {
      const [hours, minutes] =
        value
          .slice(0, 5)
          .split(":")
          .map(Number);

      return (
        hours * 60 +
        minutes
      );
    };

    const minutesToTime = (
      totalMinutes: number
    ): string => {
      const hours =
        Math.floor(
          totalMinutes / 60
        );

      const minutes =
        totalMinutes % 60;

      return (
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}`
      );
    };

    // =====================================================
    // OPERATING HOURS
    // =====================================================

    const openMinutes =
      timeToMinutes(
        schedule.open_time
      );

    const closeMinutes =
      timeToMinutes(
        schedule.close_time
      );

    const durationMinutes =
      durationHours * 60;

    // Invalid schedule protection
    if (
      openMinutes >= closeMinutes
    ) {
      throw new BadRequestError(
        "Invalid court operating hours."
      );
    }

    // =====================================================
    // GET EXISTING RESERVATIONS
    // =====================================================

    const [rows]: any =
      await pool.query(
        `
        SELECT
          start_time,
          end_time
        FROM reservations
        WHERE court_id = ?
          AND reservation_date = ?
          AND reservation_status != 'Cancelled'
        ORDER BY start_time ASC
        `,
        [
          courtId,
          reservationDate,
        ]
      );

    // =====================================================
    // CURRENT TIME
    // =====================================================

    const now =
      new Date();

    const today =
      `${now.getFullYear()}-` +
      `${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-` +
      `${String(
        now.getDate()
      ).padStart(2, "0")}`;

    const currentMinutes =
      now.getHours() * 60 +
      now.getMinutes();

    // =====================================================
    // GENERATE AVAILABLE SLOTS
    // =====================================================

    const availableSlots: AvailableSlot[] =
      [];

    /*
     * Example:
     *
     * Open:
     * 09:00
     *
     * Close:
     * 22:00
     *
     * Duration:
     * 1 hour
     *
     * Generated slots:
     *
     * 09:00 - 10:00
     * 10:00 - 11:00
     * 11:00 - 12:00
     * 12:00 - 13:00
     * 13:00 - 14:00
     * 14:00 - 15:00
     * 15:00 - 16:00
     * 16:00 - 17:00
     * 17:00 - 18:00
     * 18:00 - 19:00
     * 19:00 - 20:00
     * 20:00 - 21:00
     * 21:00 - 22:00
     */

    for (
      let startMinutes = openMinutes;
      startMinutes + durationMinutes <=
        closeMinutes;
      startMinutes += 60
    ) {
      const endMinutes =
        startMinutes +
        durationMinutes;

      // =================================================
      // DO NOT SHOW PAST TIMES FOR TODAY
      // =================================================

      if (
        reservationDate === today &&
        startMinutes <= currentMinutes
      ) {
        continue;
      }

      // =================================================
      // CHECK RESERVATION CONFLICT
      // =================================================

      const hasConflict =
        rows.some(
          (reservation: any) => {
            const existingStart =
              timeToMinutes(
                reservation.start_time
              );

            const existingEnd =
              timeToMinutes(
                reservation.end_time
              );

            /*
             * Overlap:
             *
             * new start < existing end
             * &&
             * new end > existing start
             */

            return (
              startMinutes <
                existingEnd &&
              endMinutes >
                existingStart
            );
          }
        );

      if (hasConflict) {
        continue;
      }

      // =================================================
      // ADD AVAILABLE SLOT
      // =================================================

      availableSlots.push({
        start_time:
          minutesToTime(
            startMinutes
          ),

        end_time:
          minutesToTime(
            endMinutes
          ),
      });
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    return {
      court_id: courtId,

      court_name:
        court.name,

      reservation_date:
        reservationDate,

      day_of_week:
        dayOfWeek,

      duration_hours:
        durationHours,

      is_closed: false,

      open_time:
        schedule.open_time,

      close_time:
        schedule.close_time,

      available_slots:
        availableSlots,
    };
  }
}