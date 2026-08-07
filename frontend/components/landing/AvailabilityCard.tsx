"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Users,
  Star,
  Clock3,
  CircleCheck,
  CircleX,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface AvailabilityCardProps {
  courtName: string;
  type: string;
  status: "available" | "occupied";
  price: number;
  capacity: number;
  rating: number;
  nextAvailable?: string;
}

export default function AvailabilityCard({
  courtName,
  type,
  status,
  price,
  capacity,
  rating,
  nextAvailable,
}: AvailabilityCardProps) {
  const available = status === "available";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50,
        scale: 0.95,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
      }}
      whileHover={{
        y: -10,
        scale: 1.02,
      }}
      className="
      group
      relative
      overflow-hidden
      rounded-[28px]
      border
      border-white/10
      bg-slate-900/60
      backdrop-blur-xl
      p-7
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
        group-hover:opacity-100
        transition-opacity
        duration-500
        bg-[radial-gradient(circle_at_top,rgba(132,255,0,.12),transparent_70%)]
        "
      />

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h3 className="text-2xl font-bold">

            {courtName}

          </h3>

          <p className="text-slate-400">

            {type}

          </p>

        </div>

        <motion.div
          animate={
            available
              ? {
                  scale: [1, 1.12, 1],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className={`
            flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold

            ${
              available
                ? "bg-lime-400/15 text-lime-400"
                : "bg-red-500/15 text-red-400"
            }
          `}
        >
          {available ? (
            <CircleCheck size={16} />
          ) : (
            <CircleX size={16} />
          )}

          {available ? "Available" : "Occupied"}
        </motion.div>

      </div>

      {/* Divider */}

      <div className="my-6 h-px bg-white/10" />

      {/* Info */}

      <div className="space-y-4">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <Users
              size={18}
              className="text-lime-400"
            />

            <span className="text-slate-300">

              {capacity} Players

            </span>

          </div>

          <div className="flex items-center gap-2">

            <Star
              size={18}
              className="fill-yellow-400 text-yellow-400"
            />

            <span>{rating}</span>

          </div>

        </div>

        <div className="flex items-center gap-2">

          <Clock3
            size={18}
            className="text-lime-400"
          />

          <span className="text-slate-300">

            {available
              ? "Available Now"
              : `Next Slot ${nextAvailable}`}

          </span>

        </div>

      </div>

      {/* Price */}

      <div className="mt-8">

        <p className="text-sm text-slate-500">

          Starting From

        </p>

        <h2 className="mt-1 text-4xl font-black text-lime-400">

          ₱{price}

          <span className="text-lg text-white">

            /hour

          </span>

        </h2>

      </div>

    
    </motion.div>
  );
}