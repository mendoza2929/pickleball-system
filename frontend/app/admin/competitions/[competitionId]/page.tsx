"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Plus,
  Pencil,
  Trophy,
  Users,
  Wallet,
  Play,
  CalendarDays,
} from "lucide-react";

import { competitionService } from "@/services/competitions/competition.service";

import {
  divisionService,
  CompetitionDivision,
} from "@/services/competitions/division.service";
import { courtAllocationService } from "@/services/competitions/court-allocation.service";
// ==================================================
// TYPES
// ==================================================

interface Competition {
  id: number;

  name: string;

  type:
    | "open_play"
    | "tournament";

  status:
    | "draft"
    | "published"
    | "registration_open"
    | "registration_closed"
    | "in_progress"
    | "completed"
    | "cancelled";

  start_at: string;

  end_at: string | null;

  description: string | null;
}

interface CourtAllocation {
  id: number;

  competition_id: number;

  competition_division_id:
    | number
    | null;

  court_id: number;

  allocation_date: string;

  start_time: string;

  end_time: string;

  allocation_type: string;

  // The API service currently returns status as a string.
  // Keep this page type compatible with the service response.
  status: string;

  court_number?: number;

  court_name?: string;
}

// ==================================================
// PAGE
// ==================================================

export default function CompetitionDetailsPage() {
  const params = useParams();

  const router = useRouter();

  // ==================================================
  // COMPETITION ID
  // ==================================================

  const competitionId =
    Number(params.competitionId);

  // ==================================================
  // API URL
  // ==================================================

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "";

  // ==================================================
  // STATE
  // ==================================================

  const [
    competition,
    setCompetition,
  ] = useState<Competition | null>(
    null
  );

  const [
    divisions,
    setDivisions,
  ] = useState<CompetitionDivision[]>(
    []
  );

  const [
    hasCourtAllocation,
    setHasCourtAllocation,
  ] = useState(false);

  const [
    allocationLoading,
    setAllocationLoading,
  ] = useState(true);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ==================================================
  // LOAD DATA
  // ==================================================

  useEffect(() => {
    if (
      !Number.isInteger(
        competitionId
      ) ||
      competitionId <= 0
    ) {
      setError(
        "Invalid competition ID."
      );

      setLoading(false);

      return;
    }

    loadData();
  }, [competitionId]);

  // ==================================================
  // LOAD COMPETITION DATA
  // ==================================================

  async function loadData() {
    try {
      setLoading(true);

      setError("");

      // -----------------------------------------------
      // Competition + Divisions
      // -----------------------------------------------

      const [
        competitionData,
        divisionData,
      ] = await Promise.all([
        competitionService.getById(
          competitionId
        ),

        divisionService.getByCompetition(
          competitionId
        ),
      ]);

      setCompetition(
        competitionData
      );

      setDivisions(
        divisionData
      );

      // -----------------------------------------------
      // Court Allocation
      // -----------------------------------------------

      await checkCourtAllocation();
    } catch (error: any) {
      console.error(
        "Failed to load competition:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load competition."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // CHECK COURT ALLOCATION
  // ==================================================

 async function checkCourtAllocation() {
  try {
    setAllocationLoading(true);

    const result =
      await courtAllocationService.getByCompetition(
        competitionId
      );

    console.log(
      "[Court Allocation] API response:",
      result
    );

    // ==================================================
    // GET ALLOCATIONS
    // ==================================================

    let allocations: CourtAllocation[] = [];

    if (Array.isArray(result)) {
      allocations = result;
    } else if (
      Array.isArray(result?.data)
    ) {
      allocations = result.data;
    }

    console.log(
      "[Court Allocation] Allocations:",
      allocations
    );

    // ==================================================
    // ONLY RESERVED COUNTS
    // ==================================================

    const hasReservedAllocation =
      allocations.some(
        (allocation) =>
          String(
            allocation.status
          ).toLowerCase() ===
          "reserved"
      );

    console.log(
      "[Court Allocation] Has reserved allocation:",
      hasReservedAllocation
    );

    setHasCourtAllocation(
      hasReservedAllocation
    );
  } catch (error) {
    console.error(
      "[Court Allocation] Failed:",
      error
    );

    setHasCourtAllocation(false);
  } finally {
    setAllocationLoading(false);
  }
}
  // ==================================================
  // HANDLE OPEN PLAY
  // ==================================================

  function handleOpenPlay(
    divisionId: number
  ) {
    // ==================================================
    // NO COURT ALLOCATION
    // ==================================================

    if (
      !hasCourtAllocation
    ) {
      router.push(
        `/admin/competitions/${competitionId}/court-allocation`
      );

      return;
    }

    // ==================================================
    // COURT ALLOCATION EXISTS
    // ==================================================

    router.push(
      `/admin/competitions/${competitionId}/divisions/${divisionId}/open-play`
    );
  }

  // ==================================================
  // FORMAT DATE
  // ==================================================

  function formatDate(
    value: string | null
  ) {
    if (!value) {
      return "—";
    }

    return new Date(
      value
    ).toLocaleString(
      "en-US",
      {
        month: "short",

        day: "numeric",

        year: "numeric",

        hour: "numeric",

        minute: "2-digit",
      }
    );
  }

  // ==================================================
  // FORMAT CURRENCY
  // ==================================================

  function formatCurrency(
    value: number
  ) {
    return new Intl.NumberFormat(
      "en-PH",
      {
        style: "currency",

        currency: "PHP",

        maximumFractionDigits: 0,
      }
    ).format(value);
  }

  // ==================================================
  // COMPETITION STATUS
  // ==================================================

  function competitionStatusClass(
    status: string
  ) {
    switch (status) {
      case "published":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "registration_open":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "registration_closed":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "in_progress":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";

      case "completed":
        return "bg-slate-100 text-slate-700 border-slate-200";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  }

  // ==================================================
  // DIVISION STATUS
  // ==================================================

  function divisionStatusClass(
    status: string
  ) {
    switch (status) {
      case "open":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "completed":
        return "bg-slate-100 text-slate-700 border-slate-200";

      case "closed":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">

        <div className="mx-auto max-w-7xl px-6 py-8">

          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

          <div className="mt-6 h-10 w-80 animate-pulse rounded bg-slate-200" />

          <div className="mt-8 grid gap-5 md:grid-cols-3">

            <div className="h-36 animate-pulse rounded-xl bg-white shadow-sm" />

            <div className="h-36 animate-pulse rounded-xl bg-white shadow-sm" />

            <div className="h-36 animate-pulse rounded-xl bg-white shadow-sm" />

          </div>

        </div>

      </main>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (
    error ||
    !competition
  ) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">

        <div className="mx-auto max-w-7xl px-6 py-8">

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/competitions"
              )
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Competitions
          </button>

          <div className="mt-6 rounded-xl border border-red-200 bg-white p-6 shadow-sm">

            <div className="text-sm font-semibold text-red-700">
              Unable to load competition
            </div>

            <p className="mt-1 text-sm text-slate-600">
              {error ||
                "Competition not found."}
            </p>

          </div>

        </div>

      </main>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* ============================================
            BACK
        ============================================ */}

        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/competitions"
            )
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Competitions
        </button>

        {/* ============================================
            HEADER
        ============================================ */}

        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                {competition.name}
              </h1>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${competitionStatusClass(
                  competition.status
                )}`}
              >
                {competition.status.replace(
                  "_",
                  " "
                )}
              </span>

            </div>

            <p className="mt-2 text-sm font-medium uppercase tracking-wide text-slate-500">
              {competition.type.replace(
                "_",
                " "
              )}
            </p>

            {competition.description && (
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                {
                  competition.description
                }
              </p>
            )}

          </div>

          {/* ==========================================
              ADD DIVISION
          ========================================== */}

          <button
            type="button"
            onClick={() =>
              router.push(
                `/admin/competitions/${competitionId}/divisions/new`
              )
            }
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />

            Add Division
          </button>

        </div>

        {/* ============================================
            SUMMARY
        ============================================ */}

        <div className="mt-8 grid gap-5 md:grid-cols-3">

          {/* TYPE */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Competition Type
                </p>

                <p className="mt-2 text-lg font-bold capitalize text-slate-950">
                  {competition.type.replace(
                    "_",
                    " "
                  )}
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">

                <Trophy className="h-5 w-5 text-blue-600" />

              </div>

            </div>

          </div>

          {/* SCHEDULE */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Schedule
                </p>

                <p className="mt-2 text-sm font-bold text-slate-950">
                  {formatDate(
                    competition.start_at
                  )}
                </p>

                {competition.end_at && (
                  <p className="mt-1 text-xs text-slate-500">
                    Until{" "}
                    {formatDate(
                      competition.end_at
                    )}
                  </p>
                )}

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">

                <CalendarDays className="h-5 w-5 text-violet-600" />

              </div>

            </div>

          </div>

          {/* DIVISIONS */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Divisions
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {
                    divisions.length
                  }
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Configured divisions
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">

                <Users className="h-5 w-5 text-emerald-600" />

              </div>

            </div>

          </div>

        </div>

        {/* ============================================
            DIVISIONS
        ============================================ */}

        <div className="mt-10">

          <div className="mb-5 flex items-end justify-between">

            <div>

              <h2 className="text-xl font-bold text-slate-950">
                Divisions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Configure player groups for this competition.
              </p>

            </div>

            {divisions.length > 0 && (
              <span className="text-sm font-medium text-slate-500">
                {
                  divisions.length
                }{" "}
                {divisions.length ===
                1
                  ? "division"
                  : "divisions"}
              </span>
            )}

          </div>

          {/* ==========================================
              EMPTY
          ========================================== */}

          {divisions.length ===
          0 ? (

            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

                <Trophy className="h-6 w-6 text-slate-500" />

              </div>

              <h3 className="mt-5 text-base font-bold text-slate-950">
                No divisions yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create a division to define the skill level,
                format, player capacity, and entry fee.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/admin/competitions/${competitionId}/divisions/new`
                  )
                }
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />

                Create Division
              </button>

            </div>

          ) : (

            /* ==========================================
               DIVISION CARDS
            ========================================== */

            <div className="grid gap-5 lg:grid-cols-2">

              {divisions.map(
                (
                  division
                ) => (

                  <div
                    key={
                      division.id
                    }
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                  >

                    {/* TOP */}

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-lg font-bold text-slate-950">
                            {
                              division.name
                            }
                          </h3>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${divisionStatusClass(
                              division.status
                            )}`}
                          >
                            {division.status.replace(
                              "_",
                              " "
                            )}
                          </span>

                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-sm text-slate-500">

                          <span className="capitalize">
                            {
                              division.skill_level
                            }
                          </span>

                          <span>
                            •
                          </span>

                          <span className="capitalize">
                            {
                              division.format
                            }
                          </span>

                        </div>

                      </div>

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/admin/competitions/${competitionId}/divisions/${division.id}/edit`
                          )
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
                        title="Edit division"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                    </div>

                    {/* DETAILS */}

                    <div className="mt-5 grid grid-cols-2 gap-3">

                      <div className="rounded-lg bg-slate-50 p-4">

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">

                          <Users className="h-4 w-4" />

                          Capacity

                        </div>

                        <p className="mt-2 text-base font-bold text-slate-950">
                          {
                            division.max_players ??
                            "Unlimited"
                          }
                        </p>

                      </div>

                      <div className="rounded-lg bg-slate-50 p-4">

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">

                          <Wallet className="h-4 w-4" />

                          Entry Fee

                        </div>

                        <p className="mt-2 text-base font-bold text-slate-950">

                          {formatCurrency(
                            Number(
                              division.entry_fee
                            )
                          )}

                        </p>

                      </div>

                    </div>

                    {/* =================================
                        OPEN PLAY
                    ================================= */}

                    {competition.type ===
                      "open_play" && (

                      <button
                        type="button"
                        disabled={
                          allocationLoading
                        }
                        onClick={() =>
                          handleOpenPlay(
                            division.id
                          )
                        }
                        className={`mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition ${
                          allocationLoading
                            ? "cursor-wait bg-slate-400"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >

                        <Play className="h-4 w-4" />

                        {allocationLoading
                          ? "Checking Courts..."
                          : hasCourtAllocation
                          ? "Manage Open Play"
                          : "Allocate Courts"}

                      </button>

                    )}

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </main>
  );
}