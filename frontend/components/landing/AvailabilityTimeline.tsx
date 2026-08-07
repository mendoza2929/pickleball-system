"use client";

import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";

const schedule = [
  { time: "08:00 AM", available: true },
  { time: "09:00 AM", available: true },
  { time: "10:00 AM", available: false },
  { time: "11:00 AM", available: false },
  { time: "12:00 PM", available: true },
  { time: "01:00 PM", available: true },
  { time: "02:00 PM", available: false },
  { time: "03:00 PM", available: true },
];

export default function AvailabilityTimeline() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 40,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: .7,
      }}
      className="
      rounded-[30px]
      border
      border-white/10
      bg-slate-900/60
      backdrop-blur-xl
      p-8
      "
    >
      <div className="flex items-center gap-3">

        <Clock3 className="text-lime-400" />

        <h2 className="text-2xl font-bold">

          Today's Schedule

        </h2>

      </div>

      <p className="mt-2 text-slate-400">

        Live availability updates.

      </p>

      <div className="mt-8 space-y-5">

        {schedule.map((slot, index) => (

          <motion.div
            key={slot.time}
            initial={{
              opacity: 0,
              x: 30,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: index * .08,
            }}
            className="
            flex
            items-center
            gap-5
            "
          >

            <div className="w-24 text-sm text-slate-400">

              {slot.time}

            </div>

            <div
              className="
              relative
              h-3
              flex-1
              overflow-hidden
              rounded-full
              bg-white/10
              "
            >
              <motion.div
                initial={{
                  width: 0,
                }}
                whileInView={{
                  width: slot.available ? "100%" : "45%",
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * .08,
                  duration: .7,
                }}
                className={`
                  absolute
                  inset-y-0
                  left-0
                  rounded-full

                  ${
                    slot.available
                      ? "bg-lime-400"
                      : "bg-red-500"
                  }
                `}
              />
            </div>

            <div
              className={`
              text-sm
              font-semibold

              ${
                slot.available
                  ? "text-lime-400"
                  : "text-red-400"
              }
              `}
            >
              {slot.available
                ? "Available"
                : "Occupied"}
            </div>

          </motion.div>

        ))}

      </div>
    </motion.div>
  );
}