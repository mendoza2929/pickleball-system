"use client";

import {
  Ban,
  CheckCircle2,
  Wrench,
} from "lucide-react";

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
      <div className="grid gap-5 md:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="
              h-44
              animate-pulse
              rounded-3xl
              border
              border-white/10
              bg-slate-900
            "
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
        Unable to load courts.
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {courts?.map((court) => {
        const active =
          selectedCourt === court.id;

        const status =
          court.status?.toUpperCase();

        const available =
          status === "AVAILABLE";

        const maintenance =
          status === "MAINTENANCE";

        const inactive =
          status === "INACTIVE";

        const unavailable =
          maintenance || inactive;

        return (
          <button
            key={court.id}
            type="button"
            disabled={unavailable}
            onClick={() => {
              if (!available) return;

              onSelect(court.id);
            }}
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
                  : unavailable
                    ? "cursor-not-allowed border-white/5 bg-slate-900/50 opacity-60"
                    : "border-white/10 bg-slate-900 hover:border-lime-400/40"
              }
            `}
          >
            {/* Header */}

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Court #{court.court_number}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {court.name}
                </h3>
              </div>

              {/* Selected */}

              {active && available && (
                <CheckCircle2
                  size={28}
                  className="text-lime-400"
                />
              )}

              {/* Maintenance */}

              {maintenance && (
                <Wrench
                  size={24}
                  className="text-orange-400"
                />
              )}

              {/* Inactive */}

              {inactive && (
                <Ban
                  size={24}
                  className="text-red-400"
                />
              )}
            </div>

            {/* Description */}

            <p className="mt-5 text-slate-400">
              {court.description ||
                "Professional pickleball court."}
            </p>

            {/* Bottom */}

            <div className="mt-8 flex items-center justify-between">
              <span className="rounded-full bg-white/5 px-4 py-2 text-sm">
                {court.surface_type}
              </span>

              <div className="text-right">
                {available ? (
                  <span className="text-2xl font-black text-lime-400">
                    ₱
                    {Number(
                      court.hourly_rate
                    ).toLocaleString()}
                  </span>
                ) : maintenance ? (
                  <span className="text-sm font-semibold text-orange-400">
                    Maintenance
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-red-400">
                    Unavailable
                  </span>
                )}
              </div>
            </div>

            {/* Status label */}

            {!available && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm">
                {maintenance ? (
                  <>
                    <Wrench
                      size={16}
                      className="text-orange-400"
                    />

                    <span className="text-orange-300">
                      This court is currently under maintenance.
                    </span>
                  </>
                ) : (
                  <>
                    <Ban
                      size={16}
                      className="text-red-400"
                    />

                    <span className="text-red-300">
                      This court is currently unavailable.
                    </span>
                  </>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}