"use client";

import type {
  PeakBookingHour,
} from "@/types/report";

interface PeakBookingHoursProps {
  data: PeakBookingHour[];
}

export default function PeakBookingHours({
  data,
}: PeakBookingHoursProps) {

  const maxBookings =
    Math.max(
      ...data.map(
        (item) => item.bookings
      ),
      1
    );

  const formatHour = (
    hour: number
  ) => {

    const suffix =
      hour >= 12
        ? "PM"
        : "AM";

    const displayHour =
      hour % 12 || 12;

    return `${displayHour}:00 ${suffix}`;
  };

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
          Peak Booking Hours
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Most popular booking times.
        </p>

      </div>


      <div className="space-y-4">

        {data.length === 0 ? (

          <p className="text-sm text-slate-400">
            No booking data available.
          </p>

        ) : (

          data.map((item) => {

            const percentage =
              (item.bookings /
                maxBookings) *
              100;

            return (
              <div
                key={item.hour}
                className="flex items-center gap-4"
              >

                <div className="w-20 shrink-0 text-sm font-semibold text-[#06131f]">
                  {formatHour(
                    item.hour
                  )}
                </div>

                <div className="flex-1">

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-[#b7ff00]"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                </div>

                <div className="w-24 text-right text-sm text-slate-500">
                  {item.bookings} bookings
                </div>

              </div>
            );

          })

        )}

      </div>

    </div>
  );
}