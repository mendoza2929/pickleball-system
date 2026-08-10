"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DollarSign,
  MapPin,
  Plus,
  RefreshCw,
  Users,
  Wrench,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ======================================================
   TYPES
====================================================== */

type ReservationStatus =
  | "Pending"
  | "Confirmed"
  | "Cancelled"
  | "Completed";

type PaymentStatus =
  | "Unpaid"
  | "Partial"
  | "Paid";

interface DashboardStats {
  reservations: number;
  revenue: number;
  activeCourts: number;
  totalCourts: number;
  players: number;
}

interface DashboardSchedule {
  id: number;
  uuid: string;
  reservation_no: string;

  reservation_date: string;

  start_time: string;
  end_time: string;

  total_hours: number;
  total_amount: number;

  reservation_status: ReservationStatus;
  payment_status: PaymentStatus;

  court_id: number;
  court_name: string;

  player_name: string | null;
}

interface DashboardCourt {
  id: number;
  name: string;

  status:
    | "Available"
    | "Reserved"
    | "Maintenance"
    | string;

  description: string;
}

interface DashboardReservation {
  id: number;
  uuid: string;
  reservation_no: string;

  reservation_date: string;

  start_time: string;
  end_time: string;

  total_hours: number;
  total_amount: number;

  reservation_status: ReservationStatus;
  payment_status: PaymentStatus;

  court_name: string;

  player_name: string | null;
}

interface DashboardData {
  stats: DashboardStats;
  schedule: DashboardSchedule[];
  courts: DashboardCourt[];
  recentReservations: DashboardReservation[];
}

interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}

/* ======================================================
   HELPERS
====================================================== */

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function formatTime(time: string) {
  if (!time) return "";

  const [hours, minutes] = time
    .split(":")
    .map(Number);

  const date = new Date();

  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(date: string) {
  if (!date) return "";

  const parsedDate = new Date(
    `${date}T00:00:00`
  );

  return parsedDate.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function getDuration(totalHours: number) {
  const hours = Number(totalHours) || 0;

  return `${hours} ${
    hours === 1 ? "hour" : "hours"
  }`;
}

/* ======================================================
   STATUS BADGE
====================================================== */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    Confirmed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    Pending:
      "border-amber-200 bg-amber-50 text-amber-700",

    Cancelled:
      "border-red-200 bg-red-50 text-red-700",

    Completed:
      "border-blue-200 bg-blue-50 text-blue-700",

    Paid:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    Partial:
      "border-amber-200 bg-amber-50 text-amber-700",

    Unpaid:
      "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <Badge
      variant="outline"
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
        styles[status] ??
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status}
    </Badge>
  );
}

/* ======================================================
   COURT STATUS
====================================================== */

function CourtStatus({
  status,
}: {
  status: string;
}) {
  if (status === "Available") {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Available
      </div>
    );
  }

  if (status === "Reserved") {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        Reserved
      </div>
    );
  }

  if (status === "Maintenance") {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-red-600">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Maintenance
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
      <span className="h-2 w-2 rounded-full bg-slate-400" />
      {status}
    </div>
  );
}

/* ======================================================
   LOADING
====================================================== */

