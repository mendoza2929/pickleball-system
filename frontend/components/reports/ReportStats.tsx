"use client";

import {
  CalendarDays,
  CircleDollarSign,
  Clock3,
  XCircle,
} from "lucide-react";

import type {
  ReportOverview,
} from "@/types/report";

interface ReportStatsProps {
  report: ReportOverview;
}

export default function ReportStats({
  report,
}: ReportStatsProps) {

  const formatCurrency = (
    value: number
  ) => {
    return `₱${value.toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
      }
    )}`;
  };

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(
        report.total_revenue
      ),
      icon: CircleDollarSign,
    },
    {
      title: "Reservations",
      value:
        report.total_reservations.toLocaleString(),
      icon: CalendarDays,
    },
    {
      title: "Pending Payments",
      value:
        report.pending_reservations.toLocaleString(),
      icon: Clock3,
    },
    {
      title: "Cancelled",
      value:
        report.cancelled_reservations.toLocaleString(),
      icon: XCircle,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-[#06131f]">
                  {stat.value}
                </p>
              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#b7ff00]/15
                "
              >
                <Icon
                  className="h-5 w-5 text-[#06131f]"
                  strokeWidth={2}
                />
              </div>

            </div>
          </div>
        );
      })}

    </div>
  );
}