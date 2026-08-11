"use client";

import type {
  RevenueByCourt as RevenueByCourtType,
} from "@/types/report";

interface RevenueByCourtProps {
  data: RevenueByCourtType[];
}

export default function RevenueByCourt({
  data,
}: RevenueByCourtProps) {

  const maxRevenue =
    Math.max(
      ...data.map(
        (item) => item.revenue
      ),
      1
    );

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
      "
    >

      <div className="mb-6">

        <h2 className="text-lg font-bold text-[#06131f]">
          Revenue by Court
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Court performance for the selected period.
        </p>

      </div>


      <div className="space-y-5">

        {data.length === 0 ? (

          <p className="text-sm text-slate-400">
            No revenue data available.
          </p>

        ) : (

          data.map((court) => {

            const percentage =
              (court.revenue /
                maxRevenue) *
              100;

            return (
              <div
                key={court.court_id}
                className="space-y-2"
              >

                <div className="flex items-center justify-between">

                  <span className="text-sm font-semibold text-[#06131f]">
                    {court.court_name}
                  </span>

                  <span className="text-sm font-bold text-[#06131f]">
                    ₱
                    {court.revenue.toLocaleString(
                      "en-PH",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-[#b7ff00]"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />

                </div>

                <p className="text-xs text-slate-400">
                  {court.reservations} reservations
                </p>

              </div>
            );
          })

        )}

      </div>

    </div>
  );
}