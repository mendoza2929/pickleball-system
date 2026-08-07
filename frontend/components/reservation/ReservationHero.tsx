"use client";

import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";

import Container from "@/components/common/Container";

export default function ReservationHero() {
  return (
    <section
      className="
        relative
        overflow-hidden
        border-b
        border-white/10
        bg-gradient-to-b
        from-slate-950
        via-slate-900
        to-slate-950
        py-32
      "
    >
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_top,#84cc1615,transparent_60%)]
        "
      />

      <Container>
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="mx-auto max-w-3xl text-center"
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-lime-400/20
              bg-lime-400/10
              px-5
              py-2
              text-lime-300
            "
          >
            <CalendarDays size={18} />

            Reserve Your Court
          </div>

          <h1 className="mt-8 text-5xl font-black md:text-6xl">
            Book a Court in
            <span className="text-gradient">
              {" "}
              Minutes
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Choose your preferred court, date, and time.
            No account is required for casual reservations.
            Tournament registration is available for registered players.
          </p>
        </motion.div>
      </Container>
    </section>
  );
}