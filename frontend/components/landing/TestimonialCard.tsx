"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

interface TestimonialCardProps {
  image: string;
  name: string;
  role: string;
  review: string;
  rating: number;
}

export default function TestimonialCard({
  image,
  name,
  role,
  review,
  rating,
}: TestimonialCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -10,
        scale: 1.02,
      }}
      transition={{
        duration: 0.3,
      }}
      className="
        group
        relative
        h-full
        overflow-hidden
        rounded-[32px]
        border
        border-white/10
        bg-slate-900/60
        p-8
        backdrop-blur-xl
        transition-all
        duration-500
        hover:border-lime-400/40
        hover:shadow-[0_25px_70px_rgba(132,255,0,.18)]
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

      {/* Quote */}

      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-lime-400/10
          text-lime-400
        "
      >
        <Quote size={26} />
      </div>

      {/* Stars */}

      <div className="mt-6 flex gap-1">
        {Array.from({ length: rating }).map((_, index) => (
          <Star
            key={index}
            size={18}
            className="fill-yellow-400 text-yellow-400"
          />
        ))}
      </div>

      {/* Review */}

      <p
        className="
          mt-6
          leading-8
          text-slate-300
        "
      >
        "{review}"
      </p>

      {/* User */}

      <div className="mt-8 flex items-center gap-4">

        <div
          className="
            relative
            h-16
            w-16
            overflow-hidden
            rounded-full
            border-2
            border-lime-400/40
          "
        >
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        </div>

        <div>

          <h4 className="font-bold text-lg">

            {name}

          </h4>

          <p className="text-sm text-slate-400">

            {role}

          </p>

        </div>

      </div>
    </motion.div>
  );
}