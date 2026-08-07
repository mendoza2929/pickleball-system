"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Hash,
  Layers3,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type CourtCardProps = {
  id: number;
  court_number: number;
  name: string;
  description?: string | null;
  surface_type: string;
  hourly_rate: number;
  status: string;
  delay?: number;
};

export default function CourtCard({
  court_number,
  name,
  description,
  surface_type,
  hourly_rate,
  status,
  delay = 0,
}: CourtCardProps) {
  const available = status.toUpperCase() === "AVAILABLE";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 60,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.7,
        delay,
      }}
      whileHover={{
        y: -8,
      }}
      className="
        group
        overflow-hidden
        rounded-[30px]
        border
        border-white/10
        bg-slate-900/60
        backdrop-blur-xl
        transition-all
        duration-500
        hover:border-lime-400/30
        hover:shadow-[0_25px_70px_rgba(132,255,0,.18)]
      "
    >
      {/* Hero */}

      <div
        className="
          relative
          flex
          aspect-[16/10]
          items-center
          justify-center
          overflow-hidden
          bg-gradient-to-br
          from-lime-400/15
          via-slate-900
          to-slate-950
        "
      >
        <div
          className="
            absolute
            h-72
            w-72
            rounded-full
            bg-lime-400/10
            blur-3xl
          "
        />

        <span className="relative text-8xl">
          🏓
        </span>

        <div
          className="
            absolute
            left-5
            top-5
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold
            backdrop-blur-xl
            border
            border-white/10
            bg-black/40
          "
        >
          Court #{court_number}
        </div>

        <div
          className={`
            absolute
            right-5
            top-5
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold

            ${
              available
                ? "bg-lime-400 text-slate-950"
                : "bg-red-500 text-white"
            }
          `}
        >
          {status}
        </div>
      </div>

      {/* Content */}

      <div className="space-y-6 p-8">
        <div>
          <h3 className="text-3xl font-black">
            {name}
          </h3>

          <p className="mt-2 text-lime-300">
            {surface_type}
          </p>
        </div>

        {/* Details */}

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-300">
            <Hash
              size={18}
              className="text-lime-400"
            />

            <span>
              Court Number: {court_number}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <Layers3
              size={18}
              className="text-lime-400"
            />

            <span>
              Surface: {surface_type}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <CircleDollarSign
              size={18}
              className="text-lime-400"
            />

            <span>
              ₱{hourly_rate} / hour
            </span>
          </div>
        </div>

        {/* Description */}

        <div
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-5
          "
        >
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2
              size={18}
              className="text-lime-400"
            />

            <span className="font-medium">
              Description
            </span>
          </div>

          <p className="leading-7 text-slate-400">
            {description ||
              "Professional pickleball court ready for your next match."}
          </p>
        </div>

        {/* Footer */}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Hourly Rate
            </p>

            <h4 className="text-4xl font-black text-lime-400">
              ₱{hourly_rate}

              <span className="ml-1 text-lg text-white">
                /hr
              </span>
            </h4>
          </div>

          <Button
            className="
              hero-btn-primary
              rounded-full
              px-6
            "
            asChild
          >
            <Link
              href="/reservation"
              className="group"
            >
              Reserve

              <ArrowRight
                className="
                  ml-2
                  h-5
                  w-5
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}