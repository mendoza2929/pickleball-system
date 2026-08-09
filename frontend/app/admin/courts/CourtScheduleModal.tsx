"use client";

import {
  Check,
  Clock3,
  X,
  Loader2,
} from "lucide-react";

import {
  CourtSchedule,
  UpdateCourtSchedulePayload,
  updateCourtSchedule,
} from "@/lib/api/courtSchedules";

import { useEffect, useState } from "react";

interface Props {
  courtId: number;
  courtName: string;
  schedules: CourtSchedule[];
  onClose: () => void;
  onSaved: () => void;
}

const DAYS: CourtSchedule["day_of_week"][] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function normalizeTime(
  value: string | null
) {
  if (!value) {
    return "";
  }

  // MySQL returns HH:mm:ss
  // HTML time input needs HH:mm
  return value.slice(0, 5);
}

export default function CourtScheduleModal({
  courtId,
  courtName,
  schedules,
  onClose,
  onSaved,
}: Props) {
  const [localSchedules, setLocalSchedules] =
    useState<CourtSchedule[]>([]);

  const [savingDay, setSavingDay] =
    useState<string | null>(null);

  useEffect(() => {
    const mapped = DAYS.map((day) => {
      const existing =
        schedules.find(
          (schedule) =>
            schedule.day_of_week === day
        );

      if (existing) {
        return {
          ...existing,

          open_time: normalizeTime(
            existing.open_time
          ),

          close_time: normalizeTime(
            existing.close_time
          ),

          is_closed:
            Boolean(existing.is_closed),
        };
      }

      // Fallback if a day doesn't exist
      return {
        id: 0,
        uuid: "",
        court_id: courtId,
        court_name: courtName,
        day_of_week: day,
        open_time: "09:00",
        close_time: "22:00",
        is_closed: false,
      };
    });

    setLocalSchedules(mapped);
  }, [
    schedules,
    courtId,
    courtName,
  ]);

  // =====================================================
  // UPDATE LOCAL STATE
  // =====================================================

  const updateLocalSchedule = (
    day: CourtSchedule["day_of_week"],
    changes: Partial<CourtSchedule>
  ) => {
    setLocalSchedules(
      (current) =>
        current.map((schedule) =>
          schedule.day_of_week === day
            ? {
                ...schedule,
                ...changes,
              }
            : schedule
        )
    );
  };

  // =====================================================
  // SAVE DAY
  // =====================================================

  const handleSave = async (
    schedule: CourtSchedule
  ) => {
    try {
      setSavingDay(
        schedule.day_of_week
      );

      // ===============================================
      // IMPORTANT
      // ===============================================

      const payload: UpdateCourtSchedulePayload =
        {
          day_of_week:
            schedule.day_of_week,

          /*
           * If closed:
           *
           * open_time = null
           * close_time = null
           *
           * Otherwise use the selected times.
           */
          open_time:
            schedule.is_closed
              ? null
              : schedule.open_time,

          close_time:
            schedule.is_closed
              ? null
              : schedule.close_time,

          /*
           * MUST be boolean.
           *
           * true  = closed
           * false = open
           */
          is_closed:
            Boolean(schedule.is_closed),
        };

      console.log(
        "Saving court schedule:",
        payload
      );

      // Existing schedule
      if (schedule.id) {
        await updateCourtSchedule(
          schedule.id,
          payload
        );
      }

      onSaved();
    } catch (error) {
      console.error(
        "Failed to save court schedule:",
        error
      );

      alert(
        "Failed to save court schedule."
      );
    } finally {
      setSavingDay(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* ================================================= */}
      {/* BACKDROP */}
      {/* ================================================= */}

      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ================================================= */}
      {/* PANEL */}
      {/* ================================================= */}

      <div
        className="
          relative
          ml-auto
          flex
          h-full
          w-full
          max-w-xl
          flex-col
          bg-white
          shadow-2xl
        "
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-slate-200
            px-6
            py-5
          "
        >
          <div>
            <div
              className="
                mb-2
                flex
                items-center
                gap-2
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              <Clock3 size={15} />

              Court Schedule
            </div>

            <h2
              className="
                text-xl
                font-bold
                text-slate-900
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
              Set the operating hours for this
              court.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              p-2
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* ================================================= */}
        {/* DAYS */}
        {/* ================================================= */}

        <div
          className="
            flex-1
            space-y-3
            overflow-y-auto
            bg-slate-50
            px-5
            py-4
          "
        >
          {localSchedules.map(
            (schedule) => {
              const saving =
                savingDay ===
                schedule.day_of_week;

              return (
                <div
                  key={
                    schedule.day_of_week
                  }
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    p-4
                  "
                >
                  {/* ===================================== */}
                  {/* DAY HEADER */}
                  {/* ===================================== */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <h3
                      className="
                        font-semibold
                        text-slate-800
                      "
                    >
                      {
                        schedule.day_of_week
                      }
                    </h3>

                    <label
                      className="
                        flex
                        cursor-pointer
                        items-center
                        gap-2
                        text-sm
                        text-slate-500
                      "
                    >
                      <input
                        type="checkbox"
                        checked={
                          schedule.is_closed
                        }
                        onChange={(e) => {
                          updateLocalSchedule(
                            schedule.day_of_week,
                            {
                              is_closed:
                                e.target
                                  .checked,
                            }
                          );
                        }}
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

                  {/* ===================================== */}
                  {/* CLOSED */}
                  {/* ===================================== */}

                  {schedule.is_closed ? (
                    <div
                      className="
                        mt-4
                        rounded-lg
                        border
                        border-red-100
                        bg-red-50
                        px-4
                        py-3
                        text-sm
                        text-red-600
                      "
                    >
                      This court is closed
                      on{" "}
                      {
                        schedule.day_of_week
                      }.
                    </div>
                  ) : (
                    /* =================================== */
                    /* OPEN */
                    /* =================================== */

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

                        <input
                          type="time"
                          value={
                            normalizeTime(
                              schedule.open_time
                            )
                          }
                          onChange={(e) => {
                            updateLocalSchedule(
                              schedule.day_of_week,
                              {
                                open_time:
                                  e.target
                                    .value,
                              }
                            );
                          }}
                          className="
                            h-10
                            w-full
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            text-sm
                            text-slate-700
                            outline-none
                            focus:border-slate-400
                          "
                        />
                      </div>

                      <div
                        className="
                          pb-3
                          text-slate-300
                        "
                      >
                        —
                      </div>

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

                        <input
                          type="time"
                          value={
                            normalizeTime(
                              schedule.close_time
                            )
                          }
                          onChange={(e) => {
                            updateLocalSchedule(
                              schedule.day_of_week,
                              {
                                close_time:
                                  e.target
                                    .value,
                              }
                            );
                          }}
                          className="
                            h-10
                            w-full
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            text-sm
                            text-slate-700
                            outline-none
                            focus:border-slate-400
                          "
                        />
                      </div>
                    </div>
                  )}

                  {/* ===================================== */}
                  {/* SAVE */}
                  {/* ===================================== */}

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={
                        saving ||
                        !schedule.id
                      }
                      onClick={() =>
                        handleSave(
                          schedule
                        )
                      }
                      className="
                        inline-flex
                        h-10
                        items-center
                        gap-2
                        rounded-lg
                        bg-slate-950
                        px-5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-slate-800
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {saving ? (
                        <>
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />

                          Saving...
                        </>
                      ) : (
                        <>
                          <Check
                            size={15}
                          />

                          Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div
          className="
            border-t
            border-slate-200
            bg-white
            p-4
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              h-11
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              text-sm
              font-medium
              text-slate-700
              transition
              hover:bg-slate-50
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}