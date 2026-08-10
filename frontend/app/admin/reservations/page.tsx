"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  DollarSign,
  Eye,
  Filter,
  Mail,
  MapPin,
  MoreHorizontal,
  Search,
  User,
  X,
} from "lucide-react";
import {
  getCourts,
  type Court,
} from "@/lib/api/courts";
import {
  createWalkInReservation,
  getReservations,
  updateReservation,
} from "@/lib/api/reservations";
import WalkInReservationModal from "./WalkInReservationModal";

// ============================================================
// TYPES
// ============================================================

type ReservationStatus =
  | "Pending"
  | "Confirmed"
  | "Cancelled"
  | "Completed";

type PaymentStatus =
  | "Unpaid"
  | "Partial"
  | "Paid";

interface Reservation {
  id: number;
  uuid: string;
  reservation_no: string;

  user_id?: number | null;

  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;

  player_name?: string | null;

  court_id: number;
  court_name?: string | null;

  reservation_date: string;
  start_time: string;
  end_time: string;

  total_hours: number;
  hourly_rate: number;
  total_amount: number;

  reservation_status: ReservationStatus;
  payment_status: PaymentStatus;
  payment_method?: string | null;
  proof_url?: string | null;
  remarks?: string | null;

  created_at?: string;
  updated_at?: string;
}

// ============================================================
// HELPERS
// ============================================================

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string) {
  if (!value) return "-";

  const parts = value.split(":");

  if (parts.length < 2) {
    return value;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return value;
  }

  const date = new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0
  );

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function getProofUrl(
  proofUrl?: string | null
): string | null {
  if (!proofUrl) {
    return null;
  }

  // Already a complete URL
  if (
    proofUrl.startsWith("http://") ||
    proofUrl.startsWith("https://")
  ) {
    return proofUrl;
  }

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:5000";

  return `${backendUrl.replace(/\/$/, "")}${
    proofUrl.startsWith("/")
      ? proofUrl
      : `/${proofUrl}`
  }`;
}
// ============================================================
// STATUS BADGE
// ============================================================