function DashboardSkeleton() {
  return (
    <div className="space-y-6">

      <div className="space-y-3">
        <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-52 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-80 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <Card
              key={index}
              className="rounded-2xl border-slate-200"
            >
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="h-8 w-28 animate-pulse rounded bg-slate-200" />
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-2xl">
          <CardContent className="space-y-6 p-6">
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="flex gap-4"
                >
                  <div className="h-12 w-20 animate-pulse rounded-xl bg-slate-200" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-48 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="space-y-5 p-6">
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-xl bg-slate-200"
                />
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ======================================================
   DASHBOARD
====================================================== */

export default function Dashboard() {
  const router = useRouter();

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* ====================================================
     FETCH
  ==================================================== */

  const loadDashboard = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        setError(
          "Access token is required. Please log in again."
        );
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },

          credentials: "include",
          cache: "no-store",
        }
      );

      const result: DashboardResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Dashboard request failed: ${response.status}`
        );
      }

      if (!result.success || !result.data) {
        throw new Error(
          result.message ||
            "Failed to load dashboard."
        );
      }

      setDashboard(result.data);
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading the dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ====================================================
     INITIAL LOAD
  ==================================================== */

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ====================================================
     LOADING
  ==================================================== */

  if (loading) {
    return <DashboardSkeleton />;
  }

  /* ====================================================
     ERROR
  ==================================================== */

  if (error || !dashboard) {
    return (
      <div className="space-y-6">

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Dashboard
          </h1>
        </div>

        <Card className="rounded-2xl border-red-200 bg-red-50/50">
          <CardContent className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">
              <Activity className="h-5 w-5 text-red-600" />
            </div>

            <h2 className="mt-4 text-base font-semibold text-slate-900">
              Unable to load dashboard
            </h2>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              {error ||
                "Something went wrong while loading the dashboard."}
            </p>

            <Button
              onClick={() =>
                loadDashboard(true)
              }
              disabled={refreshing}
              className="mt-5 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Try again
            </Button>

          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    stats,
    schedule,
    courts,
    recentReservations,
  } = dashboard;

  /* ====================================================
     STAT CARDS
  ==================================================== */

  const statCards = [
    {
      title: "Today's Reservations",
      value: stats.reservations,
      description:
        "Bookings scheduled today",
      icon: CalendarDays,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },

    {
      title: "Today's Revenue",
      value: formatCurrency(
        stats.revenue
      ),
      description:
        "Revenue from paid bookings",
      icon: DollarSign,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },

    {
      title: "Active Courts",
      value: `${stats.activeCourts}/${stats.totalCourts}`,
      description:
        "Courts currently available",
      icon: MapPin,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },

    {
      title: "Players",
      value: stats.players,
      description:
        "Players booked today",
      icon: Users,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  /* ====================================================
     RENDER
  ==================================================== */

  return (
    <div className="min-h-full space-y-7 pb-10">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Admin</span>

            <span>/</span>

            <span className="text-slate-700">
              Dashboard
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-[34px]">
            Dashboard
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            Overview of your pickleball facility.
          </p>
        </div>

        <div className="flex items-center gap-2">

          <Button
            variant="outline"
            onClick={() =>
              loadDashboard(true)
            }
            disabled={refreshing}
            className="h-10 rounded-xl border-slate-200 bg-white px-4 text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </Button>

          <Button
            onClick={() =>
              router.push(
                "/admin/reservations"
              )
            }
            className="h-10 rounded-xl bg-[#b7ff00] px-4 font-semibold text-[#06131f] shadow-sm hover:bg-[#c5ff33]"
          >
            <Plus className="mr-2 h-4 w-4" />

            New Reservation
          </Button>

        </div>
      </section>

      {/* =================================================
          STATS
      ================================================= */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.title}
              className="group rounded-2xl border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardContent className="p-5">

                <div className="flex items-start justify-between">

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${stat.iconColor}`}
                    />
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-500" />

                </div>

                <div className="mt-5">

                  <p className="text-xs font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <p className="mt-1 text-[27px] font-semibold tracking-[-0.04em] text-slate-950">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {stat.description}
                  </p>

                </div>
              </CardContent>
            </Card>
          );
        })}

      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">

        {/* =================================================
            TODAY'S SCHEDULE
        ================================================= */}

        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">

          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-100 px-6 py-5">

            <div>

              <div className="flex items-center gap-2">

                <CardTitle className="text-base font-semibold text-slate-950">
                  Today's Schedule
                </CardTitle>

                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  {schedule.length}
                </span>

              </div>

              <p className="mt-1 text-xs text-slate-500">
                Today's court reservations.
              </p>

            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(
                  "/admin/reservations"
                )
              }
              className="h-8 gap-1 rounded-lg px-2 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              View all

              <ChevronRight className="h-3.5 w-3.5" />
            </Button>

          </CardHeader>

          <CardContent className="p-0">

            {schedule.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <CalendarDays className="h-5 w-5 text-slate-400" />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-900">
                  No reservations today
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Your schedule is currently clear.
                </p>

              </div>
            ) : (

              <div className="divide-y divide-slate-100">

                {schedule.map(
                  (item, index) => (
                    <div
                      key={item.id}
                      className="group flex gap-4 px-6 py-5 transition-colors hover:bg-slate-50/70"
                    >

                      {/* TIME */}

                      <div className="w-[78px] shrink-0">

                        <p className="text-sm font-semibold text-slate-950">
                          {formatTime(
                            item.start_time
                          )}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          {formatTime(
                            item.end_time
                          )}
                        </p>

                      </div>

                      {/* TIMELINE */}

                      <div className="relative flex w-5 shrink-0 justify-center">

                        {index !==
                          schedule.length -
                            1 && (
                          <span className="absolute top-5 h-full w-px bg-slate-200" />
                        )}

                        <span
                          className={`relative z-10 mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${
                            item.reservation_status ===
                            "Confirmed"
                              ? "bg-emerald-500"
                              : item.reservation_status ===
                                "Pending"
                              ? "bg-amber-500"
                              : "bg-slate-300"
                          }`}
                        />

                      </div>

                      {/* CONTENT */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="text-sm font-semibold text-slate-900">
                            {item.court_name}
                          </p>

                          <StatusBadge
                            status={
                              item.reservation_status
                            }
                          />

                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">

                          <span>
                            {item.player_name ??
                              "Guest"}
                          </span>

                          <span className="text-slate-300">
                            •
                          </span>

                          <span>
                            {getDuration(
                              Number(
                                item.total_hours
                              )
                            )}
                          </span>

                        </div>

                      </div>

                      {/* AMOUNT */}

                      <div className="hidden shrink-0 text-right sm:block">

                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(
                            Number(
                              item.total_amount
                            )
                          )}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          {item.payment_status}
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>

            )}

          </CardContent>
        </Card>

        {/* =================================================
            COURTS
        ================================================= */}

        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">

          <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-slate-100 px-6 py-5">

            <div>

              <CardTitle className="text-base font-semibold text-slate-950">
                Court Status
              </CardTitle>

              <p className="mt-1 text-xs text-slate-500">
                Current availability.
              </p>

            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(
                  "/admin/courts"
                )
              }
              className="h-8 gap-1 rounded-lg px-2 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              Manage

              <ChevronRight className="h-3.5 w-3.5" />
            </Button>

          </CardHeader>

          <CardContent className="p-4">

            {courts.length === 0 ? (
              <div className="py-12 text-center">

                <MapPin className="mx-auto h-6 w-6 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-900">
                  No courts found
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Add courts to see availability.
                </p>

              </div>
            ) : (

              <div className="space-y-2">

                {courts.map(
                  (court) => (
                    <div
                      key={court.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:border-slate-200 hover:bg-white"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex min-w-0 gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-100">
                            <MapPin className="h-4 w-4 text-slate-500" />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-slate-900">
                              {court.name}
                            </p>

                            <p className="mt-1 truncate text-[11px] text-slate-400">
                              {court.description ||
                                "Pickleball court"}
                            </p>

                          </div>

                        </div>

                        <CourtStatus
                          status={
                            court.status
                          }
                        />

                      </div>

                      {court.status ===
                        "Maintenance" && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-600">

                          <Wrench className="h-3.5 w-3.5" />

                          Court unavailable

                        </div>
                      )}

                    </div>
                  )
                )}

              </div>

            )}

          </CardContent>
        </Card>

      </section>

      {/* =================================================
          RECENT RESERVATIONS
      ================================================= */}

      <Card className="rounded-2xl border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">

        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-100 px-6 py-5">

          <div>

            <div className="flex items-center gap-2">

              <CardTitle className="text-base font-semibold text-slate-950">
                Recent Reservations
              </CardTitle>

              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                {recentReservations.length}
              </span>

            </div>

            <p className="mt-1 text-xs text-slate-500">
              Latest booking activity.
            </p>

          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(
                "/admin/reservations"
              )
            }
            className="h-8 gap-1 rounded-lg px-2 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            View all

            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

        </CardHeader>

        <CardContent className="p-0">

          {recentReservations.length ===
          0 ? (
            <div className="py-14 text-center">

              <CheckCircle2 className="mx-auto h-6 w-6 text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-900">
                No reservations yet
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Recent booking activity will appear here.
              </p>

            </div>
          ) : (

            <>
              {/* DESKTOP */}

              <div className="hidden overflow-x-auto md:block">

                <table className="w-full">

                  <thead>

                    <tr className="border-b border-slate-100 bg-slate-50/50">

                      <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Reservation
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Customer
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Court
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Schedule
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Status
                      </th>

                      <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Amount
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {recentReservations.map(
                      (reservation) => (
                        <tr
                          key={
                            reservation.id
                          }
                          className="group border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                        >

                          <td className="px-6 py-4">

                            <p className="text-sm font-semibold text-slate-900">
                              {
                                reservation.reservation_no
                              }
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              #
                              {
                                reservation.id
                              }
                            </p>

                          </td>

                          <td className="px-4 py-4">

                            <div className="flex items-center gap-2.5">

                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                                {(
                                  reservation.player_name ??
                                  "G"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span className="text-sm text-slate-700">
                                {reservation.player_name ??
                                  "Guest"}
                              </span>

                            </div>

                          </td>

                          <td className="px-4 py-4">

                            <div className="flex items-center gap-2 text-sm text-slate-600">

                              <MapPin className="h-3.5 w-3.5 text-slate-400" />

                              {
                                reservation.court_name
                              }

                            </div>

                          </td>

                          <td className="px-4 py-4">

                            <p className="text-sm text-slate-700">
                              {formatDate(
                                reservation.reservation_date
                              )}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {formatTime(
                                reservation.start_time
                              )}{" "}
                              –
                              {" "}
                              {formatTime(
                                reservation.end_time
                              )}
                            </p>

                          </td>

                          <td className="px-4 py-4">

                            <StatusBadge
                              status={
                                reservation.reservation_status
                              }
                            />

                          </td>

                          <td className="px-6 py-4 text-right">

                            <p className="text-sm font-semibold text-slate-900">
                              {formatCurrency(
                                Number(
                                  reservation.total_amount
                                )
                              )}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {
                                reservation.payment_status
                              }
                            </p>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

              {/* MOBILE */}

              <div className="space-y-2 p-4 md:hidden">

                {recentReservations.map(
                  (reservation) => (
                    <div
                      key={
                        reservation.id
                      }
                      className="rounded-xl border border-slate-200 p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-slate-900">
                            {
                              reservation.reservation_no
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {reservation.player_name ??
                              "Guest"}
                          </p>

                        </div>

                        <StatusBadge
                          status={
                            reservation.reservation_status
                          }
                        />

                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <div>

                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Court
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-700">
                            {
                              reservation.court_name
                            }
                          </p>

                        </div>

                        <div>

                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Schedule
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-700">
                            {formatTime(
                              reservation.start_time
                            )}
                          </p>

                        </div>

                        <div>

                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Date
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-700">
                            {formatDate(
                              reservation.reservation_date
                            )}
                          </p>

                        </div>

                        <div>

                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Amount
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-900">
                            {formatCurrency(
                              Number(
                                reservation.total_amount
                              )
                            )}
                          </p>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            </>

          )}

        </CardContent>

      </Card>

      {/* =================================================
          FOOTER STATUS
      ================================================= */}

      <div className="flex items-center justify-between border-t border-slate-200 pt-5">

        <div className="flex items-center gap-2 text-xs text-slate-400">

          <span className="h-2 w-2 rounded-full bg-emerald-500" />

          Dashboard connected to live data

        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">

          <Clock3 className="h-3.5 w-3.5" />

          Updated just now

        </div>

      </div>

    </div>
  );
}