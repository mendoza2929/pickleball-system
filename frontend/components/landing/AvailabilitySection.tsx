"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Container from "../common/Container";
import AvailabilityCard from "./AvailabilityCard";
import AvailabilityTimeline from "./AvailabilityTimeline";
import { Button } from "@/components/ui/button";

const courts = [
  {
    courtName: "Championship Court",
    type: "Indoor Court",
    status: "available" as const,
    price: 250,
    capacity: 4,
    rating: 4.9,
  },
  {
    courtName: "Elite Court",
    type: "Outdoor Court",
    status: "occupied" as const,
    nextAvailable: "4:00 PM",
    price: 250,
    capacity: 4,
    rating: 4.8,
  },
];

export default function AvailabilitySection() {
  return (
    <section id="availability" className="relative overflow-hidden py-32">

      {/* Background Glow */}

      <div className="blur-circle left-[-180px] top-20" />
      <div className="blur-circle right-[-180px] bottom-20" />

      <Container>

        <div className="grid gap-20 lg:grid-cols-[420px_1fr]">

          {/* LEFT */}

          <motion.div
            initial={{
              opacity: 0,
              x: -40,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.7,
            }}
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
              Live Availability
            </span>

            <h2
              className="
              mt-8
              text-5xl
              font-black
              leading-tight
            "
            >
              Reserve

              <span className="text-gradient">

                {" "}Instantly

              </span>

            </h2>

            <p
              className="
              mt-6
              leading-8
              text-slate-400
            "
            >
              View today's court availability in real time.
              Reserve instantly without waiting in line and
              enjoy a seamless booking experience.
            </p>

         
            {/* Quick Stats */}

            <div
              className="
              mt-14
              grid
              grid-cols-2
              gap-5
              "
            >

              <div className="hero-stat-card">

                <h3>2</h3>

                <p>Available Courts</p>

              </div>

              <div className="hero-stat-card">

                <h3>8AM</h3>

                <p>Opening Time</p>

              </div>

              <div className="hero-stat-card">

                <h3>10PM</h3>

                <p>Closing Time</p>

              </div>

              <div className="hero-stat-card">

                <h3>4.9★</h3>

                <p>Average Rating</p>

              </div>

            </div>

          </motion.div>

          {/* RIGHT */}

          <div className="space-y-8">

            <div className="grid gap-8 xl:grid-cols-2">

              {courts.map((court, index) => (

                <AvailabilityCard
                  key={court.courtName}
                  {...court}
                />

              ))}

            </div>

            <AvailabilityTimeline />

          </div>

        </div>

      </Container>

    </section>
  );
}