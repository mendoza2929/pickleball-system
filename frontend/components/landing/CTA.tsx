"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Trophy,
  Star,
} from "lucide-react";

import Container from "../common/Container";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section id="reserve" className="relative overflow-hidden py-36">

      {/* Background */}

      <div className="blur-circle left-[-180px] top-10" />

      <div className="blur-circle right-[-180px] bottom-0" />

      <Container>

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
            duration: .8,
          }}
          className="
            relative
            overflow-hidden
            rounded-[40px]
            border
            border-white/10
            bg-gradient-to-br
            from-slate-900
            via-slate-900
            to-slate-800
            p-10
            lg:p-20
          "
        >

          {/* Glow */}

          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-[500px]
              w-[500px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-lime-400/10
              blur-[140px]
            "
          />

          <div className="relative z-10">

            <motion.span
              initial={{
                opacity: 0,
                scale: .8,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              className="
                inline-flex
                rounded-full
                border
                border-lime-400/30
                bg-lime-400/10
                px-5
                py-2
                text-sm
                text-lime-300
              "
            >
              Join the RVS Community
            </motion.span>

            <motion.h2
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: .2,
              }}
              className="
                mt-8
                text-5xl
                lg:text-7xl
                font-black
                leading-tight
              "
            >
              Ready To

              <span className="text-gradient">

                {" "}Play?

              </span>

            </motion.h2>

            <motion.p
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: .35,
              }}
              className="
                mt-8
                max-w-2xl
                text-lg
                leading-8
                text-slate-300
              "
            >
              Reserve your favorite pickleball court in seconds,
              join exciting tournaments,
              meet passionate players,
              and experience the most modern booking platform
              in the city.
            </motion.p>

            {/* Features */}

            <motion.div
              initial={{
                opacity: 0,
              }}
              whileInView={{
                opacity: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: .45,
              }}
              className="
                mt-10
                flex
                flex-wrap
                gap-5
              "
            >

              <div className="flex items-center gap-2">

                <CalendarDays className="text-lime-400" />

                Instant Booking

              </div>

              <div className="flex items-center gap-2">

                <Trophy className="text-lime-400" />

                Weekly Tournaments

              </div>

              <div className="flex items-center gap-2">

                <Star className="text-lime-400" />

                Premium Courts

              </div>

            </motion.div>

          
          </div>

        </motion.div>

      </Container>

    </section>
  );
}