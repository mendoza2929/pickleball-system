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

  // ==================================================
  // GET AVAILABLE COURTS
  // ==================================================

  async getAvailableCourts() {
    return this.repository.getAvailableCourts();
  }

  // ==================================================
  // GET AVAILABILITY
  // ==================================================

  async getAvailability(
    courtId: number,
    reservationDate: string
  ) {
    console.log(
      "=========================================="
    );

    console.log(
      "[AvailabilityService]"
    );

    console.log(
      "REQUEST:",
      {
        courtId,
        reservationDate,
      }
    );

    console.log(
      "=========================================="
    );

    // ==================================================
    // COURT
    // ==================================================

    const court =
      await this.repository.getCourt(
        courtId
      );

    if (!court) {
      throw new NotFoundError(
        "Court not found."
      );
    }

    // ==================================================
    // DAY
    // ==================================================

    const day =
      getDayOfWeek(
        reservationDate
      );

    // ==================================================
    // COURT STATUS
    // ==================================================

    if (
      court.status !== "Available"
    ) {
      return {
        court_id: court.id,
        court_name: court.name,
        reservation_date:
          reservationDate,
        day_of_week: day,

        open_time: null,
        close_time: null,

        duration_hours: 1,

        is_closed: true,

        slots: [],
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

    // ==================================================
    // OVERRIDE
    // ==================================================

    const override =
      await this.repository
        .getScheduleOverride(
          courtId,
          reservationDate
        );

    // ==================================================
    // SCHEDULE
    // ==================================================

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

    // ==================================================
    // CLOSED
    // ==================================================

    if (
      schedule.is_closed
    ) {
      return {
        court_id: court.id,
        court_name: court.name,
        reservation_date:
          reservationDate,
        day_of_week: day,

        open_time: null,
        close_time: null,

        duration_hours: 1,

        is_closed: true,

        slots: [],
        available_slots: [],

        schedule_source:
          override
            ? "override"
            : "weekly",

        reason:
          schedule.reason,
      };
    }

    // ==================================================
    // VALIDATE HOURS
    // ==================================================

    if (
      !schedule.open_time ||
      !schedule.close_time
    ) {
      throw new BadRequestError(
        "Court schedule has invalid operating hours."
      );
    }

    // ==================================================
    // RESERVATIONS
    // ==================================================

    const reservations =
      await this.repository
        .getReservations(
          courtId,
          reservationDate
        );

    // ==================================================
    // OPEN PLAY COURT ALLOCATIONS
    //
    // THIS MUST RETURN:
    //
    // competition 11
    // court 8
    // 2026-08-31
    // 15:00 - 17:00
    // ==================================================

    const competitionAllocations =
      await this.repository
        .getCompetitionCourtAllocations(
          courtId,
          reservationDate
        );

    console.log(
      "[AvailabilityService] allocations:",
      competitionAllocations
    );

    // ==================================================
    // ACTIVE MATCHES
    // ==================================================

    const competitionMatches =
      await this.repository
        .getCompetitionMatches(
          courtId,
          reservationDate
        );

    // ==================================================
    // GENERATE SLOTS
    // ==================================================

    const slots: {
      start: string;
      end: string;

      start_time: string;
      end_time: string;

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

    // ==================================================
    // ONE HOUR SLOTS
    // ==================================================

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

      // ==================================================
      // NORMAL RESERVATION
      // ==================================================

      const reserved =
        reservations.some(
          (reservation: any) => {
            const reservationStart =
              timeToMinutes(
                String(
                  reservation.start_time
                )
              );

            const reservationEnd =
              timeToMinutes(
                String(
                  reservation.end_time
                )
              );

            return (
              reservationStart <
                end &&
              reservationEnd >
                current
            );
          }
        );

      // ==================================================
      // OPEN PLAY ALLOCATION
      // ==================================================

      const allocationBlocked =
        competitionAllocations.some(
          (allocation: any) => {
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

            const overlaps =
              allocationStart <
                end &&
              allocationEnd >
                current;

            if (overlaps) {
              console.log(
                "[Availability] BLOCKED SLOT",
                {
                  courtId,
                  reservationDate,

                  slot:
                    `${startTime}-${endTime}`,

                  allocation:
                    `${allocation.start_time}-${allocation.end_time}`,

                  competitionId:
                    allocation.competition_id,

                  allocationId:
                    allocation.id,
                }
              );
            }

            return overlaps;
          }
        );

      // ==================================================
      // ACTIVE MATCH
      // ==================================================

      const matchBlocked =
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

      // ==================================================
      // FINAL BLOCK STATUS
      // ==================================================

      const openPlayBlocked =
        allocationBlocked ||
        matchBlocked;

      // ==================================================
      // SOURCE
      // ==================================================

      let source:
        | "available"
        | "reservation"
        | "open_play";

      if (
        openPlayBlocked
      ) {
        source =
          "open_play";
      } else if (
        reserved
      ) {
        source =
          "reservation";
      } else {
        source =
          "available";
      }

      // ==================================================
      // ADD SLOT
      // ==================================================

      slots.push({
        start:
          startTime,

        end:
          endTime,

        start_time:
          startTime,

        end_time:
          endTime,

        available:
          !reserved &&
          !openPlayBlocked,

        source,
      });

      current += 60;
    }

    // ==================================================
    // AVAILABLE ONLY
    // ==================================================

    const available_slots =
      slots
        .filter(
          (slot) =>
            slot.available
        )
        .map(
          (slot) => ({
            start_time:
              slot.start_time,

            end_time:
              slot.end_time,
          })
        );

    // ==================================================
    // TEMPORARY DEBUG
    //
    // Keep this for now.
    // It will prove what backend found.
    // ==================================================

    console.log(
      "=========================================="
    );

    console.log(
      "[AvailabilityService] FINAL"
    );

    console.log(
      "Court:",
      courtId
    );

    console.log(
      "Date:",
      reservationDate
    );

    console.log(
      "Allocations:",
      competitionAllocations
    );

    console.log(
      "Available slots:",
      available_slots
    );

    console.log(
      "=========================================="
    );

    // ==================================================
    // RETURN
    // ==================================================

    return {
      court_id:
        court.id,

      court_name:
        court.name,

      reservation_date:
        reservationDate,

      day_of_week:
        day,

      open_time:
        schedule.open_time,

      close_time:
        schedule.close_time,

      duration_hours: 1,

      is_closed: false,

      reason:
        schedule.reason,

      schedule_source:
        override
          ? "override"
          : "weekly",

      slots,

      available_slots,
    };
  }

  // ==================================================
  // MINUTES -> HH:mm
  // ==================================================

  private minutesToTime(
    minutes: number
  ) {
    const hours =
      Math.floor(
        minutes / 60
      );

    const mins =
      minutes % 60;

    return `${String(
      hours
    ).padStart(
      2,
      "0"
    )}:${String(
      mins
    ).padStart(
      2,
      "0"
    )}`;
  }

  // ==================================================
  // DATETIME -> HH:mm
  // ==================================================

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

    const match =
      String(value).match(
        /(\d{2}):(\d{2})/
      );

    if (!match) {
      return null;
    }

    return `${match[1]}:${match[2]}`;
  }
}