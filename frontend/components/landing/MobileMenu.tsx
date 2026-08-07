"use client";

import { useEffect } from "react";
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

export default function MobileMenu({
  open,
  onOpenChange,
  activeSection,
}: MobileMenuProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
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

      <AnimatePresence>

        {open && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
              fixed
              inset-0
              z-[999]
              bg-black/60
              backdrop-blur-md
            "
          >

            {/* Panel */}

            <motion.aside
              initial={{
                x: "100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "100%",
              }}
              transition={{
                duration: .35,
                ease: "easeOut",
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
                bg-slate-950
                border-l
                border-white/10
              "
            >

              {/* Header */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-white/10
                  px-6
                  py-5
                "
              >

                <div>

                  <h2 className="text-xl font-black">

                    RVS Pickleball

                  </h2>

                  <p className="text-sm text-slate-400">

                    Premium Club

                  </p>

                </div>

                <button
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
                </button>

              </div>

              {/* Navigation */}

              <div
                className="
                  flex-1
                  overflow-y-auto
                  px-5
                  py-6
                "
              >

                <div className="space-y-5">

                  {navLinks.map((item, index) => {

                    const active =
                      activeSection ===
                      item.href.replace("#", "");

                    return (

                      <motion.div
                        key={item.href}
                        initial={{
                          opacity: 0,
                          x: 30,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: index * .06,
                        }}
                      >

                        <Link
                          href={item.href}
                          onClick={() => onOpenChange(false)}
                          className={`
                            flex
                            items-center
                            justify-between
                            rounded-2xl
                            border
                            px-5
                            py-5
                            transition-all
                            duration-300

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
                            className={
                              active
                                ? "text-lime-400"
                                : "text-slate-500"
                            }
                          />

                        </Link>

                      </motion.div>

                    );

                  })}

                </div>

              </div>

              {/* Footer */}

              <div
                className="
                  border-t
                  border-white/10
                  px-6
                  py-6
                "
              >

                <div
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

                </div>

                <Link
                  href="#reserve"
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
                    transition-all
                    duration-300
                    hover:scale-[1.02]
                    hover:bg-lime-300
                  "
                >

                  Reserve Court

                  <ArrowRight className="ml-2 h-5 w-5" />

                </Link>

              </div>

            </motion.aside>

          </motion.div>

        )}

      </AnimatePresence>
    </>
  );
}