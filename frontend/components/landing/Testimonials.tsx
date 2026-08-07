"use client";

import { motion } from "framer-motion";

import Container from "../common/Container";
import TestimonialCard from "./TestimonialCard";

const testimonials = [
  {
    image: "/images/players/player1.jpg",
    name: "John Angelo torres",
    role: "Advanced Player",
    rating: 5,
    review:
      "Maganda po yung court, nag kasya kame 5v5, thank you po satisfied kame.",
  },
  {
    image: "/images/players/player2.jpg",
    name: "Marlon Carpio",
    role: "Intermediate Player",
    rating: 5,
    review:
      "First time ko po mag pickle ball, buti mabait si kuya nag babantay tinuruan ako mag billiard .",
  },
  {
    image: "/images/players/player3.jpg",
    name: "Edward salcedo",
    role: "Tournament Player",
    rating: 3,
    review:
      "3 star lang, matagal kame nag hintay, 8am binook name, 3 hours kame nag wait, (3am kame pumunta).",
  },
  {
    image: "/images/players/player4.jpg",
    name: "Mario castañeda",
    role: "Beginner",
    rating: 1,
    review:
      "Wag na kayo pumunta dito guys, masyadong mainet, yung electric fan naka tutok lang sa matabang taga bantay.",
  },
  {
    image: "/images/players/player5.jpg",
    name: "Clyde jumlaie",
    role: "Professional Player",
    rating: 5,
    review:
      "Thank you po coach reuel, nag enjoy po kame ng family ko punta ka daw dito sa bahay minsan sabi ni mama .",
  },
  {
    image: "/images/players/player1.jpg",
    name: "Gefferson Omamalin",
    role: "Weekend Player",
    rating: 4,
    review:
      "4star po, kaso may nan ti trip sa parking lot, gas gas po motor ko pag uwe - .",
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