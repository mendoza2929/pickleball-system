"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Logo from "../common/Logo";
import Container from "../common/Container";
import MobileMenu from "./MobileMenu";

const navLinks = [
  {
    label: "Home",
    href: "#home",
  },
  {
    label: "Courts",
    href: "#courts",
  },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // =====================================================
  // ACTIVE SECTION
  // =====================================================

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          )[0];

        if (visibleSection) {
          setActiveSection(visibleSection.target.id);
        }
      },
      {
        threshold: [0.2, 0.4, 0.6],
        rootMargin: "-80px 0px -30% 0px",
      }
    );

    sections.forEach((section) =>
      observer.observe(section)
    );

    return () => observer.disconnect();
  }, []);

  // =====================================================
  // SCROLL
  // =====================================================

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <header
        className={`
          fixed
          inset-x-0
          top-0
          z-50
          transition-all
          duration-300
          ${
            scrolled
              ? `
                border-b
                border-white/10
                bg-slate-950/90
                backdrop-blur-xl
                shadow-lg
              `
              : "bg-transparent"
          }
        `}
      >
        <Container>
          <div className="flex h-20 items-center justify-between">
            {/* =================================================
                LOGO
            ================================================= */}

            <Link
              href="#home"
              className="shrink-0"
              onClick={() =>
                setActiveSection("home")
              }
            >
              <Logo />
            </Link>

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================= */}

            <nav className="hidden items-center gap-8 xl:flex">
              {navLinks.map((item) => {
                const sectionId =
                  item.href.replace("#", "");

                const active =
                  activeSection === sectionId;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative
                      py-2
                      text-[15px]
                      font-medium
                      transition-colors
                      duration-300

                      ${
                        active
                          ? "text-lime-400"
                          : "text-slate-300 hover:text-white"
                      }
                    `}
                  >
                    {item.label}

                    <span
                      className={`
                        absolute
                        left-0
                        -bottom-1
                        h-[2px]
                        rounded-full
                        bg-lime-400
                        transition-all
                        duration-300

                        ${
                          active
                            ? "w-full opacity-100"
                            : "w-0 opacity-0"
                        }
                      `}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div className="flex items-center gap-3">
              {/* =================================================
                  REGISTER CTA
              ================================================= */}

              <Link
                href="/register"
                className="
                  hidden
                  xl:inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-lime-400
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-950
                  shadow-lg
                  shadow-lime-400/10
                  transition-all
                  duration-300
                  hover:bg-lime-300
                  hover:shadow-lime-400/20
                  hover:-translate-y-0.5
                  active:translate-y-0
                "
              >
                Register to Play

                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 10H16M16 10L11 5M16 10L11 15"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>

              {/* =================================================
                  MOBILE MENU
              ================================================= */}

              <MobileMenu
                open={mobileOpen}
                onOpenChange={setMobileOpen}
                activeSection={activeSection}
              />
            </div>
          </div>
        </Container>
      </header>
    </>
  );
}