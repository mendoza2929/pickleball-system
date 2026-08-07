"use client";

import { motion } from "framer-motion";

import Container from "../common/Container";
import TestimonialCard from "./TestimonialCard";

const testimonials = [
  {
    image: "/images/players/player1.jpg",
    name: "John Dela Cruz",
    role: "Advanced Player",
    rating: 5,
    review:
      "The reservation system is incredibly smooth and the courts are always in excellent condition. Definitely the best pickleball club I've played at.",
  },
  {
    image: "/images/players/player2.jpg",
    name: "Maria Santos",
    role: "Intermediate Player",
    rating: 5,
    review:
      "I love how easy it is to reserve a court online. The facilities are clean, modern, and the staff is very accommodating.",
  },
  {
    image: "/images/players/player3.jpg",
    name: "James Reyes",
    role: "Tournament Player",
    rating: 5,
    review:
      "Weekly tournaments are well organized and the competition is amazing. Looking forward to every event at RVS Pickleball Club.",
  },
  {
    image: "/images/players/player4.jpg",
    name: "Angela Cruz",
    role: "Beginner",
    rating: 5,
    review:
      "Even as a beginner, I felt welcomed. Booking is simple and the environment is perfect for learning and improving.",
  },
  {
    image: "/images/players/player5.jpg",
    name: "Michael Tan",
    role: "Professional Player",
    rating: 5,
    review:
      "Premium courts, excellent lighting, and a fantastic online booking experience. Highly recommended for serious players.",
  },
  {
    image: "/images/players/player1.jpg",
    name: "Sophia Lim",
    role: "Weekend Player",
    rating: 5,
    review:
      "Our group books every weekend. The live availability feature makes planning so much easier.",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden py-32">

      <div className="blur-circle left-[-180px] top-10" />
      <div className="blur-circle right-[-150px] bottom-10" />

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
            Testimonials
          </span>

          <h2
            className="
              mt-6
              text-5xl
              lg:text-6xl
              font-black
            "
          >
            Loved By

            <span className="text-gradient">

              {" "}Our Players

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
            Hear what our community says about the RVS Pickleball
            experience, from beginners to competitive athletes.
          </p>

        </motion.div>

        {/* Cards */}

        <div
          className="
            mt-20
            grid
            gap-8
            md:grid-cols-2
            xl:grid-cols-3
          "
        >

          {testimonials.map((testimonial, index) => (

            <motion.div
              key={testimonial.name}
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
            >

              <TestimonialCard
                {...testimonial}
              />

            </motion.div>

          ))}

        </div>

      </Container>

    </section>
  );
}