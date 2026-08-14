"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  RefreshCw,
  Save,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

interface Competition {
  id: number;
  name: string;

  type:
    | "open_play"
    | "tournament"
    | string;

  status: string;

  start_at: string;

  end_at: string | null;

  registration_start_at?: string | null;

  registration_end_at?: string | null;

  description?: string | null;
}

interface Court {
  id: number;

  court_number: number;

  name: string;

  status:
    | "Available"
    | "Maintenance"
    | "Inactive"
    | string;

  available?: boolean;

  reason?: string | null;

  selected?: boolean;
}

interface ApiResponse<T> {
  success: boolean;

  message?: string;

  data: T;
}

// ============================================================
// PAGE
// ============================================================

export default function CourtAllocationPage() {
  const params = useParams();

  const router = useRouter();

  const searchParams = useSearchParams();

  const competitionId = Number(
    params.competitionId
  );

  // ==========================================================
  // COMPETITION DIVISION ID
  // ==========================================================
  //
  // Example URL:
  //
  // /admin/competitions/12/court-allocation?divisionId=16
  //
  // The divisionId identifies which competition division
  // this court allocation belongs to.
  // ==========================================================

  const divisionIdParam =
    searchParams.get("divisionId");

  const divisionId = divisionIdParam
    ? Number(divisionIdParam)
    : NaN;

  // ==========================================================
  // COMPETITION
  // ==========================================================

  const [competition, setCompetition] =
    useState<Competition | null>(null);

  const [loadingCompetition, setLoadingCompetition] =
    useState(true);

  // ==========================================================
  // ALLOCATION PERIOD
  // ==========================================================

  const [allocationDate, setAllocationDate] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  // ==========================================================
  // COURTS
  // ==========================================================

  const [courts, setCourts] =
    useState<Court[]>([]);

  const [
    hasCheckedAvailability,
    setHasCheckedAvailability,
  ] = useState(false);

  // ==========================================================
  // LOADING
  // ==========================================================

  const [
    checkingAvailability,
    setCheckingAvailability,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  // ==========================================================
  // ERROR
  // ==========================================================

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================================
  // API URL
  // ==========================================================

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL;

  // ==========================================================
  // SELECTED COURTS
  // ==========================================================

  const selectedCourts = useMemo(
    () =>
      courts.filter(
        (court) =>
          court.selected === true
      ),
    [courts]
  );

  const selectedCount =
    selectedCourts.length;

  // ==========================================================
  // GET TOKEN
  // ==========================================================

  function getAccessToken() {
    return (
      localStorage.getItem(
        "accessToken"
      ) ||
      localStorage.getItem(
        "access_token"
      )
    );
  }

  // ==========================================================
  // PARSE COMPETITION DATETIME
  // ==========================================================

  function parseCompetitionDate(
    value: string
  ) {
    if (!value) {
      return null;
    }

    /*
     * MySQL commonly returns:
     *
     * 2026-08-15 18:07:00
     *
     * Convert it to:
     *
     * 2026-08-15T18:07:00
     *
     * so JavaScript can parse it.
     */

    const normalized =
      value.includes("T")
        ? value
        : value.replace(
            " ",
            "T"
          );

    const date =
      new Date(normalized);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

    return date;
  }

  // ==========================================================
  // FORMAT DATE FOR INPUT/API
  // ==========================================================

  function formatDateForApi(
    date: Date
  ) {
    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // ==========================================================
  // FORMAT TIME FOR API
  // ==========================================================

  function formatTimeForApi(
    date: Date
  ) {
    const hours =
      String(
        date.getHours()
      ).padStart(2, "0");

    const minutes =
      String(
        date.getMinutes()
      ).padStart(2, "0");

    return `${hours}:${minutes}`;
  }

  // ==========================================================
  // DISPLAY DATE
  // ==========================================================

  function formatDisplayDate(
    value: string
  ) {
    const date =
      parseCompetitionDate(
        value
      );

    if (!date) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  // ==========================================================
  // DISPLAY DATETIME
  // ==========================================================

  function formatDisplayDateTime(
    value: string | null
  ) {
    if (!value) {
      return "—";
    }

    const date =
      parseCompetitionDate(
        value
      );

    if (!date) {
      return value;
    }

    return date.toLocaleString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  // ==========================================================
  // DISPLAY TIME
  // ==========================================================

  function formatDisplayTime(
    value: string
  ) {
    if (!value) {
      return "—";
    }

    const [
      hours,
      minutes,
    ] = value
      .split(":")
      .map(Number);

    const date =
      new Date();

    date.setHours(
      hours,
      minutes,
      0,
      0
    );

    return date.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  // ==========================================================
  // LOAD COMPETITION
  // ==========================================================

  async function loadCompetition() {
    if (
      !Number.isInteger(
        competitionId
      ) ||
      competitionId <= 0
    ) {
      setError(
        "Invalid competition ID."
      );

      setLoadingCompetition(
        false
      );

      return;
    }

    if (!API_URL) {
      setError(
        "NEXT_PUBLIC_API_URL is not configured."
      );

      setLoadingCompetition(
        false
      );

      return;
    }

    try {
      setLoadingCompetition(true);

      setError(null);

      const token =
        getAccessToken();

      if (!token) {
        throw new Error(
          "Access token is required. Please log in again."
        );
      }

      const url =
        `${API_URL}/competitions/${competitionId}`;

      console.log(
        "[Court Allocation] Loading competition:",
        url
      );

      const response =
        await fetch(url, {
          method: "GET",

          credentials: "include",

          headers: {
            Accept:
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          cache: "no-store",
        });

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        const text =
          await response.text();

        console.error(
          "[Court Allocation] Invalid competition response:",
          text
        );

        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      const result =
        (await response.json()) as ApiResponse<
          Competition
        >;

      console.log(
        "[Court Allocation] Competition:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to load competition."
        );
      }

      if (
        result?.success === false
      ) {
        throw new Error(
          result?.message ||
            "Failed to load competition."
        );
      }

      const loadedCompetition =
        result?.data;

      if (!loadedCompetition) {
        throw new Error(
          "Competition data was not returned."
        );
      }

      // --------------------------------------------------------
      // IMPORTANT
      //
      // Your competition uses:
      //
      // start_at
      // end_at
      //
      // NOT:
      //
      // start_date
      // end_date
      // --------------------------------------------------------

      if (
        !loadedCompetition.start_at
      ) {
        throw new Error(
          "Competition start date/time is required before allocating courts."
        );
      }

      if (
        !loadedCompetition.end_at
      ) {
        throw new Error(
          "Competition end date/time is required before allocating courts."
        );
      }

      const start =
        parseCompetitionDate(
          loadedCompetition.start_at
        );

      const end =
        parseCompetitionDate(
          loadedCompetition.end_at
        );

      if (!start) {
        throw new Error(
          "Competition start date/time is invalid."
        );
      }

      if (!end) {
        throw new Error(
          "Competition end date/time is invalid."
        );
      }

      if (
        start.getTime() >=
        end.getTime()
      ) {
        throw new Error(
          "Competition end date/time must be later than the start date/time."
        );
      }

      setCompetition(
        loadedCompetition
      );

      // --------------------------------------------------------
      // AUTOMATICALLY USE COMPETITION PERIOD
      // --------------------------------------------------------

      const date =
        formatDateForApi(start);

      const startTimeValue =
        formatTimeForApi(start);

      const endTimeValue =
        formatTimeForApi(end);

      setAllocationDate(
        date
      );

      setStartTime(
        startTimeValue
      );

      setEndTime(
        endTimeValue
      );

      console.log(
        "[Court Allocation] Automatic period:",
        {
          date,
          startTime: startTimeValue,
          endTime: endTimeValue,
        }
      );

      // --------------------------------------------------------
      // AUTOMATICALLY CHECK COURTS
      // --------------------------------------------------------

      await checkAvailabilityForPeriod(
        date,
        startTimeValue,
        endTimeValue
      );
    } catch (err: any) {
      console.error(
        "[Court Allocation] Competition error:",
        err
      );

      setError(
        err?.message ||
          "Failed to load competition."
      );
    } finally {
      setLoadingCompetition(
        false
      );
    }
  }

  // ==========================================================
  // CHECK AVAILABLE COURTS
  // ==========================================================

  async function checkAvailabilityForPeriod(
    date: string,
    start: string,
    end: string
  ) {
    if (!API_URL) {
      throw new Error(
        "NEXT_PUBLIC_API_URL is not configured."
      );
    }

    if (
      !date ||
      !start ||
      !end
    ) {
      throw new Error(
        "Competition start and end date/time are required before allocating courts."
      );
    }

    if (start >= end) {
      throw new Error(
        "Competition end time must be later than the start time."
      );
    }

    try {
      setCheckingAvailability(
        true
      );

      setError(null);

      setCourts([]);

      setHasCheckedAvailability(
        false
      );

      const query =
        new URLSearchParams({
          date,
          start_time: start,
          end_time: end,
        });

      const token =
        getAccessToken();

      if (!token) {
        throw new Error(
          "Access token is required. Please log in again."
        );
      }

      const url =
        `${API_URL}` +
        `/competitions/${competitionId}` +
        `/court-allocations/available?${query.toString()}`;

      console.log(
        "[Court Allocation] Checking availability:",
        url
      );

      const response =
        await fetch(url, {
          method: "GET",

          credentials: "include",

          headers: {
            Accept:
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          cache: "no-store",
        });

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        const text =
          await response.text();

        console.error(
          "[Court Allocation] Availability non-JSON response:",
          text
        );

        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      const result =
        await response.json();

      console.log(
        "[Court Allocation] Availability response:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to check court availability."
        );
      }

      if (
        result?.success === false
      ) {
        throw new Error(
          result?.message ||
            "Failed to check court availability."
        );
      }

      const availableCourts =
        Array.isArray(
          result?.data?.courts
        )
          ? result.data.courts
          : Array.isArray(
              result?.data
            )
          ? result.data
          : [];

      const normalizedCourts =
        availableCourts.map(
          (court: Court) => ({
            ...court,

            selected: false,
          })
        );

      setCourts(
        normalizedCourts
      );

      setHasCheckedAvailability(
        true
      );
    } catch (err: any) {
      console.error(
        "[Court Allocation] Availability error:",
        err
      );

      setCourts([]);

      setHasCheckedAvailability(
        false
      );

      setError(
        err?.message ||
          "Failed to check court availability."
      );

      throw err;
    } finally {
      setCheckingAvailability(
        false
      );
    }
  }

  // ==========================================================
  // MANUAL REFRESH
  // ==========================================================

  async function refreshAvailability() {
    if (
      !allocationDate ||
      !startTime ||
      !endTime
    ) {
      setError(
        "Competition start and end date/time are required before allocating courts."
      );

      return;
    }

    try {
      await checkAvailabilityForPeriod(
        allocationDate,
        startTime,
        endTime
      );
    } catch {
      // Error already handled.
    }
  }

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadCompetition();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitionId, divisionId]);

  // ==========================================================
  // TOGGLE COURT
  // ==========================================================

  function toggleCourt(
    courtId: number
  ) {
    setCourts(
      (current) =>
        current.map(
          (court) => {
            if (
              court.id !==
              courtId
            ) {
              return court;
            }

            const isAvailable =
              court.available !==
                false &&
              court.status ===
                "Available";

            if (
              !isAvailable
            ) {
              return court;
            }

            return {
              ...court,

              selected:
                !court.selected,
            };
          }
        )
    );
  }

  // ==========================================================
  // SELECT ALL
  // ==========================================================

  function selectAll() {
    setCourts(
      (current) =>
        current.map(
          (court) => ({
            ...court,

            selected:
              court.available !==
                false &&
              court.status ===
                "Available",
          })
        )
    );
  }

  // ==========================================================
  // CLEAR
  // ==========================================================

  function clearAll() {
    setCourts(
      (current) =>
        current.map(
          (court) => ({
            ...court,

            selected: false,
          })
        )
    );
  }

  // ==========================================================
  // SAVE ALLOCATION
  // ==========================================================

  async function handleSave() {
    if (!API_URL) {
      setError(
        "NEXT_PUBLIC_API_URL is not configured."
      );

      return;
    }

    // --------------------------------------------------------
    // DIVISION ID
    // --------------------------------------------------------
    //
    // This page must be opened with:
    //
    // ?divisionId=16
    //
    // Do not allow an allocation without a division.
    // --------------------------------------------------------

    if (
      !Number.isInteger(divisionId) ||
      divisionId <= 0
    ) {
      setError(
        "Competition division is required."
      );

      return;
    }

    if (
      !competition
    ) {
      setError(
        "Competition information is not loaded."
      );

      return;
    }

    if (
      !competition.start_at ||
      !competition.end_at
    ) {
      setError(
        "Competition start and end date/time are required before allocating courts."
      );

      return;
    }

    if (
      !allocationDate ||
      !startTime ||
      !endTime
    ) {
      setError(
        "Competition start and end date/time are required before allocating courts."
      );

      return;
    }

    if (
      selectedCount === 0
    ) {
      setError(
        "Please select at least one available court."
      );

      return;
    }

    if (
      !hasCheckedAvailability
    ) {
      setError(
        "Please check court availability first."
      );

      return;
    }

    try {
      setSaving(true);

      setError(null);

      const token =
        getAccessToken();

      if (!token) {
        throw new Error(
          "Access token is required. Please log in again."
        );
      }

      // ------------------------------------------------------
      // Allocate each selected court
      // ------------------------------------------------------

      console.log(
        "[Court Allocation] Saving:",
        {
          competitionId,
          divisionId,
          selectedCourtIds:
            selectedCourts.map(
              (court) => court.id
            ),
          allocationDate,
          startTime,
          endTime,
          allocationType:
            competition.type ===
            "tournament"
              ? "tournament"
              : "open_play",
        }
      );

      for (
        const court of selectedCourts
      ) {
        const url =
          `${API_URL}/competitions/${competitionId}` +
          `/court-allocations`;

        const response =
          await fetch(url, {
            method: "POST",

            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              competition_id:
                competitionId,

              // IMPORTANT:
              // Use the divisionId from the URL.
              //
              // Example:
              // ?divisionId=16
              //
              // This makes the allocation belong to
              // competition division 16 instead of null.
              competition_division_id:
                divisionId,

              court_id:
                court.id,

              allocation_date:
                allocationDate,

              start_time:
                startTime,

              end_time:
                endTime,

              allocation_type:
                competition.type ===
                "tournament"
                  ? "tournament"
                  : "open_play",
            }),
          });

        const contentType =
          response.headers.get(
            "content-type"
          );

        if (
          !contentType?.includes(
            "application/json"
          )
        ) {
          const text =
            await response.text();

          console.error(
            "[Court Allocation] Save non-JSON response:",
            text
          );

          throw new Error(
            `Server returned an invalid response (${response.status}).`
          );
        }

        const result =
          await response.json();

        console.log(
          "[Court Allocation] Save result:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.message ||
              `Failed to allocate ${court.name}.`
          );
        }

        if (
          result?.success === false
        ) {
          throw new Error(
            result?.message ||
              `Failed to allocate ${court.name}.`
          );
        }
      }

      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      router.push(
        `/admin/competitions/${competitionId}`
      );
    } catch (err: any) {
      console.error(
        "[Court Allocation] Save error:",
        err
      );

      setError(
        err?.message ||
          "Failed to save court allocation."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loadingCompetition
  ) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
            <RefreshCw className="h-5 w-5 animate-spin" />

            Loading competition...
          </div>
        </div>
      </main>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">

        {/* ================================================== */}
        {/* BACK */}
        {/* ================================================== */}

        <button
          type="button"
          onClick={() =>
            router.push(
              `/admin/competitions/${competitionId}`
            )
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Competition
        </button>

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div>
          <div className="flex flex-wrap items-center gap-3">

            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Court Allocation
            </h1>

            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {competition?.type ===
              "tournament"
                ? "Tournament"
                : "Open Play"}
            </span>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Courts are automatically checked
            using the competition's scheduled
            date and time.
          </p>

          <div className="mt-3 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Division ID:{" "}
            {Number.isInteger(divisionId) &&
            divisionId > 0
              ? divisionId
              : "Missing"}
          </div>
        </div>

        {/* ================================================== */}
        {/* COMPETITION INFORMATION */}
        {/* ================================================== */}

        {competition && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 p-5">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Competition
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    {competition.name}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    refreshAvailability
                  }
                  disabled={
                    checkingAvailability ||
                    saving
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      checkingAvailability
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  Refresh Availability
                </button>
              </div>
            </div>

            {/* ================================================== */}
            {/* SCHEDULE */}
            {/* ================================================== */}

            <div className="grid gap-5 p-5 md:grid-cols-3">

              {/* DATE */}

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <CalendarDays className="h-4 w-4" />

                  Date
                </div>

                <p className="mt-2 text-sm font-bold text-slate-950">
                  {formatDisplayDate(
                    competition.start_at
                  )}
                </p>

              </div>

              {/* START */}

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Clock className="h-4 w-4" />

                  Start
                </div>

                <p className="mt-2 text-sm font-bold text-slate-950">
                  {formatDisplayDateTime(
                    competition.start_at
                  )}
                </p>

              </div>

              {/* END */}

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Clock className="h-4 w-4" />

                  End
                </div>

                <p className="mt-2 text-sm font-bold text-slate-950">
                  {formatDisplayDateTime(
                    competition.end_at
                  )}
                </p>

              </div>

            </div>

            {/* ================================================== */}
            {/* PERIOD */}
            {/* ================================================== */}

            {allocationDate &&
              startTime &&
              endTime && (
                <div className="mx-5 mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-4">

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Court Blocking Period
                      </p>

                      <p className="mt-1 text-sm font-bold text-blue-950">
                        {formatDisplayDate(
                          allocationDate
                        )}
                      </p>
                    </div>

                    <div className="text-sm font-semibold text-blue-700">
                      {formatDisplayTime(
                        startTime
                      )}

                      <span className="mx-2 text-blue-400">
                        →
                      </span>

                      {formatDisplayTime(
                        endTime
                      )}
                    </div>

                  </div>

                  <p className="mt-2 text-xs leading-5 text-blue-700">
                    These courts will be unavailable
                    for walk-in and online reservations
                    during this competition period.
                  </p>

                </div>
              )}

            {/* ================================================== */}
            {/* ERROR */}
            {/* ================================================== */}

            {error && (
              <div className="mx-5 mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

          </div>
        )}

        {/* ================================================== */}
        {/* CHECKING */}
        {/* ================================================== */}

        {checkingAvailability && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-slate-500" />

            <h3 className="mt-4 text-sm font-bold text-slate-950">
              Checking court availability
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Checking which courts are already
              reserved, under maintenance, or
              occupied by another competition.
            </p>

          </div>
        )}

        {/* ================================================== */}
        {/* RESULTS */}
        {/* ================================================== */}

        {hasCheckedAvailability &&
          !checkingAvailability && (
            <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">

              {/* HEADER */}

              <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <h2 className="text-lg font-bold text-slate-950">
                    Available Courts
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">

                    {courts.length === 0
                      ? "No courts are available for this competition period."
                      : `${courts.length} court${
                          courts.length ===
                          1
                            ? ""
                            : "s"
                        } available for the competition period.`}

                  </p>

                </div>

                {courts.length >
                  0 && (
                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={
                        selectAll
                      }
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={
                        clearAll
                      }
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Clear
                    </button>

                  </div>
                )}

              </div>

              {/* ================================================== */}
              {/* NO COURTS */}
              {/* ================================================== */}

              {courts.length ===
                0 && (
                <div className="p-10 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-slate-950">
                    No courts available
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    All courts are currently
                    unavailable during this
                    competition period.
                  </p>

                </div>
              )}

              {/* ================================================== */}
              {/* COURTS */}
              {/* ================================================== */}

              {courts.length >
                0 && (
                <div className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">

                  {courts.map(
                    (court) => {

                      const isAvailable =
                        court.available !==
                          false &&
                        court.status ===
                          "Available";

                      const isSelected =
                        court.selected ===
                        true;

                      return (
                        <button
                          key={
                            court.id
                          }
                          type="button"
                          disabled={
                            !isAvailable ||
                            saving
                          }
                          onClick={() =>
                            toggleCourt(
                              court.id
                            )
                          }
                          className={`relative rounded-xl border p-5 text-left transition ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                              : isAvailable
                              ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                              : "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
                          }`}
                        >

                          {/* CHECK */}

                          <div
                            className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border ${
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 bg-white text-transparent"
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </div>

                          {/* COURT */}

                          <div className="flex items-center gap-3">

                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-lg font-bold ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {
                                court.court_number
                              }
                            </div>

                            <div className="pr-8">

                              <p className="text-sm font-bold text-slate-950">
                                {
                                  court.name
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Court #
                                {
                                  court.court_number
                                }
                              </p>

                            </div>

                          </div>

                          {/* STATUS */}

                          <div className="mt-5">

                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                isAvailable
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-red-200 bg-red-50 text-red-700"
                              }`}
                            >
                              {isAvailable
                                ? "Available"
                                : "Unavailable"}
                            </span>

                          </div>

                          {/* REASON */}

                          {!isAvailable &&
                            court.reason && (
                              <p className="mt-3 text-xs leading-5 text-red-600">
                                {
                                  court.reason
                                }
                              </p>
                            )}

                        </button>
                      );
                    }
                  )}

                </div>
              )}

              {/* ================================================== */}
              {/* FOOTER */}
              {/* ================================================== */}

              {courts.length >
                0 && (
                <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">

                  <div>

                    <p className="text-sm font-semibold text-slate-950">
                      {selectedCount}{" "}
                      {selectedCount ===
                      1
                        ? "court"
                        : "courts"}{" "}
                      selected
                    </p>

                    <p className="mt-1 text-xs text-slate-500">

                      {allocationDate &&
                        formatDisplayDate(
                          allocationDate
                        )}

                      {startTime &&
                        endTime && (
                          <>
                            {" "}
                            •{" "}
                            {formatDisplayTime(
                              startTime
                            )}{" "}
                            →{" "}
                            {formatDisplayTime(
                              endTime
                            )}
                          </>
                        )}

                    </p>

                  </div>

                  <div className="flex items-center gap-3">

                    <button
                      type="button"
                      disabled={
                        saving
                      }
                      onClick={() =>
                        router.push(
                          `/admin/competitions/${competitionId}`
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleSave
                      }
                      disabled={
                        saving ||
                        selectedCount ===
                          0
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      {saving ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />

                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />

                          Allocate Courts
                        </>
                      )}

                    </button>

                  </div>

                </div>
              )}

            </div>
          )}

      </div>
    </main>
  );
}