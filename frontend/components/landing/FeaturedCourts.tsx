"use client";

import { motion } from "framer-motion";

import Container from "../common/Container";
import CourtCard from "./CourtCard";

import { useCourts } from "@/hooks/useCourts";

export default function FeaturedCourts() {
  const {
    data: courts,
    isLoading,
    isError,
  } = useCourts();

  if (isLoading) {
    return (
      <section
        id="courts"
        className="py-28"
      >
        <Container>
          <div className="animate-pulse">

            <div className="mx-auto h-8 w-48 rounded bg-slate-800" />

            <div className="mx-auto mt-8 h-14 w-96 rounded bg-slate-800" />

            <div className="mx-auto mt-6 h-6 w-[500px] rounded bg-slate-800" />

            <div className="mt-16 grid gap-8 lg:grid-cols-2">

              <div className="h-[520px] rounded-3xl bg-slate-800" />

              <div className="h-[520px] rounded-3xl bg-slate-800" />

            </div>

          </div>
        </Container>
      </section>
    );
  }

  if (isError) {
    return (
      <section
        id="courts"
        className="py-28"
      >
        <Container>

          <div className="text-center">

            <h2 className="text-3xl font-bold">

              Unable to load courts

            </h2>

            <p className="mt-4 text-slate-400">

              Please try again later.

            </p>

          </div>

        </Container>
      </section>
    );
  }

  if (!courts?.length) {
    return (
      <section
        id="courts"
        className="py-28"
      >
        <Container>

          <div className="text-center">

            <h2 className="text-3xl font-bold">

              No Courts Available

            </h2>

            <p className="mt-4 text-slate-400">

              Courts will appear here once added.

            </p>

          </div>

        </Container>
      </section>
    );
  }

  return (
    <section
      id="courts"
      className="py-28"
    >
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
            duration: 0.8,
          }}
          className="text-center"
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
            Premium Courts
          </span>

          <h2 className="mt-6 text-4xl font-black md:text-5xl">

            Find Your{" "}

            <span className="text-gradient">

              Perfect Court

            </span>

          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-400">

            Choose from our professionally maintained courts,
            available for training, casual games, and tournaments.

          </p>

        </motion.div>

        {/* Cards */}

        <div className="mt-20 grid gap-8 lg:grid-cols-2">

          {courts.map((court, index) => (

            <CourtCard
              key={court.id}
              id={court.id}
              court_number={court.court_number}
              name={court.name}
              description={court.description}
              surface_type={court.surface_type}
              hourly_rate={Number(court.hourly_rate)}
              status={court.status}
              delay={index * 0.15}
            />

          ))}

        </div>

      </Container>
    </section>
  );
}