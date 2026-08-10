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
    // COURT STATUS
    // =====================================================
    //
    // Maintenance / Inactive courts cannot be reserved.
    //

    if (court.status !== "Available") {
      return {
        court_id: courtId,
        court_name: court.name,
        reservation_date:
          reservationDate,
        day_of_week: dayOfWeek,
        duration_hours:
          durationHours,
        is_closed: true,
        open_time: null,
        close_time: null,
        available_slots: [],
        schedule_source:
          "court_status",
        reason:
          court.status ===
          "Maintenance"
            ? "Court is under maintenance."
            : "Court is inactive.",
      };
    }

    // =====================================================
    // GET DATE OVERRIDE
    // =====================================================
    //
    // Priority:
    //
    // 1. Court-specific override
    // 2. Global holiday
    //
    // Example:
    //
    // court_id = 7
    // date = 2026-08-20
    //
    // takes priority over:
    //
    // court_id = NULL
    // date = 2026-08-20
    //

    const [overrideRows]: any =
      await pool.query(
        `
        SELECT
          cso.id,
          cso.court_id,
          cso.schedule_date,
          cso.open_time,
          cso.close_time,
          cso.is_closed,
          cso.reason
        FROM court_schedule_overrides cso
        WHERE DATE(cso.schedule_date) = ?
          AND (
            cso.court_id = ?
            OR cso.court_id IS NULL
          )
        ORDER BY
          CASE
            WHEN cso.court_id = ? THEN 1
            WHEN cso.court_id IS NULL THEN 2
            ELSE 3
          END
        LIMIT 1
        `,
        [
          reservationDate,
          courtId,
          courtId,
        ]
      );

    const override =
      overrideRows[0] ?? null;

    // =====================================================
    // DETERMINE SCHEDULE
    // =====================================================

    let openTime: string | null;
    let closeTime: string | null;
    let isClosed: boolean;

    let scheduleSource:
      | "override"
      | "weekly";

    let reason: string | null;

    // =====================================================
    // DATE OVERRIDE EXISTS
    // =====================================================

    if (override) {
      openTime =
        override.open_time;

      closeTime =
        override.close_time;

      isClosed =
        Boolean(
          override.is_closed
        );

      scheduleSource =
        "override";

      reason =
        override.reason ?? null;
    }

    // =====================================================
    // NO OVERRIDE
    // USE WEEKLY SCHEDULE
    // =====================================================

    else {
      const schedule =
        await this.courtScheduleRepository
          .findByCourtAndDay(
            courtId,
            dayOfWeek
          );

      // ===================================================
      // NO WEEKLY SCHEDULE
      // ===================================================

      if (!schedule) {
        return {
          court_id: courtId,
          court_name: court.name,
          reservation_date:
            reservationDate,
          day_of_week: dayOfWeek,
          duration_hours:
            durationHours,
          is_closed: true,
          open_time: null,
          close_time: null,
          available_slots: [],
          schedule_source:
            "weekly",
          reason:
            "Court has no operating schedule.",
        };
      }

      openTime =
        schedule.open_time;

      closeTime =
        schedule.close_time;

      isClosed =
        Boolean(
          schedule.is_closed
        );

      scheduleSource =
        "weekly";

      reason = null;
    }

    // =====================================================
    // CLOSED
    // =====================================================

    if (isClosed) {
      return {
        court_id: courtId,
        court_name: court.name,
        reservation_date:
          reservationDate,
        day_of_week: dayOfWeek,
        duration_hours:
          durationHours,
        is_closed: true,
        open_time: null,
        close_time: null,
        available_slots: [],
        schedule_source:
          scheduleSource,
        reason,
      };
    }

    // =====================================================
    // VALIDATE OPENING HOURS
    // =====================================================

    if (!openTime || !closeTime) {
      throw new BadRequestError(
        "Court schedule has invalid operating hours."
      );
    }

    // =====================================================
    // TIME HELPERS
    // =====================================================

    const timeToMinutes = (
      value: string
    ): number => {
      const [
        hours,
        minutes,
      ] = value
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
        `${String(hours).padStart(
          2,
          "0"
        )}:` +
        `${String(minutes).padStart(
          2,
          "0"
        )}`
      );
    };

    // =====================================================
    // OPERATING HOURS
    // =====================================================

    const openMinutes =
      timeToMinutes(
        openTime
      );

    const closeMinutes =
      timeToMinutes(
        closeTime
      );

    const durationMinutes =
      durationHours * 60;

    // =====================================================
    // INVALID SCHEDULE PROTECTION
    // =====================================================

    if (
      openMinutes >=
      closeMinutes
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

    const availableSlots:
      AvailableSlot[] = [];

    for (
      let startMinutes =
        openMinutes;

      startMinutes +
        durationMinutes <=
        closeMinutes;

      startMinutes += 60
    ) {
      const endMinutes =
        startMinutes +
        durationMinutes;

      // ===================================================
      // DO NOT SHOW PAST TIMES FOR TODAY
      // ===================================================

      if (
        reservationDate ===
          today &&
        startMinutes <=
          currentMinutes
      ) {
        continue;
      }

      // ===================================================
      // CHECK RESERVATION CONFLICT
      // ===================================================

      const hasConflict =
        rows.some(
          (
            reservation: any
          ) => {
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

      // ===================================================
      // ADD AVAILABLE SLOT
      // ===================================================

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
        openTime,

      close_time:
        closeTime,

      available_slots:
        availableSlots,

      schedule_source:
        scheduleSource,

      reason,
    };
  }
}