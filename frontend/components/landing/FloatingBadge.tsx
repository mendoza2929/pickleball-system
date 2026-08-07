"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FloatingBadgeProps {
  icon: ReactNode;
  title: string;
  className?: string;
}

export default function FloatingBadge({
  icon,
  title,
  className = "",
}: FloatingBadgeProps) {
  return (
    <motion.div
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.08,
      }}
      className={`
        absolute
        flex
        items-center
        gap-2
        rounded-full
        border
        border-white/10
        bg-slate-900/80
        backdrop-blur-xl
        px-4
        py-2
        shadow-xl
        ${className}
      `}
    >
      <span className="text-lime-400">
        {icon}
      </span>

      <span className="text-sm font-medium">
        {title}
      </span>
    </motion.div>
  );
}