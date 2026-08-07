"use client";

import { motion } from "framer-motion";
import Container from "../common/Container";
import CourtCard from "./CourtCard";

const courts = [
  {
    id: 1,
    name: "Championship Court",
    image: "/images/court1.jpg",
    type: "Indoor Court",
    location: "Mercedes, Zamboanga City",
    available: true,
    rating: 4.9,
    price: 250,
    capacity: 4,
    features: [
      "LED Lighting",
      "Synthetic Surface",
      "Locker Room",
    ],
  },

  {
    id: 2,
    name: "Elite Court",
    image: "/images/court2.jpg",
    type: "Outdoor Court",
    location: "Mercedes, Zamboanga City",
    available: true,
    rating: 4.8,
    price: 250,
    capacity: 4,
    features: [
      "Nature View",
      "Night Lights",
      "Free Parking",
    ],
  },
];

export default function FeaturedCourts() {
  return (
    <section id="courts" className="relative py-32">

      <Container>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="text-center"
        >

          <span className="inline-flex rounded-full border border-lime-400/30 bg-lime-400/10 px-5 py-2 text-sm text-lime-300">
            Premium Courts
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl font-black">

            Find Your

            <span className="text-gradient"> Perfect Court</span>

          </h2>

          <p className="mt-5 max-w-2xl mx-auto text-slate-400 leading-8">

            Choose from our professional pickleball courts designed for
            tournaments, training sessions, and friendly matches.

          </p>

        </motion.div>

        <div className="mt-20 grid gap-8 lg:grid-cols-2">

          {courts.map((court, index) => (

            <CourtCard
              key={court.id}
              {...court}
              delay={index * 0.2}
            />

          ))}

        </div>

      </Container>

    </section>
  );
}