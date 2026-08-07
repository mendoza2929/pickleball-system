"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import {
  ArrowRight,
  CalendarDays,
  Trophy,
  Users,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface TournamentCardProps {
  title: string;
  image: string;
  date: string;
  prize: string;
  players: number;
  venue: string;
  delay?: number;
}

export default function TournamentCard({
  title,
  image,
  date,
  prize,
  players,
  venue,
  delay = 0,
}: TournamentCardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{ once: true }}
      transition={{
        duration: 0.7,
        delay,
      }}
      whileHover={{
        y: -10,
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
        hover:border-lime-400/40
        hover:shadow-[0_25px_70px_rgba(132,255,0,.18)]
      "
    >
      {/* Image */}

      <div className="relative h-72 overflow-hidden">

        <Image
          src={image}
          alt={title}
          fill
          className="
            object-cover
            transition-transform
            duration-700
            group-hover:scale-110
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-slate-950
            via-transparent
            to-transparent
          "
        />

        <div
          className="
            absolute
            left-5
            top-5
            rounded-full
            bg-lime-400
            px-4
            py-2
            text-sm
            font-semibold
            text-slate-950
          "
        >
          Featured Event
        </div>

      </div>

      {/* Content */}

      <div className="space-y-5 p-7">

        <div>

          <h3 className="text-3xl font-bold">

            {title}

          </h3>

          <p className="mt-2 text-slate-400">

            Weekly Competitive Tournament

          </p>

        </div>

        <div className="space-y-3 text-slate-400">

          <div className="flex items-center gap-3">

            <CalendarDays
              size={18}
              className="text-lime-400"
            />

            {date}

          </div>

          <div className="flex items-center gap-3">

            <Trophy
              size={18}
              className="text-lime-400"
            />

            Prize Pool {prize}

          </div>

          <div className="flex items-center gap-3">

            <Users
              size={18}
              className="text-lime-400"
            />

            {players} Players

          </div>

          <div className="flex items-center gap-3">

            <MapPin
              size={18}
              className="text-lime-400"
            />

            {venue}

          </div>

        </div>

        <Button
          className="
            hero-btn-primary
            w-full
          "
          asChild
        >
          <Link
            href="/tournaments"
            className="group"
          >
            Register Now

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

    </motion.div>
  );
}