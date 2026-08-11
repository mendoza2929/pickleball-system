"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Trophy,
  DollarSign,
  Save,
} from "lucide-react";

import { divisionService } from "@/services/competitions/division.service";

type SkillLevel =
  | "beginner"
  |  "novice"
  |  "intermediate";

type DivisionFormat =
  | "singles"
  | "doubles";

type DivisionStatus =
  | "open"
  | "closed"
  | "in_progress"
  | "completed";

export default function CreateDivisionPage() {
  const params = useParams();
  const router = useRouter();

  const competitionId = Number(
    params.competitionId
  );

  const [name, setName] = useState("");
  const [skillLevel, setSkillLevel] =
    useState<SkillLevel>("beginner");

  const [format, setFormat] =
    useState<DivisionFormat>("doubles");

  const [maxPlayers, setMaxPlayers] =
    useState("");

  const [entryFee, setEntryFee] =
    useState("");

  const [status, setStatus] =
    useState<DivisionStatus>("open");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==================================================
  // SUBMIT
  // ==================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (
      !Number.isInteger(competitionId) ||
      competitionId <= 0
    ) {
      setError(
        "Invalid competition ID."
      );

      return;
    }

    if (!name.trim()) {
      setError(
        "Division name is required."
      );

      return;
    }

    if (
      maxPlayers &&
      (
        Number(maxPlayers) <= 0 ||
        !Number.isInteger(
          Number(maxPlayers)
        )
      )
    ) {
      setError(
        "Maximum players must be a positive whole number."
      );

      return;
    }

    if (
      entryFee &&
      Number(entryFee) < 0
    ) {
      setError(
        "Entry fee cannot be negative."
      );

      return;
    }

    try {
      setLoading(true);

      await divisionService.create(
        competitionId,
        {
          name: name.trim(),
          skillLevel,
          format,
          maxPlayers:
            maxPlayers
              ? Number(maxPlayers)
              : null,
          entryFee:
            entryFee
              ? Number(entryFee)
              : 0,
          status,
        }
      );

      router.push(
        `/admin/competitions/${competitionId}`
      );

      router.refresh();

    } catch (error: any) {
      console.error(
        "Create division error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create division."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <div className="mx-auto w-full max-w-3xl px-6 py-8 lg:px-8">

        {/* ============================================
            BACK
        ============================================ */}

        <button
          type="button"
          onClick={() =>
            router.push(
              `/admin/competitions/${competitionId}`
            )
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Competition
        </button>

        {/* ============================================
            HEADER
        ============================================ */}

        <div className="mt-8">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <Trophy className="h-6 w-6 text-blue-600" />
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            Create Division
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Configure the player group, format,
            capacity, and entry fee for this competition.
          </p>

        </div>

        {/* ============================================
            FORM
        ============================================ */}

        <form
          onSubmit={handleSubmit}
          className="mt-8"
        >

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

            {/* ========================================
                BASIC INFORMATION
            ======================================== */}

            <div className="border-b border-slate-200 p-6">

              <h2 className="text-base font-bold text-slate-950">
                Division Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Basic information about this division.
              </p>

              <div className="mt-6 space-y-5">

                {/* NAME */}

                <div>

                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Division Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    placeholder="Men's Open"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* SKILL + FORMAT */}

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>

                    <label
                      htmlFor="skillLevel"
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      Skill Level
                    </label>

                    <select
                      id="skillLevel"
                      value={skillLevel}
                      onChange={(event) =>
                        setSkillLevel(
                          event.target
                            .value as SkillLevel
                        )
                      }
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="beginner">
                        Beginner
                      </option>

                      <option value="novice">
                        Novice
                      </option>

                      <option value="intermediate">
                        Intermediate
                      </option>
                    </select>

                  </div>

                  <div>

                    <label
                      htmlFor="format"
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      Format
                    </label>

                    <select
                      id="format"
                      value={format}
                      onChange={(event) =>
                        setFormat(
                          event.target
                            .value as DivisionFormat
                        )
                      }
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="doubles">
                        Doubles
                      </option>

                      <option value="singles">
                        Singles
                      </option>
                    </select>

                  </div>

                </div>

              </div>

            </div>

            {/* ========================================
                CAPACITY & FEE
            ======================================== */}

            <div className="border-b border-slate-200 p-6">

              <h2 className="text-base font-bold text-slate-950">
                Capacity & Entry
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Set the player limit and entry fee.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                {/* MAX PLAYERS */}

                <div>

                  <label
                    htmlFor="maxPlayers"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"
                  >
                    <Users className="h-4 w-4 text-slate-500" />

                    Maximum Players
                  </label>

                  <input
                    id="maxPlayers"
                    type="number"
                    min="1"
                    value={maxPlayers}
                    onChange={(event) =>
                      setMaxPlayers(
                        event.target.value
                      )
                    }
                    placeholder="16"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-1.5 text-xs text-slate-500">
                    Leave empty for unlimited players.
                  </p>

                </div>

                {/* ENTRY FEE */}

                <div>

                  <label
                    htmlFor="entryFee"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"
                  >
                    <DollarSign className="h-4 w-4 text-slate-500" />

                    Entry Fee
                  </label>

                  <div className="relative">

                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                      ₱
                    </span>

                    <input
                      id="entryFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={entryFee}
                      onChange={(event) =>
                        setEntryFee(
                          event.target.value
                        )
                      }
                      placeholder="300"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* ========================================
                STATUS
            ======================================== */}

            <div className="p-6">

              <h2 className="text-base font-bold text-slate-950">
                Division Status
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Control whether players can join this division.
              </p>

              <div className="mt-5">

                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as DivisionStatus
                    )
                  }
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="open">
                    Open
                  </option>

                  <option value="closed">
                    Closed
                  </option>

                  <option value="in_progress">
                    In Progress
                  </option>

                  <option value="completed">
                    Completed
                  </option>
                </select>

              </div>

            </div>

          </div>

          {/* ==========================================
              ERROR
          ========================================== */}

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

            </div>
          )}

          {/* ==========================================
              ACTIONS
          ========================================== */}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                router.push(
                  `/admin/competitions/${competitionId}`
                )
              }
              className="h-11 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />

              {loading
                ? "Creating..."
                : "Create Division"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}