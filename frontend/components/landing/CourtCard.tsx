"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

import {
  ArrowRight,
  MapPin,
  Users,
  Star,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type CourtCardProps = {

  name: string;

  image: string;

  type: string;

  location: string;

  available: boolean;

  rating: number;

  price: number;

  capacity: number;

  features: string[];

  delay?: number;
};

export default function CourtCard({

  name,
  image,
  type,
  location,
  available,
  rating,
  price,
  capacity,
  features,
  delay = 0,

}: CourtCardProps) {

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 70,
      }}

      whileInView={{
        opacity: 1,
        y: 0,
      }}

      viewport={{
        once: true,
      }}

      transition={{
        duration: .7,
        delay,
      }}

      whileHover={{
        y: -10,
      }}

      className="
      group
      overflow-hidden
      rounded-[30px]
      border
      border-white/10
      bg-slate-900/60
      backdrop-blur-xl
      shadow-xl
      transition-all
      duration-500
      hover:border-lime-400/40
      hover:shadow-[0_25px_70px_rgba(132,255,0,.18)]
      "

    >

      {/* IMAGE */}

      <div className="relative aspect-[16/10] overflow-hidden">

        <Image
          src={image}
          alt={name}
          fill
          className="
          object-cover
          transition-transform
          duration-700
          group-hover:scale-110
          "
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent" />

        {/* Availability */}

        <div
          className="
          absolute
          top-5
          left-5
          rounded-full
          bg-lime-400
          px-4
          py-2
          text-sm
          font-semibold
          text-slate-950
          "
        >
          {available ? "Available Now" : "Reserved"}
        </div>

        {/* Rating */}

        <div
          className="
          absolute
          right-5
          top-5
          flex
          items-center
          gap-1
          rounded-full
          bg-black/70
          px-3
          py-2
          text-white
          backdrop-blur
          "
        >

          <Star
            size={16}
            className="fill-yellow-400 text-yellow-400"
          />

          {rating}

        </div>

      </div>

      {/* CONTENT */}

      <div className="space-y-6 p-8">

        <div>

          <h3 className="text-3xl font-bold">

            {name}

          </h3>

          <p className="mt-2 text-lime-300">

            {type}

          </p>

        </div>

        <div className="space-y-3 text-slate-400">

          <div className="flex items-center gap-2">

            <MapPin size={18} />

            {location}

          </div>

          <div className="flex items-center gap-2">

            <Users size={18} />

            {capacity} Players

          </div>

        </div>

        {/* FEATURES */}

        <div className="flex flex-wrap gap-3">

          {features.map((item) => (

            <div

              key={item}

              className="
              flex
              items-center
              gap-2
              rounded-full
              border
              border-white/10
              bg-white/5
              px-3
              py-2
              text-sm
              text-slate-300
              "

            >

              <CheckCircle
                size={14}
                className="text-lime-400"
              />

              {item}

            </div>

          ))}

        </div>

        {/* PRICE */}

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-slate-500">

              Starting From

            </p>

            <h4 className="text-4xl font-black text-lime-400">

              ₱{price}

              <span className="text-lg text-white">

                /hour

              </span>

            </h4>

          </div>

          <Button
            className="
            hero-btn-primary
            rounded-full
            px-6
            "
            asChild
          >

            <Link href="/reservation" className="group">

              Reserve

              <ArrowRight
                className="
                ml-2
                h-5
                w-5
                transition-transform
                duration-300
                group-hover:translate-x-1
                "
              />

            </Link>

          </Button>

        </div>

      </div>

    </motion.div>
  );
}