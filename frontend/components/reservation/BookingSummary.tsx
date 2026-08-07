"use client";

import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  MessageSquare,
} from "lucide-react";

interface BookingSummaryProps {
  courtId: number;
  date: Date;
  startTime: string;
  endTime: string;

  guest: {
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    remarks: string;
  };
}

export default function BookingSummary({
  courtId,
  date,
  startTime,
  endTime,
  guest,
}: BookingSummaryProps) {
  return (
    <div className="space-y-8">

      <div>

        <h2 className="text-3xl font-bold">
          Review Reservation
        </h2>

        <p className="mt-2 text-slate-400">
          Please review your reservation before confirming.
        </p>

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Reservation */}

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">

          <h3 className="mb-6 text-xl font-semibold">
            Reservation Details
          </h3>

          <div className="space-y-5">

            <div className="flex items-center gap-3">
              <MapPin className="text-lime-400" />
              <div>
                <p className="text-sm text-slate-500">
                  Court
                </p>

                <p className="font-medium">
                  Court #{courtId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="text-lime-400" />
              <div>
                <p className="text-sm text-slate-500">
                  Date
                </p>

                <p className="font-medium">
                  {date.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="text-lime-400" />
              <div>
                <p className="text-sm text-slate-500">
                  Time
                </p>

                <p className="font-medium">
                  {startTime} - {endTime}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Guest */}

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">

          <h3 className="mb-6 text-xl font-semibold">
            Guest Information
          </h3>

          <div className="space-y-5">

            <div className="flex items-center gap-3">
              <User className="text-lime-400" />
              <div>
                <p className="text-sm text-slate-500">
                  Name
                </p>

                <p>{guest.guest_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="text-lime-400" />
              <div>
                <p className="text-sm text-slate-500">
                  Email
                </p>

                <p>{guest.guest_email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="text-lime-400" />
              <div>
                <p className="text-sm text-slate-500">
                  Mobile
                </p>

                <p>{guest.guest_phone}</p>
              </div>
            </div>

            {guest.remarks && (
              <div className="flex items-start gap-3">
                <MessageSquare className="mt-1 text-lime-400" />

                <div>
                  <p className="text-sm text-slate-500">
                    Remarks
                  </p>

                  <p>{guest.remarks}</p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      <div className="rounded-2xl border border-lime-400/20 bg-lime-400/10 p-6">

        <p className="text-lg font-semibold text-lime-300">
          Please arrive at least 15 minutes before your scheduled time.
        </p>

      </div>

    </div>
  );
}