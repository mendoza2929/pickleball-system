"use client";

import {
  CheckCircle2,
  Clock,
  Loader2,
  ArrowRight,
} from "lucide-react";

import { formatTime } from "@/utils/time";

import { useAvailability } from "@/hooks/useAvailability";

function formatLocalDate(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

interface AvailabilitySlot {
  start_time: string;
  end_time: string;
}

interface Props {
  courtId: number;

  date: Date;

  /**
   * Currently selected start time.
   */
  selectedTime: string | null;

  /**
   * Currently selected end time.
   */
  selectedEndTime?: string | null;

  /**
   * Returns the complete reservation range.
   */
  onSelect: (
    start: string,
    end: string
  ) => void;
}

function timeToMinutes(
  time: string
): number {
  const [hours, minutes] =
    time.split(":").map(Number);

  return (
    hours * 60 +
    minutes
  );
}

function calculateHours(
  start: string,
  end: string
): number {
  const startMinutes =
    timeToMinutes(start);

  const endMinutes =
    timeToMinutes(end);

  return (
    endMinutes -
    startMinutes
  ) / 60;
}

export default function TimeSelector({
  courtId,
  date,
  selectedTime,
  selectedEndTime,
  onSelect,
}: Props) {
  const formattedDate =
    formatLocalDate(date);

  const {
    data,
    isLoading,
    isError,
  } = useAvailability(
    courtId,
    formattedDate
  );

  /**
   * --------------------------------------------------
   * LOADING
   * --------------------------------------------------
   */

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-lime-400" />

          <p className="text-sm text-slate-400">
            Checking available times...
          </p>
        </div>
      </div>
    );
  }

  /**
   * --------------------------------------------------
   * ERROR
   * --------------------------------------------------
   */

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-sm text-red-300">
          Unable to load available time slots.
        </p>
      </div>
    );
  }

  /**
   * --------------------------------------------------
   * AVAILABLE SLOTS
   * --------------------------------------------------
   */

  const availableSlots: AvailabilitySlot[] =
    Array.isArray(data?.available_slots)
      ? data.available_slots
      : [];

  /**
   * --------------------------------------------------
   * CLOSED / NO SLOTS
   * --------------------------------------------------
   */

  if (
    !data ||
    data.is_closed ||
    availableSlots.length === 0
  ) {
    return (
      <div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-lime-400">
            Available Times
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Select Time
          </h2>

          <p className="mt-2 text-slate-400">
            Choose an available time range.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/40 p-8 text-center">
          <Clock className="mx-auto h-8 w-8 text-slate-500" />

          <p className="mt-4 text-sm text-slate-400">
            No available time slots for this date.
          </p>
        </div>
      </div>
    );
  }

  /**
   * --------------------------------------------------
   * CHECK WHETHER SLOTS ARE CONTIGUOUS
   * --------------------------------------------------
   *
   * Example:
   *
   * 6-7 available
   * 7-8 available
   * 8-9 available
   *
   * => 6-9 is valid
   *
   * But:
   *
   * 6-7 available
   * 7-8 unavailable
   * 8-9 available
   *
   * => 6-9 is invalid
   */

  const isRangeAvailable = (
    startIndex: number,
    endIndex: number
  ) => {
    if (
      startIndex < 0 ||
      endIndex < 0
    ) {
      return false;
    }

    if (
      endIndex < startIndex
    ) {
      return false;
    }

    for (
      let i = startIndex;
      i <= endIndex;
      i++
    ) {
      const current =
        availableSlots[i];

      if (!current) {
        return false;
      }

      if (i > startIndex) {
        const previous =
          availableSlots[i - 1];

        /**
         * Previous slot must end exactly
         * when current slot starts.
         */
        if (
          previous.end_time !==
          current.start_time
        ) {
          return false;
        }
      }
    }

    return true;
  };

  /**
   * --------------------------------------------------
   * HANDLE SLOT CLICK
   * --------------------------------------------------
   */

  const handleSlotClick = (
    slot: AvailabilitySlot,
    index: number
  ) => {
    /**
     * No start selected yet.
     *
     * First click becomes the start.
     */
    if (!selectedTime) {
      onSelect(
        slot.start_time,
        slot.end_time
      );

      return;
    }

    const selectedStartIndex =
      availableSlots.findIndex(
        (item) =>
          item.start_time ===
          selectedTime
      );

    /**
     * Safety check.
     */
    if (
      selectedStartIndex === -1
    ) {
      onSelect(
        slot.start_time,
        slot.end_time
      );

      return;
    }

    /**
     * Clicking the same starting slot
     * keeps it as a 1-hour reservation.
     */
    if (
      index === selectedStartIndex
    ) {
      onSelect(
        slot.start_time,
        slot.end_time
      );

      return;
    }

    /**
     * If customer clicks an earlier
     * slot than the current start,
     * make that slot the new start.
     */
    if (
      index < selectedStartIndex
    ) {
      onSelect(
        slot.start_time,
        slot.end_time
      );

      return;
    }

    /**
     * Validate complete range.
     */
    const valid =
      isRangeAvailable(
        selectedStartIndex,
        index
      );

    if (!valid) {
      /**
       * Start a new selection
       * instead of allowing a gap.
       */
      onSelect(
        slot.start_time,
        slot.end_time
      );

      return;
    }

    /**
     * End time is the END of the
     * clicked slot.
     *
     * Example:
     *
     * Click 6-7
     * Click 8-9
     *
     * Result:
     *
     * 6:00 PM -> 9:00 PM
     */
    onSelect(
      selectedTime,
      slot.end_time
    );
  };

  /**
   * --------------------------------------------------
   * DETERMINE SELECTED RANGE
   * --------------------------------------------------
   */

  const selectedStartIndex =
    selectedTime
      ? availableSlots.findIndex(
          (slot) =>
            slot.start_time ===
            selectedTime
        )
      : -1;

  const selectedEndIndex =
    selectedEndTime
      ? availableSlots.findIndex(
          (slot) =>
            slot.end_time ===
            selectedEndTime
        )
      : -1;

  /**
   * If parent has not provided an end
   * yet, treat the start slot as selected.
   */
  const rangeStart =
    selectedStartIndex >= 0
      ? selectedStartIndex
      : -1;

  const rangeEnd =
    selectedEndIndex >= 0
      ? selectedEndIndex
      : selectedStartIndex >= 0
      ? selectedStartIndex
      : -1;

  /**
   * --------------------------------------------------
   * SELECTED HOURS
   * --------------------------------------------------
   */

  const selectedHours =
    selectedTime &&
    selectedEndTime
      ? calculateHours(
          selectedTime,
          selectedEndTime
        )
      : 0;

  /**
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  return (
    <div>
      {/* HEADER */}

      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-lime-400">
          Available Times
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          Select Time
        </h2>

        <p className="mt-2 text-slate-400">
          Select your starting time, then select your ending time.
        </p>
      </div>

      {/* INSTRUCTION */}

      <div className="mt-6 rounded-2xl border border-lime-400/20 bg-lime-400/5 p-4">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-lime-400" />

          <div>
            <p className="font-semibold text-white">
              Choose your reservation range
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Click the starting hour first,
              then click the hour where you want
              your reservation to end.
            </p>
          </div>
        </div>
      </div>

      {/* SELECTED RANGE */}

      {selectedTime && selectedEndTime && (
        <div className="mt-6 rounded-2xl border border-lime-400/30 bg-lime-400/10 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-lime-300">
                Selected Time
              </p>

              <div className="mt-2 flex items-center gap-3">
                <span className="text-xl font-bold text-white">
                  {formatTime(
                    selectedTime
                  )}
                </span>

                <ArrowRight className="h-5 w-5 text-lime-400" />

                <span className="text-xl font-bold text-white">
                  {formatTime(
                    selectedEndTime
                  )}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/50 px-5 py-3 text-center">
              <p className="text-xs text-slate-500">
                Duration
              </p>

              <p className="mt-1 text-lg font-bold text-lime-400">
                {selectedHours}{" "}
                {selectedHours === 1
                  ? "hour"
                  : "hours"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SLOT GRID */}

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {availableSlots.map(
          (slot, index) => {
            const isInRange =
              rangeStart >= 0 &&
              rangeEnd >= 0 &&
              index >= rangeStart &&
              index <= rangeEnd;

            const isStart =
              selectedTime ===
              slot.start_time;

            const isEnd =
              selectedEndTime ===
              slot.end_time;

            return (
              <button
                key={`${slot.start_time}-${slot.end_time}`}
                type="button"
                onClick={() =>
                  handleSlotClick(
                    slot,
                    index
                  )
                }
                className={`
                  relative
                  rounded-2xl
                  border
                  p-6
                  text-left
                  transition-all
                  duration-200

                  ${
                    isInRange
                      ? "border-lime-400 bg-lime-400/10 shadow-lg shadow-lime-400/5"
                      : "border-white/10 bg-slate-900 hover:border-lime-400/40 hover:bg-slate-800"
                  }
                `}
              >
                {/* ICON */}

                <div className="flex items-center justify-between">
                  <Clock
                    className={
                      isInRange
                        ? "text-lime-400"
                        : "text-slate-400"
                    }
                  />

                  {isInRange && (
                    <CheckCircle2 className="h-5 w-5 text-lime-400" />
                  )}
                </div>

                {/* TIME */}

                <h3 className="mt-6 text-xl font-bold">
                  {formatTime(
                    slot.start_time
                  )}
                </h3>

                <p className="mt-2 text-slate-400">
                  {formatTime(
                    slot.start_time
                  )}{" "}
                  -{" "}
                  {formatTime(
                    slot.end_time
                  )}
                </p>

                {/* STATUS */}

                <div className="mt-6">
                  <span
                    className={`
                      rounded-full
                      px-3
                      py-1
                      text-sm

                      ${
                        isInRange
                          ? "bg-lime-400/20 text-lime-300"
                          : "bg-lime-400/10 text-lime-300"
                      }
                    `}
                  >
                    {isStart
                      ? "Start"
                      : isEnd
                      ? "End"
                      : isInRange
                      ? "Selected"
                      : "Available"}
                  </span>
                </div>

                {/* START / END INDICATOR */}

                {isStart &&
                  selectedEndTime && (
                    <div className="absolute right-4 top-4 rounded-full bg-lime-400 px-2 py-1 text-[10px] font-bold uppercase text-slate-950">
                      Start
                    </div>
                  )}

                {isEnd &&
                  selectedTime &&
                  selectedTime !==
                    selectedEndTime && (
                    <div className="absolute right-4 top-4 rounded-full bg-lime-400 px-2 py-1 text-[10px] font-bold uppercase text-slate-950">
                      End
                    </div>
                  )}
              </button>
            );
          }
        )}
      </div>

      {/* HELP */}

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500">
          Example: select 6:00 PM first,
          then select 9:00 PM to reserve
          6:00 PM – 9:00 PM.
        </p>
      </div>
    </div>
  );
}