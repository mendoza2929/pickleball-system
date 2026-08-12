"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronRight,
  CirclePlus,
  Clock3,
  FileText,
  Pencil,
  Search,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";

import {
  competitionService,
  Competition,
  CompetitionStatus,
  CompetitionType,
} from "@/services/competitions/competition.service";

import { divisionService } from "@/services/competitions/division.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ============================================================
// HELPERS
// ============================================================

function formatDate(
  value: string | null
) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

function formatDateRange(
  start: string,
  end: string | null
) {
  const startDate =
    formatDate(start);

  if (!end) {
    return startDate;
  }

  return `${startDate} – ${formatDate(
    end
  )}`;
}

// ============================================================
// DATETIME HELPERS
// ============================================================

/**
 * Convert any supported API/form datetime
 * into datetime-local format:
 *
 * YYYY-MM-DDTHH:mm
 *
 * Supported:
 *
 * 2026-08-29T16:00
 * 2026-08-29T16:00:00
 * 2026-08-29T16:00:00.000
 * 2026-08-29 16:00:00
 * 08/29/2026 04:00 PM
 */
function toDateTimeLocal(
  value:
    | string
    | null
    | undefined
): string {
  if (!value) {
    return "";
  }

  const input =
    String(value).trim();

  // ==========================================================
  // YYYY-MM-DDTHH:mm
  // ==========================================================

  let match = input.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/
  );

  if (match) {
    return `${match[1]}T${match[2]}:00`;
  }

  // ==========================================================
  // ISO
  //
  // 2026-08-29T16:00:00
  // 2026-08-29T16:00:00.000
  // ==========================================================

  match = input.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?$/
  );

  if (match) {
    return `${match[1]}T${match[2]}:00`;
  }

  // ==========================================================
  // MYSQL
  //
  // 2026-08-29 16:00:00
  // ==========================================================

  match = input.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/
  );

  if (match) {
    return `${match[1]}T${match[2]}:00`;
  }

  // ==========================================================
  // DISPLAY FORMAT
  //
  // 08/29/2026 04:00 PM
  // ==========================================================

  match = input.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (match) {
    const month =
      Number(match[1]);

    const day =
      Number(match[2]);

    const year =
      Number(match[3]);

    let hour =
      Number(match[4]);

    const minute =
      Number(match[5]);

    const meridiem =
      match[6].toUpperCase();

    if (meridiem === "AM") {
      if (hour === 12) {
        hour = 0;
      }
    } else {
      if (hour !== 12) {
        hour += 12;
      }
    }

    return `${year}-${String(
      month
    ).padStart(
      2,
      "0"
    )}-${String(day).padStart(
      2,
      "0"
    )}T${String(hour).padStart(
      2,
      "0"
    )}:00`;
  }

  return "";
}

// ============================================================
// HOURLY VALIDATION
// ============================================================

function isHourlyDateTime(
  value: string
) {
  if (!value) {
    return false;
  }

  const match =
    value.match(
      /^\d{4}-\d{2}-\d{2}T\d{2}:(\d{2})$/
    );

  if (!match) {
    return false;
  }

  return match[1] === "00";
}

// ============================================================
// FORMAT DATE FOR API
// ============================================================

function normalizeDateTimeForApi(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return null;
  }

  const normalized =
    toDateTimeLocal(value);

  return normalized || null;
}

// ============================================================
// STATUS
// ============================================================

