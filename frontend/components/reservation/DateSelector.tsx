"use client";

import { useMemo } from "react";
import type { CourtScheduleOverride } from "@/lib/api/courtScheduleOverrides";

interface CourtSchedule {
  day_of_week: string;
  is_closed: boolean;
}

interface Props {
  courtId: number | null;
  schedules: CourtSchedule[];
  overrides: CourtScheduleOverride[];
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

export default function DateSelector({
  courtId,
  schedules,
  overrides,
  selectedDate,
  onSelect,
}: Props) {
  const today = new Date();

  const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthName = today.toLocaleString("default", {
    month: "long",
  });

  const firstDay = new Date(
    currentYear,
    currentMonth,
    1
  ).getDay();

  const totalDays = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();

  const days = useMemo(() => {
    return Array.from(
      { length: totalDays },
      (_, index) => index + 1
    );
  }, [totalDays]);

  // ============================================================
  // FORMAT DATE AS YYYY-MM-DD
  // ============================================================

  const formatDate = (date: Date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ============================================================
  // CHECK SPECIFIC DATE OVERRIDE
  // ============================================================

  const getDateOverride = (date: Date) => {
    const dateString = formatDate(date);

    return overrides.find((override) => {
      // API may return:
      // 2026-08-21
      // OR
      // 2026-08-21T16:00:00.000Z
      const overrideDate =
        override.schedule_date.slice(0, 10);

      return overrideDate === dateString;
    });
  };

  // ============================================================
  // CHECK IF DATE IS CLOSED
  // ============================================================

  const isOverrideClosed = (date: Date) => {
    const override = getDateOverride(date);

    return Boolean(
      override?.is_closed
    );
  };

  // ============================================================
  // TODAY WITHOUT TIME
  // ============================================================

  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>
        <h2 className="text-3xl font-bold">
          Select Reservation Date
        </h2>

        <p className="mt-2 text-slate-400">
          Choose an available date.
        </p>
      </div>

      {/* ======================================================
          CALENDAR
      ====================================================== */}

      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-slate-950
          p-8
        "
      >

        <h3 className="mb-8 text-center text-2xl font-bold">
          {monthName} {currentYear}
        </h3>

        {/* ==================================================
            DAYS HEADER
            ================================================== */}

        <div
          className="
            mb-5
            grid
            grid-cols-7
            gap-3
            text-center
            text-sm
            text-slate-500
          "
        >
          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((day) => (
            <div key={day}>
              {day}
            </div>
          ))}
        </div>

        {/* ==================================================
            CALENDAR DAYS
            ================================================== */}

        <div className="grid grid-cols-7 gap-3">

          {/* Empty cells before first day */}
          {Array.from({
            length: firstDay,
          }).map((_, index) => (
            <div key={index} />
          ))}

          {days.map((day) => {

            const date = new Date(
              currentYear,
              currentMonth,
              day
            );

            const dayName =
              DAYS[date.getDay()];

            // =================================================
            // NORMAL WEEKLY SCHEDULE
            // =================================================

            const hasSchedule =
              schedules.some(
                (schedule) =>
                  schedule.day_of_week ===
                    dayName &&
                  !schedule.is_closed
              );

            // =================================================
            // PAST DATE
            // =================================================

            const isPast =
              date < todayOnly;

            // =================================================
            // SPECIFIC DATE OVERRIDE
            // =================================================

            const override =
              getDateOverride(date);

            // =================================================
            // SPECIFIC DATE IS CLOSED
            // =================================================

            const isClosedByOverride =
              Boolean(
                override?.is_closed
              );

            // =================================================
            // DATE IS DISABLED
            // =================================================

            const isDisabled =
              isPast ||
              !courtId ||
              !hasSchedule ||
              isClosedByOverride;

            // =================================================
            // SELECTED
            // =================================================

            const selected =
              selectedDate?.toDateString() ===
              date.toDateString();

            return (
              <button
                key={day}
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    onSelect(date);
                  }
                }}
                title={
                  isClosedByOverride
                    ? override?.reason ||
                      "Court is closed on this date."
                    : !hasSchedule
                    ? "Court is closed on this day."
                    : undefined
                }
                className={`
                  aspect-square
                  rounded-xl
                  font-semibold
                  transition

                  ${
                    selected
                      ? "bg-lime-400 text-slate-950"
                      : isDisabled
                      ? "cursor-not-allowed bg-slate-900 text-slate-700"
                      : "bg-slate-900 hover:bg-lime-400/20"
                  }
                `}
              >
                {day}
              </button>
            );
          })}

        </div>

      </div>

      {/* ======================================================
          SELECTED DATE
      ====================================================== */}

      {selectedDate && (
        <div
          className="
            rounded-2xl
            border
            border-lime-400/20
            bg-lime-400/10
            p-5
          "
        >
          <p className="text-sm text-lime-300">
            Selected Date
          </p>

          <h3 className="mt-2 text-xl font-bold">
            {selectedDate.toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }
            )}
          </h3>
        </div>
      )}

    </div>
  );
}