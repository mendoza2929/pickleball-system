"use client";

import { useMemo } from "react";


interface CourtSchedule {
  day_of_week: string;
  is_closed: boolean;
}

interface Props {
  courtId: number | null;
  schedules: CourtSchedule[];
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}
export default function DateSelector({
  courtId,
  schedules,
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

  return (
    <div className="space-y-8">

      <div>

        <h2 className="text-3xl font-bold">

          Select Reservation Date

        </h2>

        <p className="mt-2 text-slate-400">

          Choose an available date.

        </p>

      </div>

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

        <div className="mb-5 grid grid-cols-7 gap-3 text-center text-sm text-slate-500">

          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => (
            <div key={day}>{day}</div>
          ))}

        </div>

        <div className="grid grid-cols-7 gap-3">

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
            const dayName = DAYS[date.getDay()];
            const hasSchedule = schedules.some(
              (schedule) =>
                schedule.day_of_week === dayName &&
                !schedule.is_closed
            );
            
            const isPast =
              date <
              new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
              );

            const selected =
              selectedDate?.toDateString() ===
              date.toDateString();

            return (
              <button
                key={day}
                 disabled={
                  isPast ||
                  !courtId ||
                  !hasSchedule
                }
                onClick={() => onSelect(date)}
                className={`
                  aspect-square
                  rounded-xl
                  font-semibold
                  transition

                 ${
                    selected
                      ? "bg-lime-400 text-slate-950"
                      : isPast || !hasSchedule
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