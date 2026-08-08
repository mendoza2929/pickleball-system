"use client";

import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  DollarSign,
  MapPin,
  Plus,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


/* ====================================================== */
/* MOCK DATA */
/* ====================================================== */

const stats = [
  {
    title: "Reservations",
    value: "24",
    change: "+12.5%",
    description: "vs. last week",
    icon: CalendarDays,
  },
  {
    title: "Revenue",
    value: "₱12,450",
    change: "+8.2%",
    description: "vs. last week",
    icon: DollarSign,
  },
  {
    title: "Active Courts",
    value: "6 / 8",
    change: "75%",
    description: "currently active",
    icon: MapPin,
  },
  {
    title: "Players",
    value: "18",
    change: "+4",
    description: "booked today",
    icon: Users,
  },
];


const schedule = [
  {
    time: "09:00",
    period: "AM",
    court: "Court 1",
    customer: "John Doe",
    duration: "1 hour",
    status: "Confirmed",
  },
  {
    time: "10:00",
    period: "AM",
    court: "Court 2",
    customer: "Jane Smith",
    duration: "2 hours",
    status: "Confirmed",
  },
  {
    time: "11:00",
    period: "AM",
    court: "Court 3",
    customer: "Michael Cruz",
    duration: "1 hour",
    status: "Pending",
  },
  {
    time: "01:00",
    period: "PM",
    court: "Court 1",
    customer: "Sarah Lee",
    duration: "1 hour",
    status: "Confirmed",
  },
];


const courts = [
  {
    name: "Court 1",
    status: "Available",
    description: "Available now",
  },
  {
    name: "Court 2",
    status: "Reserved",
    description: "Until 12:00 PM",
  },
  {
    name: "Court 3",
    status: "Reserved",
    description: "Until 12:00 PM",
  },
  {
    name: "Court 4",
    status: "Available",
    description: "Available now",
  },
  {
    name: "Court 5",
    status: "Available",
    description: "Available now",
  },
  {
    name: "Court 6",
    status: "Maintenance",
    description: "Currently unavailable",
  },
];


const recentReservations = [
  {
    reservationNo: "RSV-20260808-000024",
    customer: "John Doe",
    court: "Court 1",
    date: "Today",
    time: "09:00 AM",
    amount: "₱500",
    status: "Confirmed",
  },
  {
    reservationNo: "RSV-20260808-000023",
    customer: "Jane Smith",
    court: "Court 2",
    date: "Today",
    time: "10:00 AM",
    amount: "₱1,000",
    status: "Confirmed",
  },
  {
    reservationNo: "RSV-20260808-000022",
    customer: "Michael Cruz",
    court: "Court 3",
    date: "Today",
    time: "11:00 AM",
    amount: "₱500",
    status: "Pending",
  },
  {
    reservationNo: "RSV-20260808-000021",
    customer: "Sarah Lee",
    court: "Court 1",
    date: "Today",
    time: "01:00 PM",
    amount: "₱500",
    status: "Confirmed",
  },
];


/* ====================================================== */
/* STATUS BADGE */
/* ====================================================== */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === "Confirmed") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 font-normal text-emerald-700"
      >
        Confirmed
      </Badge>
    );
  }

  if (status === "Pending") {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/20 bg-amber-500/5 px-2 py-0.5 font-normal text-amber-700"
      >
        Pending
      </Badge>
    );
  }

  if (status === "Cancelled") {
    return (
      <Badge
        variant="outline"
        className="border-red-500/20 bg-red-500/5 px-2 py-0.5 font-normal text-red-700"
      >
        Cancelled
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="px-2 py-0.5 font-normal text-slate-600"
    >
      {status}
    </Badge>
  );
}


/* ====================================================== */
/* COURT STATUS */
/* ====================================================== */

function CourtStatusIndicator({
  status,
}: {
  status: string;
}) {
  if (status === "Available") {
    return (
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
    );
  }

  if (status === "Reserved") {
    return (
      <span className="h-2 w-2 rounded-full bg-amber-500" />
    );
  }

  if (status === "Maintenance") {
    return (
      <span className="h-2 w-2 rounded-full bg-red-500" />
    );
  }

  return (
    <span className="h-2 w-2 rounded-full bg-slate-400" />
  );
}


/* ====================================================== */
/* DASHBOARD */
/* ====================================================== */