function getStatusLabel(
  status: CompetitionStatus
) {
  const labels: Record<
    CompetitionStatus,
    string
  > = {
    draft: "Draft",
    published: "Published",
    registration_open:
      "Registration Open",
    registration_closed:
      "Registration Closed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return labels[status];
}

function getStatusClasses(
  status: CompetitionStatus
) {
  switch (status) {
    case "registration_open":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";

    case "in_progress":
      return "bg-blue-50 text-blue-700 ring-blue-200";

    case "published":
      return "bg-indigo-50 text-indigo-700 ring-indigo-200";

    case "completed":
      return "bg-slate-100 text-slate-700 ring-slate-200";

    case "cancelled":
      return "bg-red-50 text-red-700 ring-red-200";

    case "registration_closed":
      return "bg-amber-50 text-amber-700 ring-amber-200";

    case "draft":
    default:
      return "bg-gray-100 text-gray-700 ring-gray-200";
  }
}

function getTypeLabel(
  type: CompetitionType
) {
  return type === "open_play"
    ? "Open Play"
    : "Tournament";
}

// ============================================================
// PAGE
// ============================================================

export default function CompetitionsPage() {
  const [
    competitions,
    setCompetitions,
  ] = useState<Competition[]>([]);

  const [
    divisionCounts,
    setDivisionCounts,
  ] = useState<Record<number, number>>(
    {}
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    CompetitionStatus | "all"
  >("all");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState<
    CompetitionType | "all"
  >("all");

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingCompetition,
    setEditingCompetition,
  ] =
    useState<Competition | null>(
      null
    );

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<Competition | null>(
    null
  );

  // ==========================================================
  // LOAD
  // ==========================================================

  async function loadCompetitions() {
    try {
      setLoading(true);
      setError(null);

      const data =
        await competitionService.getAll();

      setCompetitions(data);

      const counts: Record<
        number,
        number
      > = {};

      await Promise.all(
        data.map(
          async (competition) => {
            try {
              const divisions =
                await divisionService.getByCompetition(
                  competition.id
                );

              counts[
                competition.id
              ] = divisions.length;
            } catch {
              counts[
                competition.id
              ] = 0;
            }
          }
        )
      );

      setDivisionCounts(counts);
    } catch (err: any) {
      console.error(
        "Load competitions error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load competitions"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompetitions();
  }, []);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredCompetitions =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      return competitions.filter(
        (competition) => {
          const matchesSearch =
            !value ||
            competition.name
              .toLowerCase()
              .includes(value);

          const matchesStatus =
            statusFilter === "all" ||
            competition.status ===
              statusFilter;

          const matchesType =
            typeFilter === "all" ||
            competition.type ===
              typeFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesType
          );
        }
      );
    }, [
      competitions,
      search,
      statusFilter,
      typeFilter,
    ]);

  // ==========================================================
  // STATS
  // ==========================================================

  const total =
    competitions.length;

  const active =
    competitions.filter(
      (item) =>
        item.status ===
          "registration_open" ||
        item.status ===
          "in_progress"
    ).length;

  const completed =
    competitions.filter(
      (item) =>
        item.status ===
        "completed"
    ).length;

  // ==========================================================
  // CREATE
  // ==========================================================

  function openCreate() {
    setEditingCompetition(null);
    setModalOpen(true);
  }

  // ==========================================================
  // EDIT
  // ==========================================================

  function openEdit(
    competition: Competition
  ) {
    /*
     * IMPORTANT:
     *
     * Do not use:
     *
     * competition.start_at.slice(0, 16)
     *
     * because the API/database can return
     * different datetime formats.
     *
     * Always convert using toDateTimeLocal().
     */

    const normalizedCompetition: Competition =
      {
        ...competition,

        start_at:
          competition.start_at,

        end_at:
          competition.end_at,

        registration_start_at:
          competition.registration_start_at,

        registration_end_at:
          competition.registration_end_at,
      };

    setEditingCompetition(
      normalizedCompetition
    );

    setModalOpen(true);
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await competitionService.delete(
        deleteTarget.id
      );

      setDeleteTarget(null);

      await loadCompetitions();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          "Failed to delete competition"
      );
    }
  }

  // ==========================================================
  // SAVED
  // ==========================================================

  async function handleSaved(
    competition: Competition
  ) {
    setModalOpen(false);
    setEditingCompetition(null);

    await loadCompetitions();
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-full bg-slate-50 text-slate-950">
      <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Trophy className="h-4 w-4" />

              <span>
                Competition Management
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Competitions
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Create and manage competitions,
              divisions, registration, and
              Open Play sessions.
            </p>
          </div>

          <Button
            type="button"
            onClick={openCreate}
            className="h-10 gap-2 rounded-lg px-4"
          >
            <CirclePlus className="h-4 w-4" />
            New Competition
          </Button>
        </div>

        {/* SUMMARY */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={Trophy}
            label="Total Competitions"
            value={total}
          />

          <SummaryCard
            icon={Clock3}
            label="Active"
            value={active}
          />

          <SummaryCard
            icon={FileText}
            label="Completed"
            value={completed}
          />
        </div>

        {/* SEARCH / FILTER */}

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

            <div className="relative w-full xl:max-w-md">
              <Search
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search competitions..."
                autoComplete="off"
                className="
                  h-10
                  border-slate-200
                  bg-white
                  pl-9
                  !text-slate-950
                  placeholder:!text-slate-400
                "
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as
                      | CompetitionStatus
                      | "all"
                  )
                }
                className="
                  h-10
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-sm
                  !text-slate-950
                  outline-none
                "
              >
                <option value="all">
                  All statuses
                </option>

                <option value="draft">
                  Draft
                </option>

                <option value="published">
                  Published
                </option>

                <option value="registration_open">
                  Registration Open
                </option>

                <option value="registration_closed">
                  Registration Closed
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target
                      .value as
                      | CompetitionType
                      | "all"
                  )
                }
                className="
                  h-10
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-sm
                  !text-slate-950
                  outline-none
                "
              >
                <option value="all">
                  All types
                </option>

                <option value="open_play">
                  Open Play
                </option>

                <option value="tournament">
                  Tournament
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-red-800">
                  Unable to load competitions
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={
                  loadCompetitions
                }
                className="
                  border-red-200
                  bg-white
                  !text-red-700
                "
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* CONTENT */}

        {loading ? (
          <CompetitionLoading />
        ) : filteredCompetitions.length ===
          0 ? (
          <EmptyState
            hasFilters={
              Boolean(
                search.trim()
              ) ||
              statusFilter !==
                "all" ||
              typeFilter !==
                "all"
            }
            onClear={() => {
              setSearch("");
              setStatusFilter(
                "all"
              );
              setTypeFilter(
                "all"
              );
            }}
            onCreate={
              openCreate
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredCompetitions.map(
              (competition) => (
                <CompetitionCard
                  key={
                    competition.id
                  }
                  competition={
                    competition
                  }
                  divisionCount={
                    divisionCounts[
                      competition.id
                    ] ?? 0
                  }
                  onEdit={() =>
                    openEdit(
                      competition
                    )
                  }
                  onDelete={() =>
                    setDeleteTarget(
                      competition
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* CREATE / EDIT */}

      {modalOpen && (
        <CompetitionModal
          competition={
            editingCompetition
          }
          onClose={() => {
            setModalOpen(false);
            setEditingCompetition(
              null
            );
          }}
          onSaved={
            handleSaved
          }
        />
      )}

      {/* DELETE */}

      {deleteTarget && (
        <DeleteModal
          competition={
            deleteTarget
          }
          onClose={() =>
            setDeleteTarget(null)
          }
          onConfirm={
            handleDelete
          }
        />
      )}
    </div>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-semibold text-slate-950">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPETITION CARD
// ============================================================

function CompetitionCard({
  competition,
  divisionCount,
  onEdit,
  onDelete,
}: {
  competition: Competition;
  divisionCount: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="min-w-0 flex-1">

            <div className="mb-2 flex flex-wrap items-center gap-2">

              <span
                className={`
                  inline-flex
                  rounded-full
                  px-2.5
                  py-1
                  text-xs
                  font-medium
                  ring-1
                  ring-inset
                  ${getStatusClasses(
                    competition.status
                  )}
                `}
              >
                {getStatusLabel(
                  competition.status
                )}
              </span>

              <span
                className="
                  rounded-full
                  bg-slate-100
                  px-2.5
                  py-1
                  text-xs
                  font-medium
                  !text-slate-700
                "
              >
                {getTypeLabel(
                  competition.type
                )}
              </span>
            </div>

            <h2 className="text-lg font-semibold !text-slate-950">
              {competition.name}
            </h2>

            {competition.description && (
              <p className="mt-1 line-clamp-2 max-w-2xl text-sm !text-slate-500">
                {competition.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm !text-slate-500">

              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" />

                <span>
                  {formatDateRange(
                    competition.start_at,
                    competition.end_at
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />

                <span>
                  {divisionCount}{" "}
                  {divisionCount ===
                  1
                    ? "division"
                    : "divisions"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-100 pt-4 lg:border-t-0 lg:pt-0">

            <Button
              type="button"
              variant="outline"
              onClick={onEdit}
              className="
                gap-2
                !text-slate-700
              "
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onDelete}
              className="
                gap-2
                border-red-200
                !text-red-600
              "
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>

            <Button
              type="button"
              onClick={() => {
                window.location.href =
                  `/admin/competitions/${competition.id}`;
              }}
              className="gap-2"
            >
              Manage
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CREATE / EDIT MODAL
// ============================================================

function CompetitionModal({
  competition,
  onClose,
  onSaved,
}: {
  competition:
    | Competition
    | null;

  onClose: () => void;

  onSaved: (
    competition: Competition
  ) => Promise<void>;
}) {
  const isEdit =
    Boolean(competition);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================================
  // FORM
  // ==========================================================

  const [form, setForm] =
    useState({
      name:
        competition?.name ??
        "",

      type:
        competition?.type ??
        ("open_play" as CompetitionType),

      status:
        competition?.status ??
        ("draft" as CompetitionStatus),

      /*
       * IMPORTANT:
       *
       * Existing competition values are
       * converted to datetime-local format.
       */
      startAt:
        toDateTimeLocal(
          competition?.start_at
        ),

      endAt:
        toDateTimeLocal(
          competition?.end_at
        ),

      registrationStartAt:
        toDateTimeLocal(
          competition?.registration_start_at
        ),

      registrationEndAt:
        toDateTimeLocal(
          competition?.registration_end_at
        ),

      description:
        competition?.description ??
        "",
    });

  // ==========================================================
  // IMPORTANT:
  // RESET FORM WHEN EDIT TARGET CHANGES
  // ==========================================================

  useEffect(() => {
    setForm({
      name:
        competition?.name ??
        "",

      type:
        competition?.type ??
        ("open_play" as CompetitionType),

      status:
        competition?.status ??
        ("draft" as CompetitionStatus),

      startAt:
        toDateTimeLocal(
          competition?.start_at
        ),

      endAt:
        toDateTimeLocal(
          competition?.end_at
        ),

      registrationStartAt:
        toDateTimeLocal(
          competition?.registration_start_at
        ),

      registrationEndAt:
        toDateTimeLocal(
          competition?.registration_end_at
        ),

      description:
        competition?.description ??
        "",
    });

    setError(null);
  }, [competition]);

  // ==========================================================
  // FIELD
  // ==========================================================

  function updateField(
    field: string,
    value: string
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError(null);

    // ========================================================
    // NORMALIZE
    // ========================================================

    const startAt =
      normalizeDateTimeForApi(
        form.startAt
      );

    const endAt =
      normalizeDateTimeForApi(
        form.endAt
      );

    const registrationStartAt =
      normalizeDateTimeForApi(
        form.registrationStartAt
      );

    const registrationEndAt =
      normalizeDateTimeForApi(
        form.registrationEndAt
      );

    // ========================================================
    // NAME
    // ========================================================

    if (!form.name.trim()) {
      setError(
        "Competition name is required."
      );

      return;
    }

    // ========================================================
    // START
    // ========================================================

    if (!startAt) {
      setError(
        "Competition start date is required."
      );

      return;
    }

    if (
      !isHourlyDateTime(
        startAt
      )
    ) {
      setError(
        "Competition start time must be on a 1-hour interval (for example, 6:00 PM, 7:00 PM, or 8:00 PM)."
      );

      return;
    }

    // ========================================================
    // END
    // ========================================================

    if (
      endAt &&
      !isHourlyDateTime(
        endAt
      )
    ) {
      setError(
        "Competition end time must be on a 1-hour interval (for example, 6:00 PM, 7:00 PM, or 8:00 PM)."
      );

      return;
    }

    // ========================================================
    // REGISTRATION START
    // ========================================================

    if (
      registrationStartAt &&
      !isHourlyDateTime(
        registrationStartAt
      )
    ) {
      setError(
        "Registration opening time must be on a 1-hour interval (for example, 6:00 PM, 7:00 PM, or 8:00 PM)."
      );

      return;
    }

    // ========================================================
    // REGISTRATION END
    // ========================================================

    if (
      registrationEndAt &&
      !isHourlyDateTime(
        registrationEndAt
      )
    ) {
      setError(
        "Registration closing time must be on a 1-hour interval (for example, 6:00 PM, 7:00 PM, or 8:00 PM)."
      );

      return;
    }

    // ========================================================
    // DATE ORDER
    // ========================================================

    if (
      endAt &&
      new Date(endAt).getTime() <
        new Date(startAt).getTime()
    ) {
      setError(
        "Competition end date cannot be before the start date."
      );

      return;
    }

    // ========================================================
    // REGISTRATION ORDER
    // ========================================================

    if (
      registrationStartAt &&
      registrationEndAt &&
      new Date(
        registrationEndAt
      ).getTime() <
        new Date(
          registrationStartAt
        ).getTime()
    ) {
      setError(
        "Registration closing date cannot be before the opening date."
      );

      return;
    }

    // ========================================================
    // SAVE
    // ========================================================

    try {
      setSaving(true);

      let result: Competition;

      const payload = {
        name: form.name.trim(),

        type: form.type,

        status: form.status,

        startAt,

        endAt,

        registrationStartAt,

        registrationEndAt,

        description:
          form.description.trim() ||
          null,
      };

      console.log(
        "[Competition] Saving payload:",
        payload
      );

      if (isEdit) {
        result =
          await competitionService.update(
            competition!.id,
            payload
          );
      } else {
        result =
          await competitionService.create(
            {
              name:
                form.name.trim(),

              type: form.type,

              startAt:
                startAt,

              endAt,

              registrationStartAt,

              registrationEndAt,

              description:
                form.description.trim() ||
                null,
            }
          );
      }

      await onSaved(result);
    } catch (err: any) {
      console.error(
        "[Competition] Save error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save competition."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">

      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

          <div>
            <h2 className="text-lg font-semibold !text-slate-950">
              {isEdit
                ? "Edit Competition"
                : "Create Competition"}
            </h2>

            <p className="mt-1 text-sm !text-slate-500">
              {isEdit
                ? "Update the competition details."
                : "Set up a new competition."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              rounded-lg
              p-2
              !text-slate-400
              hover:bg-slate-100
              hover:!text-slate-700
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
        >
          <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">

            {/* ERROR */}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm !text-red-700">
                {error}
              </div>
            )}

            {/* NAME */}

            <div>
              <label className="mb-1.5 block text-sm font-medium !text-slate-700">
                Competition Name
              </label>

              <Input
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="e.g. Saturday Open Play"
                autoComplete="off"
                className="
                  bg-white
                  !text-slate-950
                  placeholder:!text-slate-400
                "
              />
            </div>

            {/* TYPE / STATUS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-sm font-medium !text-slate-700">
                  Type
                </label>

                <select
                  value={form.type}
                  onChange={(event) =>
                    updateField(
                      "type",
                      event.target.value
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
                    !text-slate-950
                    outline-none
                  "
                >
                  <option value="open_play">
                    Open Play
                  </option>

                  <option value="tournament">
                    Tournament
                  </option>
                </select>
              </div>

              {isEdit && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium !text-slate-700">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value
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
                      !text-slate-950
                      outline-none
                    "
                  >
                    <option value="draft">
                      Draft
                    </option>

                    <option value="published">
                      Published
                    </option>

                    <option value="registration_open">
                      Registration Open
                    </option>

                    <option value="registration_closed">
                      Registration Closed
                    </option>

                    <option value="in_progress">
                      In Progress
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>
              )}
            </div>

            {/* COMPETITION DATES */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <DateField
                label="Start Date"
                value={form.startAt}
                onChange={(value) =>
                  updateField(
                    "startAt",
                    value
                  )
                }
              />

              <DateField
                label="End Date"
                value={form.endAt}
                onChange={(value) =>
                  updateField(
                    "endAt",
                    value
                  )
                }
              />
            </div>

            {/* REGISTRATION */}

            <div>
              <p className="mb-3 text-sm font-medium !text-slate-700">
                Registration Period
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <DateField
                  label="Registration Opens"
                  value={
                    form.registrationStartAt
                  }
                  onChange={(value) =>
                    updateField(
                      "registrationStartAt",
                      value
                    )
                  }
                />

                <DateField
                  label="Registration Closes"
                  value={
                    form.registrationEndAt
                  }
                  onChange={(value) =>
                    updateField(
                      "registrationEndAt",
                      value
                    )
                  }
                />

              </div>
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-1.5 block text-sm font-medium !text-slate-700">
                Description
              </label>

              <textarea
                value={
                  form.description
                }
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Optional competition description..."
                className="
                  w-full
                  resize-none
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-2
                  text-sm
                  !text-slate-950
                  placeholder:!text-slate-400
                  outline-none
                  focus:border-slate-400
                  focus:ring-2
                  focus:ring-slate-100
                "
              />
            </div>
          </div>

          {/* FOOTER */}

          <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="!text-slate-700"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : isEdit
                ? "Save Changes"
                : "Create Competition"}
            </Button>

          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// DATE FIELD
// ============================================================

const HOURLY_OPTIONS = [
  { value: "00:00", label: "12:00 AM" },
  { value: "01:00", label: "1:00 AM" },
  { value: "02:00", label: "2:00 AM" },
  { value: "03:00", label: "3:00 AM" },
  { value: "04:00", label: "4:00 AM" },
  { value: "05:00", label: "5:00 AM" },
  { value: "06:00", label: "6:00 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "22:00", label: "10:00 PM" },
  { value: "23:00", label: "11:00 PM" },
];

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const date = value?.split("T")[0] ?? "";

  const rawTime =
    value?.split("T")[1]?.slice(0, 5) ?? "";

  // Existing records can contain minutes such as 10:36 PM.
  // Convert the displayed value to the nearest lower hour.
  const time = HOURLY_OPTIONS.some(
    (option) => option.value === rawTime
  )
    ? rawTime
    : rawTime
      ? `${rawTime.slice(0, 2)}:00`
      : "00:00";

  function handleDateChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const newDate = event.target.value;

    if (!newDate) {
      onChange("");
      return;
    }

    onChange(`${newDate}T${time}`);
  }

  function handleTimeChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const newTime = event.target.value;

    if (!date) {
      return;
    }

    onChange(`${date}T${newTime}`);
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium !text-slate-700">
        {label}
      </label>

      <div className="grid grid-cols-[1fr_140px] gap-2">
        {/* DATE */}

        <Input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="
            h-10
            bg-white
            !text-slate-950
          "
        />

        {/* HOURLY TIME */}

        <select
          value={time}
          onChange={handleTimeChange}
          disabled={!date}
          className="
            h-10
            w-full
            rounded-lg
            border
            border-slate-200
            bg-white
            px-3
            text-sm
            !text-slate-950
            outline-none
            focus:border-slate-400
            focus:ring-2
            focus:ring-slate-100
            disabled:cursor-not-allowed
            disabled:bg-slate-50
            disabled:text-slate-400
          "
        >
          {HOURLY_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-1 text-xs text-slate-400">
        Time is available in 1-hour intervals only.
      </p>
    </div>
  );
}

// ============================================================
// // DELETE MODAL
// ============================================================

function DeleteModal({
  competition,
  onClose,
  onConfirm,
}: {
  competition: Competition;

  onClose: () => void;

  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] =
    useState(false);

  async function confirm() {
    try {
      setDeleting(true);

      await onConfirm();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
          <Trash2 className="h-5 w-5 text-red-600" />
        </div>

        <h2 className="mt-4 text-lg font-semibold !text-slate-950">
          Delete competition?
        </h2>

        <p className="mt-2 text-sm leading-6 !text-slate-500">
          This will permanently delete{" "}
          <span className="font-medium !text-slate-700">
            {competition.name}
          </span>
          . This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-2">

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleting}
            className="!text-slate-700"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={confirm}
            disabled={deleting}
            className="
              bg-red-600
              text-white
              hover:bg-red-700
            "
          >
            {deleting
              ? "Deleting..."
              : "Delete Competition"}
          </Button>

        </div>
      </div>
    </div>
  );
}

// ============================================================
// LOADING
// ============================================================

function CompetitionLoading() {
  return (
    <div className="space-y-4">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-slate-200 bg-white p-6"
        >
          <div className="h-5 w-40 rounded bg-slate-200" />

          <div className="mt-4 h-6 w-64 rounded bg-slate-200" />

          <div className="mt-4 h-4 w-80 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
  hasFilters,
  onClear,
  onCreate,
}: {
  hasFilters: boolean;

  onClear: () => void;

  onCreate: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
        {hasFilters ? (
          <Search className="h-5 w-5 text-slate-500" />
        ) : (
          <Trophy className="h-5 w-5 text-slate-500" />
        )}
      </div>

      <h2 className="mt-4 text-base font-semibold !text-slate-950">
        {hasFilters
          ? "No competitions found"
          : "No competitions yet"}
      </h2>

      <p className="mx-auto mt-1 max-w-md text-sm !text-slate-500">
        {hasFilters
          ? "Try changing your search or filters."
          : "Create your first competition to start managing divisions and Open Play sessions."}
      </p>

      <div className="mt-5">
        {hasFilters ? (
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            className="!text-slate-700"
          >
            Clear Filters
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onCreate}
            className="gap-2"
          >
            <CirclePlus className="h-4 w-4" />
            New Competition
          </Button>
        )}
      </div>
    </div>
  );
}