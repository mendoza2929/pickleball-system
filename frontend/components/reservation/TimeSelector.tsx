"use client";

import { CheckCircle2, Clock, Loader2 } from "lucide-react";

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

interface Props {
  courtId: number;

  date: Date;

  selectedTime: string | null;

  onSelect: (
    start: string,
    end: string
  ) => void;
}

export default function TimeSelector({
  courtId,
  date,
  selectedTime,
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

  // ============================================================
  // LOADING
  // ============================================================

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

  // ============================================================
  // ERROR
  // ============================================================

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-sm text-red-300">
          Unable to load available time slots.
        </p>
      </div>
    );
  }

  // ============================================================
  // COURT CLOSED / NO AVAILABLE SLOTS
  // ============================================================

  if (
    !data ||
    data.is_closed ||
    !data.available_slots?.length
  ) {
    return (
      <div>
        <div>
          <h2 className="text-3xl font-bold">
            Select Time
          </h2>

          <p className="mt-2 text-slate-400">
            Choose an available time slot.
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

  // ============================================================
  // AVAILABLE SLOTS
  // ============================================================

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
          Choose an available time slot.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {data.available_slots.map(
          (slot) => {
            const active =
              selectedTime ===
              slot.start_time;

            return (
              <button
                key={`${slot.start_time}-${slot.end_time}`}
                type="button"
                onClick={() =>
                  onSelect(
                    slot.start_time,
                    slot.end_time
                  )
                }
                className={`
                  rounded-2xl
                  border
                  p-6
                  text-left
                  transition-all
                  ${
                    active
                      ? "border-lime-400 bg-lime-400/10"
                      : "border-white/10 bg-slate-900 hover:border-lime-400/40 hover:bg-slate-800"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <Clock
                    className={
                      active
                        ? "text-lime-400"
                        : "text-slate-400"
                    }
                  />

                  {active && (
                    <CheckCircle2 className="text-lime-400" />
                  )}
                </div>

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

                <div className="mt-6">
                  <span className="rounded-full bg-lime-400/20 px-3 py-1 text-sm text-lime-300">
                    Available
                  </span>
                </div>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}