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
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "Availability",
    href: "#availability",
  },
  {
    label: "Gallery",
    href: "#gallery",
  },
  {
    label: "Tournaments",
    href: "#tournaments",
  },
  {
    label: "Testimonials",
    href: "#testimonials",
  },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

useEffect(() => {
  const sections = document.querySelectorAll("section[id]");

  console.log(sections);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        console.log(
          entry.target.id,
          entry.isIntersecting,
          entry.intersectionRatio
        );

        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  sections.forEach((section) => observer.observe(section));

  return () => observer.disconnect();
}, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`
          fixed
          inset-x-0
          top-0
          z-50
          transition-all
          duration-500
          ${
            scrolled
              ? "border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl shadow-xl"
              : "bg-transparent"
          }
        `}
      >
        <Container>

          <div className="flex h-20 items-center justify-between">

            {/* Logo */}

            <Logo />

            {/* Desktop Navigation */}

            <nav className="hidden items-center gap-8 xl:flex">

              {navLinks.map((item) => {

                const active =
                  activeSection === item.href.replace("#", "");

                return (

                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative
                      py-2
                      text-[15px]
                      font-medium
                      transition-all
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

            {/* Right */}

            <div className="flex items-center gap-4">

              {/* Desktop CTA */}


              {/* Mobile */}

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