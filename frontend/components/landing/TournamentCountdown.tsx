"use client";

import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";

const countdown = [
  {
    value: "12",
    label: "Days",
  },
  {
    value: "08",
    label: "Hours",
  },
  {
    value: "22",
    label: "Minutes",
  },
  {
    value: "15",
    label: "Seconds",
  },
];

export default function TournamentCountdown() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
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
      className="
        rounded-[30px]
        border
        border-white/10
        bg-slate-900/70
        backdrop-blur-xl
        p-8
      "
    >
      <div className="flex items-center gap-3">

        <CalendarDays className="text-lime-400" />

        <h3 className="text-2xl font-bold">

          Tournament Starts In

        </h3>

      </div>

      <div
        className="
          mt-8
          grid
          grid-cols-2
          gap-5
          sm:grid-cols-4
        "
      >
        {countdown.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: index * 0.12,
              duration: 0.5,
            }}
            whileHover={{
              scale: 1.05,
              y: -4,
            }}
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-5
              text-center
              transition-all
              duration-300
              hover:border-lime-400/40
              hover:bg-lime-400/10
            "
          >
            <motion.h2
              animate={{
                scale: [1, 1.06, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="
                text-4xl
                font-black
                text-lime-400
              "
            >
              {item.value}
            </motion.h2>

            <p
              className="
                mt-2
                text-sm
                uppercase
                tracking-widest
                text-slate-400
              "
            >
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div
        className="
          mt-8
          rounded-2xl
          border
          border-lime-400/20
          bg-lime-400/10
          p-4
          text-center
        "
      >
        <p className="text-sm text-lime-300">
          🏆 Registration closes one day before the tournament.
        </p>
      </div>
    </motion.div>
  );
}