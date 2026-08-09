"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  CalendarClock,
  Check,
  Clock,
  X,
} from "lucide-react";

import {
  CourtSchedule,
  updateCourtSchedule,
} from "@/lib/api/courtSchedules";

interface Props {
  courtId: number;
  courtName: string;
  schedules: CourtSchedule[];
  onClose: () => void;
  onSaved: () => void;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export default function CourtScheduleModal({
  courtName,
  schedules,
  onClose,
  onSaved,
}: Props) {
  const [localSchedules, setLocalSchedules] =
    useState<CourtSchedule[]>([]);

  const [savingId, setSavingId] =
    useState<number | null>(null);

  // ============================================================
  // LOAD SCHEDULES
  // ============================================================

  useEffect(() => {
    const normalizedSchedules =
      schedules.map((schedule) => ({
        ...schedule,

        // MySQL TIME:
        // "09:00:00" -> "09:00"
        open_time:
          schedule.open_time
            ?.slice(0, 5) ?? null,

        close_time:
          schedule.close_time
            ?.slice(0, 5) ?? null,

        // MySQL TINYINT:
        // 0 -> false
        // 1 -> true
        is_closed:
          Boolean(schedule.is_closed),
      }));

    setLocalSchedules(
      normalizedSchedules
    );
  }, [schedules]);

  // ============================================================
  // GET SCHEDULE BY DAY
  // ============================================================

  function getSchedule(day: string) {
    return localSchedules.find(
      (schedule) =>
        schedule.day_of_week === day
    );
  }

  // ============================================================
  // UPDATE LOCAL STATE
  // ============================================================

  function updateLocal(
    id: number,
    field: keyof CourtSchedule,
    value: string | boolean | null
  ) {
    setLocalSchedules((current) =>
      current.map((schedule) =>
        schedule.id === id
          ? {
              ...schedule,
              [field]: value,
            }
          : schedule
      )
    );
  }

  // ============================================================
  // SAVE SCHEDULE
  // ============================================================

  async function saveSchedule(
    schedule: CourtSchedule
  ) {
    try {
      setSavingId(schedule.id);

      // --------------------------------------------------------
      // Normalize values before sending to backend
      // --------------------------------------------------------

      const openTime =
        schedule.open_time
          ? schedule.open_time.slice(0, 5)
          : null;

      const closeTime =
        schedule.close_time
          ? schedule.close_time.slice(0, 5)
          : null;

      const isClosed =
        Boolean(schedule.is_closed);

      // --------------------------------------------------------
      // Validate time when the court is open
      // --------------------------------------------------------

      if (!isClosed) {
        if (!openTime || !closeTime) {
          console.error(
            "Opening and closing time are required."
          );

          return;
        }

        if (openTime >= closeTime) {
          console.error(
            "Closing time must be later than opening time."
          );

          return;
        }
      }

      // --------------------------------------------------------
      // UPDATE API
      // --------------------------------------------------------

      await updateCourtSchedule(
        schedule.id,
        {
          day_of_week:
            schedule.day_of_week,

          open_time:
            isClosed
              ? null
              : openTime,

          close_time:
            isClosed
              ? null
              : closeTime,

          is_closed:
            isClosed,
        }
      );

      // Refresh parent data
      onSaved();
    } catch (error) {
      console.error(
        "Failed to update schedule:",
        error
      );
    } finally {
      setSavingId(null);
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="fixed inset-0 z-50">

      {/* BACKDROP */}

      <div
        className="
          absolute
          inset-0
          bg-slate-950/40
          backdrop-blur-sm
        "
        onClick={onClose}
      />

      {/* PANEL */}

      <aside
        className="
          absolute
          right-0
          top-0
          flex
          h-full
          w-full
          max-w-2xl
          flex-col
          bg-white
          shadow-2xl
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-slate-200
            px-7
            py-6
          "
        >

          <div>

            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                font-medium
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              <CalendarClock className="h-4 w-4" />

              Court Schedule
            </div>

            <h2
              className="
                mt-2
                text-xl
                font-bold
                text-slate-950
              "
            >
              {courtName}
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Set the operating hours for this court.
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-400
              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* CONTENT */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-7
            py-6
          "
        >

          <div className="space-y-3">

            {DAYS.map((day) => {

              const schedule =
                getSchedule(day);

              // ------------------------------------------------
              // NO SCHEDULE
              // ------------------------------------------------

              if (!schedule) {
                return (
                  <div
                    key={day}
                    className="
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      p-4
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-medium
                        text-slate-500
                      "
                    >
                      No schedule configured for{" "}
                      {day}.
                    </p>
                  </div>
                );
              }

              // ------------------------------------------------
              // SCHEDULE
              // ------------------------------------------------

              return (
                <div
                  key={schedule.id}
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >

                    {/* DAY */}

                    <div className="w-28 shrink-0">

                      <p
                        className="
                          text-sm
                          font-semibold
                          text-slate-900
                        "
                      >
                        {day}
                      </p>

                    </div>

                    {/* CLOSED */}

                    <label
                      className="
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-slate-500
                      "
                    >

                      <input
                        type="checkbox"
                        checked={
                          Boolean(
                            schedule.is_closed
                          )
                        }
                        onChange={(event) =>
                          updateLocal(
                            schedule.id,
                            "is_closed",
                            event.target.checked
                          )
                        }
                        className="
                          h-4
                          w-4
                          rounded
                          border-slate-300
                        "
                      />

                      Closed

                    </label>

                  </div>

                  {/* HOURS */}

                  {!Boolean(
                    schedule.is_closed
                  ) && (

                    <div
                      className="
                        mt-4
                        flex
                        items-end
                        gap-3
                      "
                    >

                      {/* OPEN */}

                      <div className="flex-1">

                        <label
                          className="
                            mb-1.5
                            block
                            text-xs
                            font-medium
                            text-slate-500
                          "
                        >
                          Opens
                        </label>

                        <div className="relative">

                          <Clock
                            className="
                              pointer-events-none
                              absolute
                              left-3
                              top-1/2
                              h-4
                              w-4
                              -translate-y-1/2
                              text-slate-400
                            "
                          />

                          <input
                            type="time"
                            value={
                              schedule.open_time
                                ?.slice(0, 5) ?? ""
                            }
                            onChange={(event) =>
                              updateLocal(
                                schedule.id,
                                "open_time",
                                event.target.value
                              )
                            }
                            className="
                              h-10
                              w-full
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              pl-9
                              pr-3
                              text-sm
                              text-slate-900
                              outline-none
                              focus:border-slate-400
                            "
                          />

                        </div>

                      </div>

                      <span className="pb-2 text-slate-300">
                        —
                      </span>

                      {/* CLOSE */}

                      <div className="flex-1">

                        <label
                          className="
                            mb-1.5
                            block
                            text-xs
                            font-medium
                            text-slate-500
                          "
                        >
                          Closes
                        </label>

                        <div className="relative">

                          <Clock
                            className="
                              pointer-events-none
                              absolute
                              left-3
                              top-1/2
                              h-4
                              w-4
                              -translate-y-1/2
                              text-slate-400
                            "
                          />

                          <input
                            type="time"
                            value={
                              schedule.close_time
                                ?.slice(0, 5) ?? ""
                            }
                            onChange={(event) =>
                              updateLocal(
                                schedule.id,
                                "close_time",
                                event.target.value
                              )
                            }
                            className="
                              h-10
                              w-full
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              pl-9
                              pr-3
                              text-sm
                              text-slate-900
                              outline-none
                              focus:border-slate-400
                            "
                          />

                        </div>

                      </div>

                      {/* SAVE */}

                      <button
                        type="button"
                        disabled={
                          savingId ===
                          schedule.id
                        }
                        onClick={() =>
                          saveSchedule(
                            schedule
                          )
                        }
                        className="
                          flex
                          h-10
                          items-center
                          gap-2
                          rounded-lg
                          bg-slate-950
                          px-4
                          text-sm
                          font-medium
                          text-white
                          hover:bg-slate-800
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >

                        <Check className="h-4 w-4" />

                        {savingId ===
                        schedule.id
                          ? "Saving..."
                          : "Save"}

                      </button>

                    </div>

                  )}

                </div>
              );
            })}

          </div>

        </div>

        {/* FOOTER */}

        <div
          className="
            border-t
            border-slate-200
            bg-white
            px-7
            py-4
          "
        >

          <button
            type="button"
            onClick={onClose}
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              py-2.5
              text-sm
              font-medium
              text-slate-700
              hover:bg-slate-50
            "
          >
            Close
          </button>

        </div>

      </aside>
    </div>
  );
}