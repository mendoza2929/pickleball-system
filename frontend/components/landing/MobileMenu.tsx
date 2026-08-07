"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSection: string;
}

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Courts", href: "#courts" },
  { label: "Features", href: "#features" },
  { label: "Availability", href: "#availability" },
  { label: "Gallery", href: "#gallery" },
  { label: "Tournaments", href: "#tournaments" },
  { label: "Testimonials", href: "#testimonials" },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: .08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    x: 25,
  },
  show: {
    opacity: 1,
    x: 0,
  },
};

export default function MobileMenu({
  open,
  onOpenChange,
  activeSection,
}: MobileMenuProps) {

  const pendingHref = useRef<string | null>(null);
  const scrollPosition = useRef(0);
useEffect(() => {
  if (open) {
    // Save the current scroll position
    scrollPosition.current = window.scrollY;

    // Lock the page in place
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  } else {
    // Restore the page
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";

    // Return to the previous scroll position
    window.scrollTo({
      top: scrollPosition.current,
      behavior: "auto",
    });
  }

  return () => {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
  };
}, [open]);
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () =>
      window.removeEventListener("keydown", handleEscape);
  }, [onOpenChange]);
const handleNavigate = (href: string) => {
  pendingHref.current = href;
  onOpenChange(false);
};
  return (
    <>
      {/* Hamburger */}

      <button
        onClick={() => onOpenChange(true)}
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          border
          border-white/10
          bg-white/5
          backdrop-blur-xl
          transition
          hover:bg-white/10
          lg:hidden
        "
      >
        <Menu size={22} />
      </button>

     <AnimatePresence
  mode="wait"
  onExitComplete={() => {
    if (!pendingHref.current) return;

    const id = pendingHref.current.replace("#", "");
    const section = document.getElementById(id);

    if (!section) return;

    const offset = 80;

    const top =
      section.getBoundingClientRect().top +
      window.scrollY -
      offset;

    window.scrollTo({
      top,
      behavior: "smooth",
    });

    pendingHref.current = null;
  }}
>
  {open && (
    <motion.div
      initial={{
        opacity: 0,
        backdropFilter: "blur(0px)",
      }}
      animate={{
        opacity: 1,
        backdropFilter: "blur(12px)",
      }}
      exit={{
        opacity: 0,
        backdropFilter: "blur(0px)",
      }}
      transition={{
        duration: 0.25,
      }}
      className="fixed inset-0 z-[999] bg-black/60"
      onClick={() => onOpenChange(false)}
    >
      <motion.aside
        onClick={(e) => e.stopPropagation()}
        initial={{
          x: "100%",
          scale: 0.98,
        }}
        animate={{
          x: 0,
          scale: 1,
        }}
        exit={{
          x: "100%",
          scale: 0.98,
        }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 30,
        }}
        className="
          absolute
          right-0
          top-0
          flex
          h-full
          w-full
          max-w-sm
          flex-col
          rounded-l-3xl
          border-l
          border-white/10
          bg-slate-950
          shadow-2xl
        "
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-black">
              RVS Pickleball
            </h2>

            <p className="text-sm text-slate-400">
              Premium Club
            </p>
          </div>

          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.9,
            }}
            onClick={() => onOpenChange(false)}
            className="
              rounded-xl
              border
              border-white/10
              p-2
              transition
              hover:bg-white/10
            "
          >
            <X size={22} />
          </motion.button>
        </div>

        {/* Navigation */}

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {navLinks.map((item) => {
              const active =
                activeSection ===
                item.href.replace("#", "");

              return (
                <motion.div
                  key={item.href}
                  variants={itemVariants}
                >
                  <Link
                    href={item.href}
                    onClick={() =>
                      handleNavigate(item.href)
                    }
                    className={`
                      group
                      flex
                      items-center
                      justify-between
                      rounded-2xl
                      border
                      px-5
                      py-5
                      transition-all
                      duration-300
                      active:scale-[0.98]

                      ${
                        active
                          ? "border-lime-400 bg-lime-400/10 text-lime-400"
                          : "border-white/10 bg-white/5 hover:border-lime-400/30 hover:bg-white/10"
                      }
                    `}
                  >
                    <span className="text-xl font-semibold">
                      {item.label}
                    </span>

                    <ChevronRight
                      size={20}
                      className={`
                        transition-transform
                        duration-300
                        group-hover:translate-x-1

                        ${
                          active
                            ? "text-lime-400"
                            : "text-slate-500"
                        }
                      `}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Footer */}

        <div className="border-t border-white/10 px-6 py-6">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.35,
            }}
            className="
              mb-5
              rounded-2xl
              border
              border-lime-400/20
              bg-lime-400/5
              p-4
            "
          >
            <p className="text-sm text-lime-400">
              🏓 Premium Pickleball Club
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Book • Play • Compete
            </p>
          </motion.div>

          <motion.div
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <Link
              href="/reservation"
              onClick={() => onOpenChange(false)}
              className="
                flex
                h-16
                items-center
                justify-center
                rounded-full
                bg-lime-400
                font-semibold
                text-slate-950
                transition-colors
                hover:bg-lime-300
              "
            >
              Reserve Court

              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </motion.aside>
    </motion.div>
  )}
</AnimatePresence>
    </>
  );
}