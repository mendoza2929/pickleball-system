"use client";

import Link from "next/link";

import {
  ArrowUp,
  Clock3,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import Container from "../common/Container";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-slate-950">

      {/* Glow */}

      <div className="blur-circle left-[-180px] bottom-0" />

      <Container>

        <div className="py-20">

          <div className="grid gap-16 lg:grid-cols-5">

            {/* Brand */}

            <div className="lg:col-span-2">

              <div className="flex items-center gap-4">

                <div
                  className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-lime-400
                  text-xl
                  font-black
                  text-slate-950
                "
                >
                  R
                </div>

                <div>

                  <h2 className="text-2xl font-black">

                    RVS Pickleball

                  </h2>

                  <p className="text-sm text-slate-400">

                    Premium Pickleball Club

                  </p>

                </div>

              </div>

              <p
                className="
                mt-8
                max-w-md
                leading-8
                text-slate-400
              "
              >
                Experience premium pickleball courts,
                tournaments,
                coaching,
                and seamless online reservations.
              </p>

              {/* Social */}

              <div className="mt-8 flex gap-4">

                <Link
                  href="#"
                  className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  transition
                  hover:border-lime-400/40
                  hover:bg-lime-400/10
                "
                >
                  <FaFacebookF  size={20} />
                </Link>

                <Link
                  href="#"
                  className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  transition
                  hover:border-lime-400/40
                  hover:bg-lime-400/10
                "
                >
                  <FaInstagram  size={20} />
                </Link>

              </div>

            </div>

            {/* Navigation */}

            <div>

              <h3 className="text-lg font-bold">

                Navigation

              </h3>

              <div className="mt-6 space-y-4 text-slate-400">

                <Link href="/" className="block hover:text-lime-400">

                  Home

                </Link>

                <Link href="/courts" className="block hover:text-lime-400">

                  Courts

                </Link>

                <Link href="/reservation" className="block hover:text-lime-400">

                  Reservation

                </Link>

                <Link href="/tournaments" className="block hover:text-lime-400">

                  Tournament

                </Link>

              </div>

            </div>

            {/* Contact */}

            <div>

              <h3 className="text-lg font-bold">

                Contact

              </h3>

              <div className="mt-6 space-y-5 text-slate-400">

                <div className="flex gap-3">

                  <MapPin className="text-lime-400" size={18} />

                  <span>

                    Mercedes, Zamboanga City

                  </span>

                </div>

                <div className="flex gap-3">

                  <Phone className="text-lime-400" size={18} />

                  <span>

                    +63 912 345 6789

                  </span>

                </div>

                <div className="flex gap-3">

                  <Mail className="text-lime-400" size={18} />

                  <span>

                    info@rvspickleball.com

                  </span>

                </div>

              </div>

            </div>

            {/* Hours */}

            <div>

              <h3 className="text-lg font-bold">

                Opening Hours

              </h3>

              <div className="mt-6 space-y-4 text-slate-400">

                <div className="flex gap-3">

                  <Clock3
                    className="text-lime-400"
                    size={18}
                  />

                  <span>

                    Monday - Sunday

                  </span>

                </div>

                <p>

                  8:00 AM - 10:00 PM

                </p>

                <p>

                  Open Every Day

                </p>

              </div>

            </div>

          </div>

          {/* Bottom */}

          <div
            className="
            mt-20
            flex
            flex-col
            items-center
            justify-between
            gap-6
            border-t
            border-white/10
            pt-8
            md:flex-row
          "
          >

            <div className="space-y-1 text-center md:text-left">
                <p className="text-sm text-slate-500">
                    © {new Date().getFullYear()} RVS Pickleball Club. All rights reserved.
                </p>

                <p className="text-sm text-slate-400">
                    Designed & Developed by{" "}
                    <span
                    className="
                        font-semibold
                        text-lime-400
                        transition-colors
                        duration-300
                        hover:text-lime-300
                    "
                    >
                    Reuel S. Mendoza
                    </span>
                </p>
                </div>

            <Link
              href="#top"
              className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-lime-400
              text-slate-950
              transition
              hover:scale-110
            "
            >

              <ArrowUp size={20} />

            </Link>

          </div>

        </div>

      </Container>

    </footer>
  );
}