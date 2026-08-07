"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import {
  ArrowRight,
  CalendarDays,
  Trophy,
  Users,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import TournamentCountdown from "./TournamentCountdown";

export default function TournamentHero() {
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
        duration: 0.8,
      }}
      className="
        relative
        overflow-hidden
        rounded-[36px]
        border
        border-white/10
        bg-slate-900/60
        backdrop-blur-xl
      "
    >
      {/* Background Image */}

      <div className="relative h-[420px]">

        <Image
          src="/images/tournaments/banner.jpg"
          alt="Tournament"
          fill
          priority
          className="object-cover"
        />

        {/* Overlay */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-slate-950
            via-slate-950/60
            to-transparent
          "
        />

        {/* Content */}

        <div
          className="
            absolute
            inset-0
            grid
            lg:grid-cols-2
            items-center
            gap-10
            p-10
            lg:p-14
          "
        >
          {/* LEFT */}

          <div>

            <span
              className="
                inline-flex
                rounded-full
                bg-lime-400
                px-4
                py-2
                text-sm
                font-semibold
                text-slate-950
              "
            >
              Featured Tournament
            </span>

            <h2
              className="
                mt-6
                text-4xl
                lg:text-6xl
                font-black
                leading-tight
              "
            >
              August Smash

              <span className="text-gradient">

                {" "}Championship

              </span>

            </h2>

            <p
              className="
                mt-6
                max-w-xl
                leading-8
                text-slate-300
              "
            >
              Join the biggest pickleball tournament of the
              season. Compete with top players, win exciting
              prizes, and experience a championship-level event.
            </p>

            <div
              className="
                mt-8
                grid
                gap-4
                sm:grid-cols-2
              "
            >
              <div className="flex items-center gap-3">

                <CalendarDays className="text-lime-400" />

                August 28, 2026

              </div>

              <div className="flex items-center gap-3">

                <Trophy className="text-lime-400" />

                ₱20,000 Prize Pool

              </div>

              <div className="flex items-center gap-3">

                <Users className="text-lime-400" />

                64 Participants

              </div>

              <div className="flex items-center gap-3">

                <MapPin className="text-lime-400" />

                RVS Pickleball Club

              </div>
            </div>

            <Button
              className="
                hero-btn-primary
                mt-10
              "
              asChild
            >
              <Link href="/tournaments">

                Register Now

                <ArrowRight className="ml-2 h-5 w-5" />

              </Link>
            </Button>

          </div>

          {/* RIGHT */}

          <TournamentCountdown />

        </div>

      </div>

    </motion.div>
  );
}