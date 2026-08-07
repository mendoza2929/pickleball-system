"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { formatTime } from "@/utils/time";
import { useAvailability } from "@/hooks/useAvailability";
function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

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
 const formattedDate = formatLocalDate(date);

  const {
    data,
    isLoading,
    isError,
  } = useAvailability(
    courtId,
    formattedDate
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-2xl bg-slate-800"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        Unable to load available time slots.
      </div>
    );
  }

  if (!data?.slots.length) {
    return (
      <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6">
        Court is closed on this day.
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div>

        <h2 className="text-3xl font-bold">

          Select Time

        </h2>

        <p className="mt-2 text-slate-400">

          Choose an available time slot.

        </p>

      </div>

      <div className="grid gap-5 md:grid-cols-3">

        {data.slots.map((slot) => {

          const active =
            selectedTime === slot.start;

          return (
            <button
              key={slot.start}
              disabled={!slot.available}
              onClick={() =>
                onSelect(
                  slot.start,
                  slot.end
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
                    : "border-white/10 bg-slate-900"
                }

                ${
                  !slot.available &&
                  "cursor-not-allowed opacity-40"
                }
              `}
            >
              <div className="flex items-center justify-between">

                <Clock className="text-lime-400" />

                {active && (
                  <CheckCircle2 className="text-lime-400" />
                )}

              </div>

              <h3 className="mt-6 text-xl font-bold">

                 {formatTime(slot.start)}

              </h3>

              <p className="mt-2 text-slate-400">

                <p className="mt-2 text-slate-400">
  {formatTime(slot.start)} - {formatTime(slot.end)}
</p>

              </p>

              <div className="mt-6">

                {slot.available ? (
                  <span className="rounded-full bg-lime-400/20 px-3 py-1 text-sm text-lime-300">
                    Available
                  </span>
                ) : (
                  <span className="rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-300">
                    Reserved
                  </span>
                )}

              </div>

            </button>
          );
        })}

      </div>

    </div>
  );
}