export default function Dashboard() {
  return (
    <div className="space-y-7">

      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <div className="mb-2 flex items-center gap-2 text-xs">

            <span className="text-slate-400">
              Admin
            </span>

            <span className="text-slate-300">
              /
            </span>

            <span className="text-slate-700">
              Dashboard
            </span>

          </div>


          <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-slate-950">
            Dashboard
          </h1>


          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening with your facility today.
          </p>

        </div>


        <Button
          className="h-9 w-fit rounded-lg bg-[#b7ff00] px-4 font-semibold text-[#06131f] shadow-sm hover:bg-[#c5ff33]"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Reservation
        </Button>

      </div>


      {/* ================================================= */}
      {/* STATS */}
      {/* ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {

          const Icon = stat.icon;

          return (
            <Card
              key={stat.title}
              className="rounded-xl border border-slate-200/80 bg-white text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >

              <CardContent className="p-5">

                <div className="flex items-start justify-between">

                  <div className="space-y-3">

                    <p className="text-sm text-slate-500">
                      {stat.title}
                    </p>

                    <p className="text-[28px] font-semibold tracking-[-0.03em] text-slate-950">
                      {stat.value}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs">

                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />

                      <span className="font-medium text-emerald-700">
                        {stat.change}
                      </span>

                      <span className="text-slate-400">
                        {stat.description}
                      </span>

                    </div>

                  </div>


                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">

                    <Icon className="h-4 w-4 text-slate-600" />

                  </div>

                </div>

              </CardContent>

            </Card>
          );
        })}

      </div>


      {/* ================================================= */}
      {/* SCHEDULE + COURT STATUS */}
      {/* ================================================= */}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">


        {/* TODAY'S SCHEDULE */}

        <Card className="rounded-xl border border-slate-200/80 bg-white text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

          <CardHeader className="flex flex-row items-start justify-between space-y-0">

            <div>

              <CardTitle className="text-[15px] font-semibold text-slate-950">
                Today's Schedule
              </CardTitle>

              <p className="mt-1 text-xs text-slate-500">
                Reservations scheduled for today.
              </p>

            </div>


            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              View all

              <ChevronRight className="h-3.5 w-3.5" />
            </Button>

          </CardHeader>


          <CardContent>

            <div className="divide-y divide-slate-100">

              {schedule.map((item) => (

                <div
                  key={`${item.court}-${item.time}`}
                  className="flex items-center gap-4 py-4"
                >

                  <div className="w-[54px] shrink-0 text-center">

                    <p className="text-sm font-semibold text-slate-900">
                      {item.time}
                    </p>

                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      {item.period}
                    </p>

                  </div>


                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">

                    <MapPin className="h-4 w-4 text-slate-600" />

                  </div>


                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <p className="text-sm font-medium text-slate-900">
                        {item.court}
                      </p>

                      <StatusBadge
                        status={item.status}
                      />

                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.customer}
                    </p>

                  </div>


                  <div className="hidden shrink-0 items-center gap-1.5 text-xs text-slate-400 sm:flex">

                    <Clock3 className="h-3.5 w-3.5" />

                    {item.duration}

                  </div>

                </div>

              ))}

            </div>

          </CardContent>

        </Card>


        {/* COURT STATUS */}

        <Card className="rounded-xl border border-slate-200/80 bg-white text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

          <CardHeader className="flex flex-row items-start justify-between space-y-0">

            <div>

              <CardTitle className="text-[15px] font-semibold text-slate-950">
                Court Status
              </CardTitle>

              <p className="mt-1 text-xs text-slate-500">
                Current court availability.
              </p>

            </div>


            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              Manage

              <ChevronRight className="h-3.5 w-3.5" />
            </Button>

          </CardHeader>


          <CardContent>

            <div className="space-y-1">

              {courts.map((court) => (

                <div
                  key={court.name}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50"
                >

                  <div className="flex items-center gap-3">

                    <CourtStatusIndicator
                      status={court.status}
                    />

                    <div>

                      <p className="text-sm font-medium text-slate-900">
                        {court.name}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {court.description}
                      </p>

                    </div>

                  </div>


                  <span className="text-[11px] font-medium text-slate-500">
                    {court.status}
                  </span>

                </div>

              ))}

            </div>

          </CardContent>

        </Card>

      </div>


      {/* ================================================= */}
      {/* RECENT RESERVATIONS */}
      {/* ================================================= */}

      <Card className="rounded-xl border border-slate-200/80 bg-white text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

        <CardHeader className="flex flex-row items-start justify-between space-y-0">

          <div>

            <CardTitle className="text-[15px] font-semibold text-slate-950">
              Recent Reservations
            </CardTitle>

            <p className="mt-1 text-xs text-slate-500">
              Latest booking activity.
            </p>

          </div>


          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            View all

            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

        </CardHeader>


        <CardContent>

          <div className="hidden overflow-x-auto md:block">

            <table className="w-full">

              <thead>

                <tr className="border-b border-slate-100 text-left">

                  <th className="pb-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Reservation
                  </th>

                  <th className="pb-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Customer
                  </th>

                  <th className="pb-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Court
                  </th>

                  <th className="pb-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Date
                  </th>

                  <th className="pb-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Time
                  </th>

                  <th className="pb-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Status
                  </th>

                  <th className="pb-3 text-right text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Amount
                  </th>

                </tr>

              </thead>


              <tbody>

                {recentReservations.map((reservation) => (

                  <tr
                    key={reservation.reservationNo}
                    className="border-b border-slate-100 last:border-0"
                  >

                    <td className="py-4 text-sm font-medium text-slate-900">
                      {reservation.reservationNo}
                    </td>

                    <td className="py-4 text-sm text-slate-700">
                      {reservation.customer}
                    </td>

                    <td className="py-4 text-sm text-slate-500">
                      {reservation.court}
                    </td>

                    <td className="py-4 text-sm text-slate-500">
                      {reservation.date}
                    </td>

                    <td className="py-4 text-sm text-slate-500">
                      {reservation.time}
                    </td>

                    <td className="py-4">
                      <StatusBadge
                        status={reservation.status}
                      />
                    </td>

                    <td className="py-4 text-right text-sm font-medium text-slate-900">
                      {reservation.amount}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>


          {/* Mobile */}

          <div className="space-y-2 md:hidden">

            {recentReservations.map((reservation) => (

              <div
                key={reservation.reservationNo}
                className="rounded-lg border border-slate-200 p-4"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-sm font-medium text-slate-900">
                      {reservation.reservationNo}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {reservation.customer}
                    </p>

                  </div>


                  <StatusBadge
                    status={reservation.status}
                  />

                </div>


                <div className="mt-4 flex items-center justify-between">

                  <span className="text-xs text-slate-500">
                    {reservation.court} · {reservation.time}
                  </span>

                  <span className="text-sm font-medium text-slate-900">
                    {reservation.amount}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </CardContent>

      </Card>

    </div>
  );
}