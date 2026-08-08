"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useReservation } from "@/hooks/useReservation";
import LoadingSpinner from "@/components/common/LoadingSpinner";
export default function ReservationSuccessPage() {
  const params = useParams();

  const uuid = params.uuid as string;

  console.log("UUID:", uuid);

  const { data, isLoading } = useReservation(uuid);

  console.log("Reservation:", data);

  if (isLoading) {
    return (
      <LoadingSpinner
        fullScreen
        text="Loading reservation..."
      />
    );
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-10 text-center shadow-2xl">
        <CheckCircle2
          size={90}
          className="mx-auto text-lime-400"
        />

        <h1 className="mt-8 text-4xl font-black">
          Reservation Successful
        </h1>

        <p className="mt-4 text-slate-400">
          Thank you for choosing RVS Pickleball Club.
        </p>

        <div className="mt-10 rounded-2xl bg-slate-950 p-8">
          <p className="text-sm uppercase tracking-widest text-slate-500">
            Reservation Number
          </p>

          <h2 className="mt-4 break-all text-2xl font-bold tracking-wide text-lime-400 md:text-3xl">
            {data?.reservation_no}
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link
            href="/reservation"
            className="rounded-xl bg-lime-400 py-3 font-semibold text-slate-950 transition hover:bg-lime-300"
          >
            Book Again
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-white/10 py-3 transition hover:bg-slate-800"
          >
            Back Home
          </Link>
        </div>
      </div>
    </section>
  );
}