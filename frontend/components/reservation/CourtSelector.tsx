"use client";

import { CheckCircle2 } from "lucide-react";

import { useCourts } from "@/hooks/useCourts";

interface Props {
  selectedCourt: number | null;
  onSelect: (courtId: number) => void;
}

export default function CourtSelector({
  selectedCourt,
  onSelect,
}: Props) {
  const {
    data: courts,
    isLoading,
    isError,
  } = useCourts();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="h-52 animate-pulse rounded-3xl bg-slate-800"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        Unable to load courts.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {courts?.map((court) => {
        const active = selectedCourt === court.id;

        return (
          <button
            key={court.id}
            onClick={() => onSelect(court.id)}
            className={`
              relative
              overflow-hidden
              rounded-3xl
              border
              p-7
              text-left
              transition-all
              duration-300

              ${
                active
                  ? "border-lime-400 bg-lime-400/10"
                  : "border-white/10 bg-slate-900 hover:border-lime-400/40"
              }
            `}
          >
            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">

                  Court #{court.court_number}

                </p>

                <h3 className="mt-2 text-2xl font-bold">

                  {court.name}

                </h3>

              </div>

              {active && (
                <CheckCircle2
                  size={28}
                  className="text-lime-400"
                />
              )}

            </div>

            <p className="mt-5 text-slate-400">

              {court.description}

            </p>

            <div className="mt-8 flex items-center justify-between">

              <span className="rounded-full bg-white/5 px-4 py-2 text-sm">

                {court.surface_type}

              </span>

              <span className="text-2xl font-black text-lime-400">

                ₱{court.hourly_rate}

              </span>

            </div>

          </button>
        );
      })}
    </div>
  );
}