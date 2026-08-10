"use client";

import {
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  CourtSchedule,
  UpdateCourtSchedulePayload,
  updateCourtSchedule,
} from "@/lib/api/courtSchedules";

import {
  CourtScheduleOverride,
  createCourtScheduleOverride,
  deleteCourtScheduleOverride,
  getCourtScheduleOverrides,
} from "@/lib/api/courtScheduleOverrides";

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

function normalizeTime(value: string | null) {
  if (!value) {
    return "";
  }

  // MySQL returns HH:mm:ss
  // HTML time input needs HH:mm
  return value.slice(0, 5);
}

function normalizeDate(value: string) {
  if (!value) {
    return "";
  }

  // Handles:
  // 2026-08-25
  // 2026-08-25T00:00:00.000Z
  return value.slice(0, 10);
}

function formatDate(value: string) {
  const normalized = normalizeDate(value);

  if (!normalized) {
    return "";
  }

  const [year, month, day] =
    normalized.split("-").map(Number);

  if (!year || !month || !day) {
    return normalized;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(
    new Date(year, month - 1, day)
  );
}

export default function CourtScheduleModal({
  courtId,
  courtName,
  schedules,
  onClose,
  onSaved,
}: Props) {
  // =====================================================
  // WEEKLY SCHEDULE STATE
  // =====================================================

  const [localSchedules, setLocalSchedules] =
    useState<CourtSchedule[]>([]);

  const [savingDay, setSavingDay] =
    useState<string | null>(null);

  // =====================================================
  // SPECIFIC DATE OVERRIDES
  // =====================================================

  const [overrides, setOverrides] =
    useState<CourtScheduleOverride[]>([]);

  const [loadingOverrides, setLoadingOverrides] =
    useState(false);

  const [savingOverride, setSavingOverride] =
    useState(false);

  const [deletingOverrideId, setDeletingOverrideId] =
    useState<number | null>(null);

  // =====================================================
  // ADD SPECIFIC DATE FORM
  // =====================================================

  const [showOverrideForm, setShowOverrideForm] =
    useState(false);

  const [overrideDate, setOverrideDate] =
    useState("");

  const [overrideClosed, setOverrideClosed] =
    useState(true);

  const [overrideOpenTime, setOverrideOpenTime] =
    useState("09:00");

  const [overrideCloseTime, setOverrideCloseTime] =
    useState("22:00");

  const [overrideReason, setOverrideReason] =
    useState("");

  // =====================================================
  // LOAD WEEKLY SCHEDULES
  // =====================================================

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
  // LOAD SPECIFIC DATE OVERRIDES
  // =====================================================

  const loadOverrides = async () => {
    try {
      setLoadingOverrides(true);

      const data =
        await getCourtScheduleOverrides(
          courtId
        );

      setOverrides(data);
    } catch (error) {
      console.error(
        "Failed to load court schedule overrides:",
        error
      );

      alert(
        "Failed to load specific date schedules."
      );
    } finally {
      setLoadingOverrides(false);
    }
  };

  useEffect(() => {
    loadOverrides();
  }, [courtId]);

  // =====================================================
  // UPDATE WEEKLY LOCAL STATE
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
  // SAVE WEEKLY SCHEDULE
  // =====================================================

const handleSave = async (
    schedule: CourtSchedule
  ) => {
    try {
      setSavingDay(schedule.day_of_week);

      const payload: UpdateCourtSchedulePayload = {
        day_of_week: schedule.day_of_week,

        open_time: schedule.is_closed
          ? null
          : schedule.open_time,

        close_time: schedule.is_closed
          ? null
          : schedule.close_time,

        is_closed: Boolean(
          schedule.is_closed
        ),
      };

      console.log(
        "Saving court schedule:",
        payload
      );

      if (schedule.id) {
        await updateCourtSchedule(
          schedule.id,
          payload
        );
      }

      toast.success(
        "Court schedule updated successfully."
      );

      onSaved();
    } catch (error) {
      console.error(
        "Failed to save court schedule:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save court schedule."
      );
    } finally {
      setSavingDay(null);
    }
  };

  // =====================================================
  // RESET OVERRIDE FORM
  // =====================================================

  const resetOverrideForm = () => {
    setOverrideDate("");
    setOverrideClosed(true);
    setOverrideOpenTime("09:00");
    setOverrideCloseTime("22:00");
    setOverrideReason("");
  };

  // =====================================================
  // OPEN OVERRIDE FORM
  // =====================================================

  const openOverrideForm = () => {
    resetOverrideForm();
    setShowOverrideForm(true);
  };

  // =====================================================
  // CLOSE OVERRIDE FORM
  // =====================================================

  const closeOverrideForm = () => {
    if (savingOverride) {
      return;
    }

    setShowOverrideForm(false);
    resetOverrideForm();
  };

  // =====================================================
  // CREATE SPECIFIC DATE OVERRIDE
  // =====================================================

  const handleCreateOverride = async () => {
    // -----------------------------------------------
    // DATE
    // -----------------------------------------------

    if (!overrideDate) {
      toast.error("Please select a date.");
      return;
    }

    // -----------------------------------------------
    // REASON
    // -----------------------------------------------

    if (!overrideReason.trim()) {
       toast.error("Please enter a reason.");
      return;
    }

    // -----------------------------------------------
    // CUSTOM HOURS VALIDATION
    // -----------------------------------------------

    if (!overrideClosed) {
      if (
        !overrideOpenTime ||
        !overrideCloseTime
      ) {
         toast.error(
            "Open time and close time are required."
          );
          return;
      }

      if (
        overrideOpenTime >=
        overrideCloseTime
      ) {
          toast.error(
            "Close time must be later than open time."
          );
          return;
      }
    }

    try {
      setSavingOverride(true);

      const payload = {
        court_id: courtId,

        schedule_date: overrideDate,

        open_time: overrideClosed
          ? null
          : overrideOpenTime,

        close_time: overrideClosed
          ? null
          : overrideCloseTime,

        is_closed: overrideClosed,

        reason:
          overrideReason.trim() ||
          null,
      };

      console.log(
        "Creating court schedule override:",
        payload
      );

      await createCourtScheduleOverride(
        payload
      );

      // Reload list
      await loadOverrides();

      // Reset form
      closeOverrideForm();

      // Refresh parent if necessary
      onSaved();
    } catch (error) {
      console.error(
        "Failed to create court schedule override:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create specific date schedule."
      );
    } finally {
      setSavingOverride(false);
    }
  };

  // =====================================================
  // DELETE SPECIFIC DATE OVERRIDE
  // =====================================================

  const handleDeleteOverride = async (
    override: CourtScheduleOverride
  ) => {
    const confirmed =
      window.confirm(
        `Remove the schedule override for ${formatDate(
          override.schedule_date
        )}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingOverrideId(
        override.id
      );

      await deleteCourtScheduleOverride(
        override.id
      );

      await loadOverrides();

      onSaved();
    } catch (error) {
      console.error(
        "Failed to delete court schedule override:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete schedule override."
      );
    } finally {
      setDeletingOverrideId(null);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* ================================================= */}
      {/* BACKDROP */}
      {/* ================================================= */}

      <div
        className="
          absolute
          inset-0
          bg-slate-950/50
          backdrop-blur-sm
        "
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
              Set weekly hours and specific
              date schedules for this court.
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
        {/* CONTENT */}
        {/* ================================================= */}

        <div
          className="
            flex-1
            space-y-6
            overflow-y-auto
            bg-slate-50
            px-5
            py-4
          "
        >
          {/* ================================================= */}
          {/* WEEKLY SCHEDULE */}
          {/* ================================================= */}

          <section>
            <div className="mb-3">
              <h3
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                "
              >
                Weekly Schedule
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                These hours apply every week
                unless a specific date override
                is configured.
              </p>
            </div>

            <div className="space-y-3">
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
                              value={normalizeTime(
                                schedule.open_time
                              )}
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
                              value={normalizeTime(
                                schedule.close_time
                              )}
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
          </section>

          {/* ================================================= */}
          {/* SPECIFIC DATE OVERRIDES */}
          {/* ================================================= */}

          <section>
            <div
              className="
                mb-3
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <CalendarDays
                    size={17}
                    className="text-slate-500"
                  />

                  <h3
                    className="
                      text-sm
                      font-semibold
                      text-slate-900
                    "
                  >
                    Specific Dates
                  </h3>
                </div>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Temporarily close the court or
                  change its hours for a specific
                  date.
                </p>
              </div>

              <button
                type="button"
                onClick={openOverrideForm}
                className="
                  inline-flex
                  h-9
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-lg
                  bg-slate-950
                  px-3
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:bg-slate-800
                "
              >
                <Plus size={14} />

                Add Date
              </button>
            </div>

            {/* ================================================= */}
            {/* ADD OVERRIDE FORM */}
            {/* ================================================= */}

            {showOverrideForm && (
              <div
                className="
                  mb-4
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  p-4
                  shadow-sm
                "
              >
                <div
                  className="
                    mb-4
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div>
                    <h4
                      className="
                        text-sm
                        font-semibold
                        text-slate-900
                      "
                    >
                      Add Specific Date
                    </h4>

                    <p
                      className="
                        mt-0.5
                        text-xs
                        text-slate-500
                      "
                    >
                      This overrides the weekly
                      schedule for one date.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={savingOverride}
                    onClick={
                      closeOverrideForm
                    }
                    className="
                      rounded-md
                      p-1.5
                      text-slate-400
                      hover:bg-slate-100
                      hover:text-slate-700
                    "
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* DATE */}

                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-medium
                      text-slate-500
                    "
                  >
                    Date
                  </label>

                  <input
                    type="date"
                    value={overrideDate}
                    onChange={(e) =>
                      setOverrideDate(
                        e.target.value
                      )
                    }
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

                {/* SCHEDULE TYPE */}

                <div className="mt-4">
                  <label
                    className="
                      mb-2
                      block
                      text-xs
                      font-medium
                      text-slate-500
                    "
                  >
                    Schedule
                  </label>

                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-2
                    "
                  >
                    {/* CLOSED */}

                    <button
                      type="button"
                      onClick={() =>
                        setOverrideClosed(
                          true
                        )
                      }
                      className={`
                        rounded-lg
                        border
                        px-3
                        py-2.5
                        text-left
                        transition
                        ${
                          overrideClosed
                            ? "border-slate-900 bg-slate-50 text-slate-900"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        }
                      `}
                    >
                      <div
                        className="
                          text-sm
                          font-medium
                        "
                      >
                        Closed
                      </div>

                      <div
                        className="
                          mt-0.5
                          text-xs
                          text-slate-400
                        "
                      >
                        Holiday / Maintenance
                      </div>
                    </button>

                    {/* CUSTOM HOURS */}

                    <button
                      type="button"
                      onClick={() =>
                        setOverrideClosed(
                          false
                        )
                      }
                      className={`
                        rounded-lg
                        border
                        px-3
                        py-2.5
                        text-left
                        transition
                        ${
                          !overrideClosed
                            ? "border-slate-900 bg-slate-50 text-slate-900"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        }
                      `}
                    >
                      <div
                        className="
                          text-sm
                          font-medium
                        "
                      >
                        Custom Hours
                      </div>

                      <div
                        className="
                          mt-0.5
                          text-xs
                          text-slate-400
                        "
                      >
                        Different operating hours
                      </div>
                    </button>
                  </div>
                </div>

                {/* CUSTOM HOURS */}

                {!overrideClosed && (
                  <div
                    className="
                      mt-4
                      flex
                      items-end
                      gap-3
                    "
                  >
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
                          overrideOpenTime
                        }
                        onChange={(e) =>
                          setOverrideOpenTime(
                            e.target.value
                          )
                        }
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
                          overrideCloseTime
                        }
                        onChange={(e) =>
                          setOverrideCloseTime(
                            e.target.value
                          )
                        }
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

                {/* REASON */}

                <div className="mt-4">
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-medium
                      text-slate-500
                    "
                  >
                    Reason
                  </label>

                  <input
                    type="text"
                    value={overrideReason}
                    onChange={(e) =>
                      setOverrideReason(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Holiday, Maintenance, Tournament"
                    maxLength={255}
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
                      placeholder:text-slate-300
                      focus:border-slate-400
                    "
                  />
                </div>

                {/* FORM ACTIONS */}

                <div
                  className="
                    mt-4
                    flex
                    justify-end
                    gap-2
                  "
                >
                  <button
                    type="button"
                    disabled={savingOverride}
                    onClick={
                      closeOverrideForm
                    }
                    className="
                      h-10
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      px-4
                      text-sm
                      font-medium
                      text-slate-600
                      transition
                      hover:bg-slate-50
                      disabled:opacity-50
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={savingOverride}
                    onClick={
                      handleCreateOverride
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
                    {savingOverride ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />

                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={15} />

                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* EXISTING OVERRIDES */}
            {/* ================================================= */}

            {loadingOverrides ? (
              <div
                className="
                  flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-8
                  text-sm
                  text-slate-500
                "
              >
                <Loader2
                  size={16}
                  className="
                    mr-2
                    animate-spin
                  "
                />

                Loading specific dates...
              </div>
            ) : overrides.length === 0 ? (
              <div
                className="
                  rounded-xl
                  border
                  border-dashed
                  border-slate-300
                  bg-white
                  px-4
                  py-8
                  text-center
                "
              >
                <CalendarDays
                  size={22}
                  className="
                    mx-auto
                    mb-2
                    text-slate-300
                  "
                />

                <p
                  className="
                    text-sm
                    font-medium
                    text-slate-600
                  "
                >
                  No specific dates
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  The weekly schedule is currently
                  used for every date.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {overrides.map(
                  (override) => {
                    const deleting =
                      deletingOverrideId ===
                      override.id;

                    const closed =
                      Boolean(
                        override.is_closed
                      );

                    return (
                      <div
                        key={override.id}
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          p-4
                        "
                      >
                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >
                            <CalendarDays
                              size={15}
                              className="
                                shrink-0
                                text-slate-400
                              "
                            />

                            <p
                              className="
                                text-sm
                                font-semibold
                                text-slate-800
                              "
                            >
                              {formatDate(
                                override.schedule_date
                              )}
                            </p>
                          </div>

                          <div className="mt-2">
                            {closed ? (
                              <span
                                className="
                                  inline-flex
                                  items-center
                                  rounded-md
                                  bg-red-50
                                  px-2
                                  py-1
                                  text-xs
                                  font-medium
                                  text-red-600
                                "
                              >
                                Closed
                              </span>
                            ) : (
                              <span
                                className="
                                  inline-flex
                                  items-center
                                  rounded-md
                                  bg-slate-100
                                  px-2
                                  py-1
                                  text-xs
                                  font-medium
                                  text-slate-700
                                "
                              >
                                {normalizeTime(
                                  override.open_time
                                )}{" "}
                                —{" "}
                                {normalizeTime(
                                  override.close_time
                                )}
                              </span>
                            )}

                            {override.reason && (
                              <p
                                className="
                                  mt-2
                                  truncate
                                  text-xs
                                  text-slate-500
                                "
                              >
                                {
                                  override.reason
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={deleting}
                          onClick={() =>
                            handleDeleteOverride(
                              override
                            )
                          }
                          title="Delete override"
                          className="
                            inline-flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            text-slate-400
                            transition
                            hover:bg-red-50
                            hover:text-red-600
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          {deleting ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2
                              size={16}
                            />
                          )}
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>
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