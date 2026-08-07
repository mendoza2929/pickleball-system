"use client";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Star,
  Trophy,
  Zap,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import Container from "../common/Container";
import HeroImage from "./HeroImage";
import FadeIn from "../common/animations/FadeIn";
import { motion } from "framer-motion";


export default function Hero() {

    
  return (
    <section id="home" className="relative overflow-hidden pt-28 pb-28">

      {/* Background Effects */}
      <div className="blur-circle top-[-120px] left-[-180px]" />
      <div className="blur-circle bottom-[-180px] right-[-120px]" />
      <div className="hero-grid" />

      <Container>

        <div
          className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-16
          xl:gap-24
          items-center
          "
        >

          {/* LEFT */}

         <motion.div
            className="text-center lg:text-left"
            initial="hidden"
            animate="visible"
            >

            <span
              className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-lime-400/30
              bg-lime-400/10
              px-5
              py-2
              text-sm
              font-medium
              text-lime-300
            "
            >
              🎾 Premium Pickleball Club
            </span>

            <h1
              className="
              mt-8
              text-5xl
              sm:text-6xl
              lg:text-7xl
              xl:text-8xl
              font-black
              leading-[0.92]
              tracking-tight
            "
            >
              Play{" "}
              <span className="text-gradient">
                Bigger.
              </span>

              <br />

              Reserve

              <br />

              Smarter.
            </h1>

<motion.p
  initial={{
    opacity: 0,
    y: 40,
  }}
  animate={{
    opacity: 1,
    y: 0,
  }}
  transition={{
    duration: 0.8,
    delay: 0.35,
    ease: "easeOut",
  }}
  className="
    mt-8
    max-w-xl
    mx-auto
    lg:mx-0
    text-lg
    leading-8
    text-slate-300
  "
>
  Book premium pickleball courts in seconds, compete in exciting
  tournaments, manage reservations effortlessly, and enjoy the
  ultimate pickleball experience with RVS Pickleball Club.
</motion.p>

      

{/* Feature Chips */}

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
    delay: 0.9,
    duration: 0.7,
  }}
  className="
    mt-10
    flex
    flex-wrap
    justify-center
    lg:justify-start
    gap-3
  "
>

  <div className="hero-chip">
    <BadgeCheck size={16} />
    <span>Instant Booking</span>
  </div>

  <div className="hero-chip">
    <Zap size={16} />
    <span>Live Availability</span>
  </div>

  <div className="hero-chip">
    <Trophy size={16} />
    <span>Weekly Tournaments</span>
  </div>

  <div className="hero-chip">
    <Star size={16} />
    <span>4.9 Player Rating</span>
  </div>

</motion.div>



            {/* Stats */}

            <div
              className="
              mt-16
              grid
              grid-cols-3
              gap-4
              sm:gap-6
            "
            >

              <div className="hero-stat-card">

                <CalendarDays className="hero-stat-icon" />

                <h3>2</h3>

                <p>Premium Courts</p>

              </div>

              <div className="hero-stat-card">

                <Star className="hero-stat-icon" />

                <h3>4.9★</h3>

                <p>Player Rating</p>

              </div>

              <div className="hero-stat-card">

                <Clock3 className="hero-stat-icon" />

                <h3>8AM–10PM</h3>

                <p>Open Daily</p>

              </div>

            </div>

          </motion.div>

          {/* RIGHT */}

          <div className="relative">

            {/* Logo / Hero Image */}

            <div className="flex justify-center">

              <HeroImage />

            </div>

            {/* Booking Card */}

            <motion.div
            initial={{
                opacity: 0,
                y: 120,
                scale: 0.9,
            }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1,
            }}
            transition={{
                duration: 0.9,
                delay: 1.1,
                type: "spring",
                stiffness: 90,
                damping: 16,
            }}
            whileHover={{
                y: -8,
                scale: 1.02,
            }}
            className="
                mt-8
                lg:mt-0

                lg:absolute
                lg:-bottom-16
                lg:right-0

                xl:-right-10

                w-full
                max-w-[360px]

                mx-auto
                lg:mx-0

                rounded-[30px]
                border
                border-white/10

                bg-slate-900/90

                backdrop-blur-2xl

                p-7

                shadow-[0_40px_80px_rgba(132,255,0,.18)]

                z-30
            "
            >

             <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                    delay: 1.25,
                    duration: 0.4,
                }}
                className="text-sm text-slate-400"
                >
                Ready to play?
                </motion.p>

             <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 1.35,
                    duration: 0.4,
                }}
                className="mt-1 text-2xl font-bold"
                >
                Check Availability
                </motion.h2>

                <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    delay: 1.45,
                    duration: 0.4,
                }}
                className="mt-2 text-sm text-slate-400"
                >
                Find available courts instantly and reserve your preferred schedule.
                </motion.p>

              <div className="mt-6 space-y-4">

                <button className="hero-input">

                  📅

                  <span>Select Date</span>

                </button>

                <button className="hero-input">

                  🕘

                  <span>Select Time</span>

                </button>

                <button className="hero-input">

                  🏓

                  <span>Select Court</span>

                </button>

              </div>
<motion.div
  initial={{
    opacity: 0,
    scale: 0.8,
    y: 20,
  }}
  animate={{
    opacity: 1,
    scale: [1, 1.02, 1],
    y: 0,
  }}
  transition={{
    opacity: {
      delay: 1.9,
      duration: 0.4,
    },
    y: {
      delay: 1.9,
      duration: 0.5,
      type: "spring",
      stiffness: 180,
      damping: 14,
    },
    scale: {
      delay: 2.5,
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  }}
  whileHover={{
    scale: 1.04,
    y: -2,
  }}
  whileTap={{
    scale: 0.97,
  }}
>
  <Button
    className="
      hero-btn-primary
      w-full
      mt-6
    "
  >
    <Link
        href="/reservation"
        className="group"
      >
    Search Availability
     </Link>
    </Button>
 
</motion.div>

            </motion.div>

          </div>

        </div>

      </Container>

    </section>
  );
}