"use client";

import { motion } from "framer-motion";

import Container from "../common/Container";

import {
  CalendarClock,
  Trophy,
  Smartphone,
  MoonStar,
  ShieldCheck,
  Star,
} from "lucide-react";

const features = [
  {
    icon: CalendarClock,
    title: "Instant Booking",
    description:
      "Reserve your favorite court in seconds with real-time availability.",
  },
  {
    icon: Trophy,
    title: "Tournament Ready",
    description:
      "Compete in weekly tournaments and climb the RVS leaderboard.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description:
      "Book courts anywhere using your phone, tablet, or desktop.",
  },
  {
    icon: MoonStar,
    title: "Night Play",
    description:
      "Professional LED lighting lets you enjoy games until 10PM.",
  },
  {
    icon: ShieldCheck,
    title: "Premium Facilities",
    description:
      "Changing rooms, parking, WiFi, comfort rooms, and clean amenities.",
  },
  {
    icon: Star,
    title: "Top Rated Experience",
    description:
      "Designed for beginners, casual players, and tournament athletes.",
  },
];

export default function WhyChoose() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">

      <Container>

        {/* Heading */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
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
          }}
          className="mx-auto max-w-3xl text-center"
        >
          <span
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
            Why Choose RVS
          </span>

          <h2
            className="
            mt-6
            text-4xl
            md:text-5xl
            lg:text-6xl
            font-black
          "
          >
            Built For Every

            <span className="text-gradient">

              {" "}Pickleball Player

            </span>

          </h2>

          <p
            className="
            mt-6
            text-lg
            leading-8
            text-slate-400
          "
          >
            Whether you're a beginner or a competitive athlete,
            RVS Pickleball Club delivers a premium sports experience
            with modern technology and world-class facilities.
          </p>
        </motion.div>

        {/* Cards */}

        <div
          className="
          mt-20
          grid
          gap-8
          sm:grid-cols-2
          lg:grid-cols-3
        "
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{
                  opacity: 0,
                  y: 50,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.12,
                  duration: 0.7,
                }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                }}
                className="
                group
                relative
                overflow-hidden
                rounded-[30px]
                border
                border-white/10
                bg-slate-900/60
                p-8
                backdrop-blur-xl
                transition-all
                duration-500
                hover:border-lime-400/40
                hover:shadow-[0_20px_60px_rgba(132,255,0,.18)]
              "
              >
                {/* Glow */}

                <div
                  className="
                  absolute
                  inset-0
                  opacity-0
                  transition-opacity
                  duration-500
                  group-hover:opacity-100
                  bg-[radial-gradient(circle_at_top,rgba(132,255,0,.10),transparent_70%)]
                "
                />

                {/* Icon */}

                <motion.div
                  whileHover={{
                    rotate: -8,
                    scale: 1.15,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 250,
                  }}
                  className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-lime-400/10
                  text-lime-400
                "
                >
                  <Icon size={30} />
                </motion.div>

                <h3
                  className="
                  mt-8
                  text-2xl
                  font-bold
                "
                >
                  {feature.title}
                </h3>

                <p
                  className="
                  mt-4
                  leading-8
                  text-slate-400
                "
                >
                  {feature.description}
                </p>

                {/* Bottom Accent */}

                <div
                  className="
                  mt-8
                  h-1
                  w-16
                  rounded-full
                  bg-lime-400
                  transition-all
                  duration-500
                  group-hover:w-full
                "
                />
              </motion.div>
            );
          })}
        </div>

      </Container>
    </section>
  );
}