function ReservationStatusBadge({
  status,
}: {
  status: ReservationStatus;
}) {
  const styles: Record<
    ReservationStatus,
    string
  > = {
    Pending:
      "border-amber-200 bg-amber-50 text-amber-700",

    Confirmed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    Cancelled:
      "border-red-200 bg-red-50 text-red-700",

    Completed:
      "border-slate-200 bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-2.5
        py-1
        text-[11px]
        font-medium
        ${styles[status]}
      `}
    >
      <span
        className="
          mr-1.5
          h-1.5
          w-1.5
          rounded-full
          bg-current
        "
      />

      {status}
    </span>
  );
}

// ============================================================
// PAYMENT BADGE
// ============================================================

function PaymentStatusBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  const styles: Record<
    PaymentStatus,
    string
  > = {
    Unpaid: "text-amber-600",
    Partial: "text-blue-600",
    Paid: "text-emerald-600",
  };

  return (
    <span
      className={`
        text-sm
        font-medium
        ${styles[status]}
      `}
    >
      {status}
    </span>
  );
}

// ============================================================
// PAGE
// ============================================================



export default function ReservationsPage() {
  const [
    reservations,
    setReservations,
  ] = useState<Reservation[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    selectedReservation,
    setSelectedReservation,
  ] = useState<Reservation | null>(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    "All" | ReservationStatus
  >("All");

  const [
    dateFilter,
    setDateFilter,
  ] = useState("");

  const [
    showFilters,
    setShowFilters,
  ] = useState(false);
  const [courts, setCourts] =
    useState<Court[]>([]);
  const [showWalkIn, setShowWalkIn] = useState(false);

  const [editReservationStatus, setEditReservationStatus] =
  useState<ReservationStatus>("Pending");

  const [editPaymentStatus, setEditPaymentStatus] =
    useState<PaymentStatus>("Unpaid");

  const [savingReservation, setSavingReservation] =
    useState(false);
  const proofUrl = getProofUrl(
    selectedReservation?.proof_url
  );
  // ==========================================================
  // LOAD RESERVATIONS
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadReservations = async () => {
      try {
        setLoading(true);

        const data = await getReservations();

        if (mounted) {
          setReservations(data);
        }
      } catch (error) {
        console.error(
          "Failed to load reservations:",
          error
        );

        if (mounted) {
          setReservations([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadReservations();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const loadCourts = async () => {
      try {
        const data = await getCourts();

        setCourts(data);
      } catch (error) {
        console.error(
          "Failed to load courts:",
          error
        );

        setCourts([]);
      }
    };

    loadCourts();
  }, []);

  const [walkInForm, setWalkInForm] = useState({
      guest_name: "",
      guest_phone: "",
      court_id: "",
      reservation_date: "",
      start_time: "",
      end_time: "",
      remarks: "",
    });


  const [savingWalkIn, setSavingWalkIn] =
    useState(false);

  const [walkInError, setWalkInError] =
    useState("");

  const handleCreateWalkIn = async () => {
  setWalkInError("");

  if (!walkInForm.guest_name.trim()) {
    setWalkInError("Customer name is required.");
    return;
  }

  if (!walkInForm.guest_phone.trim()) {
    setWalkInError("Phone number is required.");
    return;
  }

  if (!walkInForm.court_id) {
    setWalkInError("Please select a court.");
    return;
  }

  if (!walkInForm.reservation_date) {
    setWalkInError("Please select a date.");
    return;
  }

  if (!walkInForm.start_time) {
    setWalkInError("Please select a start time.");
    return;
  }

  if (!walkInForm.end_time) {
    setWalkInError("Please select an end time.");
    return;
  }

  if (
    walkInForm.end_time <=
    walkInForm.start_time
  ) {
    setWalkInError(
      "End time must be greater than start time."
    );
    return;
  }

  try {
    setSavingWalkIn(true);

    const reservation =
      await createWalkInReservation({
        court_id: Number(
          walkInForm.court_id
        ),

        reservation_date:
          walkInForm.reservation_date,

        start_time:
          walkInForm.start_time,

        end_time:
          walkInForm.end_time,

        guest_name:
          walkInForm.guest_name.trim(),

        guest_phone:
          walkInForm.guest_phone.trim(),

        remarks:
          walkInForm.remarks.trim() ||
          undefined,
      });

    // Add the new reservation to the table
    setReservations((current) => [
      reservation,
      ...current,
    ]);

    // Reset form
    setWalkInForm({
      guest_name: "",
      guest_phone: "",
      court_id: "",
      reservation_date: "",
      start_time: "",
      end_time: "",
      remarks: "",
    });

    setShowWalkIn(false);
  } catch (error: any) {
    console.error(
      "Failed to create walk-in reservation:",
      error
    );

    setWalkInError(
      error?.response?.data?.message ||
        "Failed to create walk-in reservation."
    );
  } finally {
    setSavingWalkIn(false);
  }
};

const handleCloseWalkIn = () => {
  if (savingWalkIn) return;

  setShowWalkIn(false);

  setWalkInError("");

  setWalkInForm({
    guest_name: "",
    guest_phone: "",
    court_id: "",
    reservation_date: "",
    start_time: "",
    end_time: "",
    remarks: "",
  });
};

  // ==========================================================
  // FILTERED + SORTED RESERVATIONS
  // ==========================================================
      
  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = reservations.filter((reservation) => {
      const customer =
        reservation.player_name ||
        reservation.guest_name ||
        "";

      const email =
        reservation.guest_email ||
        "";

      const reservationNo =
        reservation.reservation_no ||
        "";

      const court =
        reservation.court_name ||
        `Court ${reservation.court_id}`;

      const matchesSearch =
        !query ||
        reservationNo.toLowerCase().includes(query) ||
        customer.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        court.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        reservation.reservation_status === statusFilter;

      let matchesDate = true;

      if (dateFilter) {
        const reservationDate = new Date(
          reservation.reservation_date
        );

        const selectedDate = new Date(
          `${dateFilter}T00:00:00`
        );

        matchesDate =
          reservationDate.toDateString() ===
          selectedDate.toDateString();
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate
      );
    });

    

    // ----------------------------------------------------------
    // SORT BY NEAREST UPCOMING SCHEDULE
    // ----------------------------------------------------------
    


    const now = new Date().getTime();

    return filtered.sort((a, b) => {
      const aDate = a.reservation_date.slice(0, 10);
      const bDate = b.reservation_date.slice(0, 10);

      const aTime = a.start_time.slice(0, 8);
      const bTime = b.start_time.slice(0, 8);

      const aSchedule = new Date(
        `${aDate}T${aTime}`
      ).getTime();

      const bSchedule = new Date(
        `${bDate}T${bTime}`
      ).getTime();

      const aIsPast = aSchedule < now;
      const bIsPast = bSchedule < now;

      // Upcoming reservations first
      if (aIsPast !== bIsPast) {
        return aIsPast ? 1 : -1;
      }

      // Sort by nearest date/time
      return aSchedule - bSchedule;
    });
  }, [
    reservations,
    search,
    statusFilter,
    dateFilter,
  ]);

  const handleSaveReservation = async () => {
    if (!selectedReservation) return;

    try {
      setSavingReservation(true);

      const updatedReservation =
        await updateReservation(
          selectedReservation.id,
          {
            reservation_status:
              editReservationStatus,
            payment_status:
              editPaymentStatus,
          }
        );

      setReservations((current) =>
        current.map((reservation) =>
          reservation.id === updatedReservation.id
            ? updatedReservation
            : reservation
        )
      );

      setSelectedReservation(
        updatedReservation
      );
    } catch (error) {
      console.error(
        "Failed to update reservation:",
        error
      );
    } finally {
      setSavingReservation(false);
    }
  };

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary = useMemo(() => {
    const total = reservations.length;

    const pending =
      reservations.filter(
        (item) =>
          item.reservation_status ===
          "Pending"
      ).length;

    const confirmed =
      reservations.filter(
        (item) =>
          item.reservation_status ===
          "Confirmed"
      ).length;

    const revenue =
      reservations
        .filter(
          (item) =>
            item.reservation_status !==
            "Cancelled"
        )
        .reduce(
          (total, item) =>
            total +
            Number(item.total_amount || 0),
          0
        );

    return {
      total,
      pending,
      confirmed,
      revenue,
    };
  }, [reservations]);

  // ==========================================================
  // FILTER HELPERS
  // ==========================================================

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setDateFilter("");
  };

  const hasFilters =
    search !== "" ||
    statusFilter !== "All" ||
    dateFilter !== "";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-full bg-slate-50">
      <div className="space-y-6 p-1 sm:p-2 lg:p-3">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

     <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
            <span>Admin</span>

            <ChevronRight className="h-3 w-3" />

            <span className="font-medium text-slate-600">
              Reservations
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Reservations
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and review all court reservations.
          </p>
        </div>

        {/* Walk-in Reservation */}
            <button
        type="button"
        onClick={() => {
          setWalkInError("");
          setShowWalkIn(true);
        }}
        className="
          inline-flex
          h-11
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-slate-900
          px-5
          text-sm
          font-medium
          text-white
          transition
          hover:bg-slate-800
        "
      >
        <span className="text-lg leading-none">
          +
        </span>

        Walk-in Reservation
      </button>
      </div>

        {/* ================================================== */}
        {/* SUMMARY */}
        {/* ================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Total */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Total Reservations
                </p>

                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {summary.total}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <CalendarDays className="h-5 w-5 text-slate-600" />
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              All reservations
            </p>
          </div>

          {/* Pending */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Pending
                </p>

                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {summary.pending}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <Clock3 className="h-5 w-5 text-amber-600" />
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Awaiting confirmation
            </p>
          </div>

          {/* Confirmed */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Confirmed
                </p>

                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {summary.confirmed}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <CalendarDays className="h-5 w-5 text-emerald-600" />
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Active reservations
            </p>
          </div>

          {/* Revenue */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Reservation Value
                </p>

                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatCurrency(
                    summary.revenue
                  )}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b7ff00]/20">
                <DollarSign className="h-5 w-5 text-slate-900" />
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Excluding cancelled reservations
            </p>
          </div>

        </div>

        {/* ================================================== */}
        {/* SEARCH / FILTERS */}
        {/* ================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 xl:flex-row">

            {/* Search */}

            <div className="relative flex-1">

              <Search
                className="
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search reservation, customer, email or court..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  pl-10
                  pr-4
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-[#9bd900]
                  focus:ring-2
                  focus:ring-[#b7ff00]/20
                "
              />

            </div>

            {/* Status */}

            <div className="relative">

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "All"
                      | ReservationStatus
                  )
                }
                className="
                  h-11
                  min-w-[150px]
                  appearance-none
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  pl-4
                  pr-10
                  text-sm
                  text-slate-700
                  outline-none
                  focus:border-[#9bd900]
                  focus:ring-2
                  focus:ring-[#b7ff00]/20
                "
              >
                <option value="All">
                  All Status
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Confirmed">
                  Confirmed
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>

                <option value="Completed">
                  Completed
                </option>
              </select>

              <ChevronDown
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-slate-400
                "
              />

            </div>

            {/* Date */}

            <div className="relative">

              <CalendarDays
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

              <input
                type="date"
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(
                    event.target.value
                  )
                }
                className="
                  h-11
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  pl-10
                  pr-3
                  text-sm
                  text-slate-700
                  outline-none
                  focus:border-[#9bd900]
                  focus:ring-2
                  focus:ring-[#b7ff00]/20
                "
              />

            </div>

            {/* Filter */}

            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  !showFilters
                )
              }
              className={`
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                px-4
                text-sm
                font-medium
                transition
                ${
                  showFilters
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }
              `}
            >
              <Filter className="h-4 w-4" />

              Filters
            </button>

          </div>

          {/* Active filters */}

          {showFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">

              <span className="text-xs font-medium text-slate-400">
                Active filters:
              </span>

              {statusFilter !== "All" && (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">

                  Status: {statusFilter}

                  <button
                    type="button"
                    onClick={() =>
                      setStatusFilter(
                        "All"
                      )
                    }
                    className="hover:text-slate-900"
                  >
                    <X className="h-3 w-3" />
                  </button>

                </span>
              )}

              {dateFilter && (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">

                  Date: {formatDate(
                    dateFilter
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setDateFilter("")
                    }
                    className="hover:text-slate-900"
                  >
                    <X className="h-3 w-3" />
                  </button>

                </span>
              )}

              {search && (
                <span className="inline-flex max-w-[260px] items-center gap-2 truncate rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">

                  <span className="truncate">
                    Search: {search}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="shrink-0 hover:text-slate-900"
                  >
                    <X className="h-3 w-3" />
                  </button>

                </span>
              )}

              {hasFilters && (
                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="
                    ml-auto
                    text-xs
                    font-medium
                    text-slate-500
                    hover:text-slate-900
                  "
                >
                  Clear all
                </button>
              )}

            </div>
          )}

        </div>

        {/* ================================================== */}
        {/* TABLE */}
        {/* ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Table header */}

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                All Reservations
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                {filteredReservations.length}{" "}
                reservation
                {filteredReservations.length !==
                1
                  ? "s"
                  : ""}
              </p>
            </div>

            {hasFilters && (
              <p className="text-xs text-slate-400">
                Filtered results
              </p>
            )}

          </div>

          {/* Loading */}

          {loading && (
            <div className="flex min-h-[320px] items-center justify-center">

              <div className="flex flex-col items-center gap-3">

                <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#b7ff00]" />

                <p className="text-sm text-slate-400">
                  Loading reservations...
                </p>

              </div>

            </div>
          )}

          {/* Empty */}

          {!loading &&
            filteredReservations.length ===
              0 && (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <CalendarDays className="h-6 w-6 text-slate-400" />
                </div>

                <h3 className="text-sm font-semibold text-slate-900">
                  No reservations found
                </h3>

                <p className="mt-1 max-w-sm text-xs text-slate-400">
                  Try adjusting your search or filters.
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                    className="
                      mt-4
                      text-xs
                      font-medium
                      text-slate-900
                      underline
                      underline-offset-4
                    "
                  >
                    Clear filters
                  </button>
                )}

              </div>
            )}

          {/* Desktop table */}

          {!loading &&
            filteredReservations.length >
              0 && (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1000px]">

                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">

                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Reservation
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Customer
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Court
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Schedule
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Payment
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Amount
                      </th>

                      <th className="w-12 px-3 py-3" />

                    </tr>
                  </thead>

                  <tbody>

                    {filteredReservations.map(
                      (reservation) => {
                        const customer =
                          reservation.player_name ||
                          reservation.guest_name ||
                          "Guest";

                        return (
                          <tr
                            key={
                              reservation.id
                            }
                            className="
                              group
                              border-b
                              border-slate-100
                              last:border-0
                              hover:bg-slate-50/70
                            "
                          >

                            {/* Reservation */}

                            <td className="px-5 py-4">

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedReservation(reservation);

                                  setEditReservationStatus(
                                    reservation.reservation_status
                                  );

                                  setEditPaymentStatus(
                                    reservation.payment_status
                                  );
                                }}
                                className="
                                  text-left
                                  text-sm
                                  font-semibold
                                  text-slate-900
                                  hover:text-slate-600
                                "
                              >
                                {
                                  reservation.reservation_no
                                }
                              </button>

                              <p className="mt-1 text-[11px] text-slate-400">
                                ID #
                                {
                                  reservation.id
                                }
                              </p>

                            </td>

                            {/* Customer */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                                  {customer
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-medium text-slate-900">
                                    {customer}
                                  </p>

                                  {reservation.guest_email && (
                                    <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-400">
                                      {
                                        reservation.guest_email
                                      }
                                    </p>
                                  )}

                                </div>

                              </div>

                            </td>

                            {/* Court */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-2">

                                <MapPin className="h-4 w-4 text-slate-400" />

                                <span className="text-sm font-medium text-slate-700">
                                  {
                                    reservation.court_name ||
                                    `Court ${reservation.court_id}`
                                  }
                                </span>

                              </div>

                            </td>

                            {/* Schedule */}

                            <td className="px-5 py-4">

                              <p className="text-sm font-medium text-slate-800">
                                {formatDate(
                                  reservation.reservation_date
                                )}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {formatTime(
                                  reservation.start_time
                                )}

                                {" – "}

                                {formatTime(
                                  reservation.end_time
                                )}
                              </p>

                            </td>

                            {/* Status */}

                            <td className="px-5 py-4">

                              <ReservationStatusBadge
                                status={
                                  reservation.reservation_status
                                }
                              />

                            </td>

                            {/* Payment */}

                            <td className="px-5 py-4">

                              <PaymentStatusBadge
                                status={
                                  reservation.payment_status
                                }
                              />

                            </td>

                            {/* Amount */}

                            <td className="px-5 py-4 text-right">

                              <span className="text-sm font-semibold text-slate-900">
                                {formatCurrency(
                                  reservation.total_amount
                                )}
                              </span>

                            </td>

                            {/* Actions */}

                            <td className="px-3 py-4">

                             <button
                                type="button"
                                onClick={() => {
                                  setSelectedReservation(reservation);

                                  setEditReservationStatus(
                                    reservation.reservation_status
                                  );

                                  setEditPaymentStatus(
                                    reservation.payment_status
                                  );
                                }}
                                className="
                                  flex
                                  h-8
                                  w-8
                                  items-center
                                  justify-center
                                  rounded-lg
                                  text-slate-400
                                  transition
                                  hover:bg-slate-100
                                  hover:text-slate-700
                                "
                                aria-label="View reservation"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            )}

        </div>

      </div>

      {/* ====================================================== */}
      {/* RESERVATION DETAILS DRAWER */}
      {/* ====================================================== */}

      {selectedReservation && (
        <>
          {/* Overlay */}

          <button
            type="button"
            aria-label="Close reservation details"
            onClick={() =>
              setSelectedReservation(
                null
              )
            }
            className="
              fixed
              inset-0
              z-[60]
              cursor-default
              bg-slate-950/30
              backdrop-blur-[2px]
            "
          />

          {/* Drawer */}

          <aside
            className="
              fixed
              inset-y-0
              right-0
              z-[70]
              flex
              w-full
              max-w-[460px]
              flex-col
              bg-white
              shadow-2xl
            "
          >

            {/* Drawer header */}

            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Reservation Details
                </p>

                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {
                    selectedReservation.reservation_no
                  }
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedReservation(
                    null
                  )
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-700
                "
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* Drawer content */}

            <div className="flex-1 overflow-y-auto px-6 py-6">

              {/* Status / amount */}

              <div className="flex items-center justify-between">

               <section className="mt-7">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Reservation Status
                  </p>

                  <select
                    value={editReservationStatus}
                    onChange={(event) =>
                      setEditReservationStatus(
                        event.target.value as ReservationStatus
                      )
                    }
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      text-sm
                      font-medium
                      text-slate-700
                      outline-none
                      transition
                      focus:border-[#9bd900]
                      focus:ring-2
                      focus:ring-[#b7ff00]/20
                    "
                  >
                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Confirmed">
                      Confirmed
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>

                    <option value="Completed">
                      Completed
                    </option>
                  </select>
                </section>

                <span className="text-lg font-semibold text-slate-900">
                  {formatCurrency(
                    selectedReservation.total_amount
                  )}
                </span>

              </div>

              {/* Customer */}

              <section className="mt-7">

                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Customer
                </p>

                <div className="rounded-2xl border border-slate-200 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-slate-900">
                        {
                          selectedReservation.player_name ||
                          selectedReservation.guest_name ||
                          "Guest"
                        }
                      </p>

                      {selectedReservation.guest_email && (
                        <div className="mt-1 flex items-center gap-1.5">

                          <Mail className="h-3.5 w-3.5 text-slate-400" />

                          <span className="text-xs text-slate-400">
                            {
                              selectedReservation.guest_email
                            }
                          </span>

                        </div>
                      )}

                    </div>

                  </div>

                  {selectedReservation.guest_phone && (
                    <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                      {
                        selectedReservation.guest_phone
                      }
                    </p>
                  )}

                </div>

              </section>

              {/* Court / Schedule */}

              <section className="mt-6">

                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Court & Schedule
                </p>

                <div className="rounded-2xl border border-slate-200 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                      <MapPin className="h-5 w-5 text-slate-600" />
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-slate-900">
                        {
                          selectedReservation.court_name ||
                          `Court ${selectedReservation.court_id}`
                        }
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Pickleball Court
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">

                    <div>

                      <p className="text-xs text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {formatDate(
                          selectedReservation.reservation_date
                        )}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-slate-400">
                        Time
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">

                        {formatTime(
                          selectedReservation.start_time
                        )}

                        {" – "}

                        {formatTime(
                          selectedReservation.end_time
                        )}

                      </p>

                    </div>

                  </div>

                </div>

              </section>

              {/* Payment */}

              <section className="mt-6">

                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Payment
                </p>

                <div className="rounded-2xl border border-slate-200 p-4">

                 <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Payment status
                    </span>

                    <select
                      value={editPaymentStatus}
                      onChange={(event) =>
                        setEditPaymentStatus(
                          event.target.value as PaymentStatus
                        )
                      }
                      className="
                        h-10
                        min-w-[130px]
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        px-3
                        text-sm
                        font-medium
                        text-slate-700
                        outline-none
                        focus:border-[#9bd900]
                        focus:ring-2
                        focus:ring-[#b7ff00]/20
                      "
                    >
                      <option value="Unpaid">
                        Unpaid
                      </option>

                      <option value="Partial">
                        Partial
                      </option>

                      <option value="Paid">
                        Paid
                      </option>
                    </select>
                  </div>

                  <div className="mt-3 flex items-center justify-between">

                    <span className="text-sm text-slate-500">
                      Hourly rate
                    </span>

                    <span className="text-sm font-medium text-slate-800">
                      {formatCurrency(
                        selectedReservation.hourly_rate
                      )}
                    </span>

                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">

                    <span className="text-sm font-medium text-slate-700">
                      Total
                    </span>

                    <span className="text-base font-semibold text-slate-900">
                      {formatCurrency(
                        selectedReservation.total_amount
                      )}
                    </span>

                  </div>

                </div>

              </section>

{/* =====================================================
    PROOF OF PAYMENT
===================================================== */}

{(() => {
  const proofUrl = getProofUrl(
    selectedReservation?.proof_url
  );

  if (!proofUrl) {
    return null;
  }

  return (
    <section className="mt-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Proof of Payment
      </p>

      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {/* Image Preview */}
        <div className="flex min-h-[280px] items-center justify-center bg-slate-100 p-4">
          <img
            key={proofUrl}
            src={proofUrl}
            alt="Payment proof"
            className="block max-h-[420px] max-w-full rounded-xl object-contain"
            onError={(event) => {
              console.error(
                "Failed to load payment proof:",
                proofUrl
              );
            }}
          />
        </div>

        {/* Information */}
        <div className="border-t border-slate-200 bg-white px-4 py-4">
          <p className="text-sm font-semibold text-slate-800">
            Payment proof submitted
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Review the payment proof before confirming.
          </p>

          <a
            href={proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Open full image
          </a>
        </div>
      </div>
    </section>
  );
})()}
              {/* Remarks */}

              {selectedReservation.remarks && (
                <section className="mt-6">

                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Remarks
                  </p>

                  <div className="rounded-2xl bg-slate-50 p-4">

                    <p className="text-sm leading-6 text-slate-600">
                      {
                        selectedReservation.remarks
                      }
                    </p>

                  </div>

                </section>
              )}

            </div>

            {/* Footer */}

           <div className="flex gap-3 border-t border-slate-200 bg-white px-6 py-4">
  <button
    type="button"
    onClick={() =>
      setSelectedReservation(null)
    }
    disabled={savingReservation}
    className="
      h-11
      flex-1
      rounded-xl
      border
      border-slate-200
      bg-white
      text-sm
      font-medium
      text-slate-700
      transition
      hover:bg-slate-50
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
  >
    Cancel
  </button>

  <button
    type="button"
    onClick={handleSaveReservation}
    disabled={savingReservation}
    className="
      h-11
      flex-1
      rounded-xl
      bg-slate-900
      text-sm
      font-medium
      text-white
      transition
      hover:bg-slate-800
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
  >
    {savingReservation
      ? "Saving..."
      : "Save Changes"}
  </button>
</div>
          </aside>
        </>
      )}

    <WalkInReservationModal
        open={showWalkIn}
        onClose={() => setShowWalkIn(false)}
        onCreated={async () => {
          try {
            const data = await getReservations();
            setReservations(data);
          } catch (error) {
            console.error(
              "Failed to refresh reservations:",
              error
            );
          }
        }}
      />
    </div>
    
  );

  
}