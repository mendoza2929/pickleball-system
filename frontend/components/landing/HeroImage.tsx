"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroImage() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 80,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      transition={{
        duration: 1,
        delay: 0.35,
        ease: "easeOut",
      }}
      whileHover={{
        scale: 1.04,
        rotateX: 8,
        rotateY: -8,
        transition: {
          duration: 0.35,
        },
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
      className="
        relative
        mx-auto
        w-full
        max-w-[650px]
      "
    >
      {/* Green Glow */}

      <div
        className="
          absolute
          inset-12
          rounded-full
          bg-lime-400/20
          blur-[120px]
          animate-pulse
          -z-20
        "
      />

      {/* Rotating Ring */}

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          absolute
          inset-5
          rounded-full
          border
          border-dashed
          border-lime-400/20
          -z-10
        "
      />

      {/* Floating Card */}

      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [0, 0.8, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          relative
          aspect-square
          overflow-hidden
          rounded-[38px]

          border
          border-white/10

          bg-white

          ring-1
          ring-white/10

          shadow-[0_45px_120px_rgba(0,0,0,.45)]
        "
      >
        {/* Animated Shine */}

        <motion.div
          animate={{
            x: ["-130%", "150%"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 2,
          }}
          className="
            absolute
            top-0
            left-0
            z-20

            h-full
            w-24

            rotate-12

            bg-white/20

            blur-xl
          "
        />

        {/* Glass Reflection */}

        <div
          className="
            absolute
            inset-0
            z-10

            bg-gradient-to-br
            from-white/40
            via-transparent
            to-transparent

            pointer-events-none
          "
        />

        {/* Logo */}

        <Image
          src="/images/Hero.png"
          alt="RVS Pickleball"
          fill
          priority
          draggable={false}
          className="
            object-contain
            p-6

            select-none
            pointer-events-none
          "
        />
      </motion.div>
    </motion.div>
  );
}