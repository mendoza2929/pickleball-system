import { BadRequestError } from "../../../shared/errors/BadRequestError";
import { NotFoundError } from "../../../shared/errors/NotFoundError";

import { CourtRepository } from "../../courts/court.repository";
import { CourtScheduleRepository } from "../../court-schedules/courtSchedule.repository";

import pool from "../../../config/database";

// =====================================================
// TYPES
// =====================================================

export interface AvailableSlot {
  start_time: string;
  end_time: string;
}

// =====================================================
// RESERVATION AVAILABILITY SERVICE
// =====================================================

export class ReservationAvailabilityService {
  private courtRepository =
    new CourtRepository();

  private courtScheduleRepository =
    new CourtScheduleRepository();

  // =====================================================
  // GET AVAILABILITY
  // =====================================================

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

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
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

    if (
      court.status !== "Available"
    ) {
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

    const [
      overrideRows,
    ]: any =
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
    // DATE OVERRIDE
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
    // WEEKLY SCHEDULE
    // =====================================================

    else {
      const schedule =
        await this.courtScheduleRepository
          .findByCourtAndDay(
            courtId,
            dayOfWeek
          );

      if (!schedule) {
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

        court_name:
          court.name,

        reservation_date:
          reservationDate,

        day_of_week:
          dayOfWeek,

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
    // VALIDATE OPERATING HOURS
    // =====================================================

    if (
      !openTime ||
      !closeTime
    ) {
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
        `${String(
          hours
        ).padStart(2, "0")}:` +
        `${String(
          minutes
        ).padStart(2, "0")}`
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
    // INVALID SCHEDULE
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
    //
    // Pending + Confirmed block the court.
    //
    // Cancelled + Completed do NOT block.
    //
    // DATE() makes this work whether
    // reservation_date is DATE or DATETIME.
    //
    // LOWER(TRIM()) makes status comparison
    // case/space insensitive.
    // =====================================================

    const [
      reservationRows,
    ]: any =
      await pool.query(
        `
          SELECT
            id,
            court_id,
            reservation_date,
            start_time,
            end_time,
            reservation_status
          FROM reservations
          WHERE court_id = ?
            AND DATE(reservation_date) = ?
            AND LOWER(
              TRIM(reservation_status)
            ) IN (
              'pending',
              'confirmed'
            )
          ORDER BY start_time ASC
        `,
        [
          courtId,
          reservationDate,
        ]
      );

    console.log(
      "[ReservationAvailability] Existing reservations:",
      {
        courtId,
        reservationDate,
        reservations:
          reservationRows,
      }
    );

    // =====================================================
    // GET COURT ALLOCATIONS
    //
    // IMPORTANT:
    //
    // Any allocation that is NOT released
    // blocks the court.
    //
    // Example:
    //
    // 15:00 - 17:00
    //
    // blocks:
    //
    // 15:00 - 16:00
    // 16:00 - 17:00
    //
    // Released allocations are ignored.
    // =====================================================

    const [
      competitionAllocations,
    ]: any =
      await pool.query(
        `
          SELECT
            id,
            competition_id,
            competition_division_id,
            court_id,
            allocation_date,
            start_time,
            end_time,
            allocation_type,
            status
          FROM competition_court_allocations
          WHERE court_id = ?
            AND DATE(allocation_date) = ?
            AND LOWER(
              TRIM(status)
            ) <> 'released'
          ORDER BY start_time ASC
        `,
        [
          courtId,
          reservationDate,
        ]
      );

    console.log(
      "[ReservationAvailability] Court allocations:",
      {
        courtId,
        reservationDate,
        competitionAllocations,
      }
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
      // DO NOT SHOW PAST TIMES TODAY
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
      //
      // Example:
      //
      // Existing:
      // 09:00 - 10:00
      //
      // Requested:
      // 09:00 - 10:00
      //
      // Conflict = TRUE
      //
      // Therefore slot is removed.
      // ===================================================

      const hasReservationConflict =
        reservationRows.some(
          (
            reservation: any
          ) => {
            const existingStart =
              timeToMinutes(
                String(
                  reservation.start_time
                )
              );

            const existingEnd =
              timeToMinutes(
                String(
                  reservation.end_time
                )
              );

            const conflict =
              startMinutes <
                existingEnd &&
              endMinutes >
                existingStart;

            if (conflict) {
              console.log(
                "[ReservationAvailability] BLOCKED BY RESERVATION",
                {
                  courtId,
                  reservationDate,

                  requestedSlot:
                    `${minutesToTime(
                      startMinutes
                    )} - ${minutesToTime(
                      endMinutes
                    )}`,

                  reservation:
                    `${reservation.start_time} - ${reservation.end_time}`,

                  reservationId:
                    reservation.id,

                  reservationStatus:
                    reservation.reservation_status,
                }
              );
            }

            return conflict;
          }
        );

      // ===================================================
      // CHECK COURT ALLOCATION CONFLICT
      //
      // Example:
      //
      // Allocation:
      // 15:00 - 17:00
      //
      // Requested:
      // 15:00 - 16:00
      //
      // Conflict = TRUE
      //
      // Requested:
      // 16:00 - 17:00
      //
      // Conflict = TRUE
      // ===================================================

      const hasCompetitionAllocationConflict =
        competitionAllocations.some(
          (
            allocation: any
          ) => {
            const allocationStart =
              timeToMinutes(
                String(
                  allocation.start_time
                )
              );

            const allocationEnd =
              timeToMinutes(
                String(
                  allocation.end_time
                )
              );

            const conflict =
              startMinutes <
                allocationEnd &&
              endMinutes >
                allocationStart;

            if (conflict) {
              console.log(
                "[ReservationAvailability] BLOCKED BY COURT ALLOCATION",
                {
                  courtId,
                  reservationDate,

                  requestedSlot:
                    `${minutesToTime(
                      startMinutes
                    )} - ${minutesToTime(
                      endMinutes
                    )}`,

                  allocation:
                    `${allocation.start_time} - ${allocation.end_time}`,

                  allocationId:
                    allocation.id,

                  competitionId:
                    allocation.competition_id,

                  allocationStatus:
                    allocation.status,

                  allocationType:
                    allocation.allocation_type,
                }
              );
            }

            return conflict;
          }
        );

      // ===================================================
      // SKIP RESERVED SLOT
      // ===================================================

      if (
        hasReservationConflict
      ) {
        continue;
      }

      // ===================================================
      // SKIP COURT ALLOCATION
      // ===================================================

      if (
        hasCompetitionAllocationConflict
      ) {
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

    console.log(
      "[ReservationAvailability] Final available slots:",
      {
        courtId,
        reservationDate,
        durationHours,
        availableSlots,
      }
    );

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