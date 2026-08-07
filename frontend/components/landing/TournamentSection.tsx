"use client";

import { motion } from "framer-motion";

import Container from "../common/Container";

import TournamentHero from "./TournamentHero";
import TournamentCard from "./TournamentCard";

const tournaments = [
  {
    title: "September League",
    image: "/images/tournaments/event1.jpg",
    date: "September 5, 2026",
    prize: "₱10,000",
    players: 32,
    venue: "RVS Pickleball Club",
  },
  {
    title: "Mixed Doubles Cup",
    image: "/images/tournaments/event2.jpg",
    date: "September 12, 2026",
    prize: "₱7,500",
    players: 24,
    venue: "RVS Pickleball Club",
  },
  {
    title: "Beginner Challenge",
    image: "/images/tournaments/event3.jpg",
    date: "September 20, 2026",
    prize: "₱5,000",
    players: 40,
    venue: "RVS Pickleball Club",
  },
];

export default function TournamentSection() {
  return (
    <section id="tournaments" className="relative overflow-hidden py-32">

      {/* Background Glow */}

      <div className="blur-circle left-[-180px] top-20" />

      <div className="blur-circle right-[-150px] bottom-20" />

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
            Weekly Tournaments
          </span>

          <h2
            className="
              mt-6
              text-5xl
              lg:text-6xl
              font-black
            "
          >
            Compete.

            <span className="text-gradient">

              {" "}Improve.

            </span>

            Win.

          </h2>

          <p
            className="
              mt-6
              text-lg
              leading-8
              text-slate-400
            "
          >
            Join exciting weekly tournaments, challenge the best
            players, and become part of the growing RVS Pickleball
            community.
          </p>

        </motion.div>

        {/* Featured Tournament */}

        <div className="mt-20">

          <TournamentHero />

        </div>

        {/* Upcoming */}

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
            delay: 0.3,
          }}
          className="mt-24"
        >

          <h3
            className="
              text-4xl
              font-black
            "
          >
            Upcoming Events
          </h3>

          <p
            className="
              mt-4
              text-slate-400
            "
          >
            Register early to secure your slot.
          </p>

        </motion.div>

        {/* Cards */}

        <div
          className="
            mt-12
            grid
            gap-8
            lg:grid-cols-3
          "
        >

          {tournaments.map((event, index) => (

            <TournamentCard
              key={event.title}
              {...event}
              delay={index * 0.15}
            />

          ))}

        </div>

      </Container>

    </section>
  );
}