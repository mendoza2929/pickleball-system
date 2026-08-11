"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  CalendarDays,
  LayoutDashboard,
  MapPin,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  BarChart3,
} from "lucide-react";

import Image from "next/image";

import { ReactNode } from "react";


interface AdminLayoutProps {
  children: ReactNode;
}


// ============================================================
// NAVIGATION
// ============================================================

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Reservations",
    href: "/admin/reservations",
    icon: CalendarDays,
  },
  {
    name: "Courts",
    href: "/admin/courts",
    icon: MapPin,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
    {
    name: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
];


// ============================================================
// ADMIN LAYOUT
// ============================================================

export default function AdminLayout({
  children,
}: AdminLayoutProps) {

  const pathname = usePathname();

  const router = useRouter();


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "adminUser"
    );

    router.replace(
      "/admin-login"
    );
  };


  // ==========================================================
  // ACTIVE NAVIGATION
  // ==========================================================

  const isActive = (
    href: string
  ) => {

    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };


  return (
    <div className="min-h-screen bg-slate-50">


      {/* ====================================================== */}
      {/* SIDEBAR */}
      {/* ====================================================== */}

      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[250px]
          flex-col
          border-r
          border-white/10
          bg-[#06131f]
          text-white
        "
      >


        {/* ================================================== */}
        {/* BRAND */}
        {/* ================================================== */}

        <div className="flex h-[88px] items-center border-b border-white/[0.08] px-5">

          <Link
            href="/admin"
            className="flex items-center gap-3"
          >

            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white shadow-lg">

              <Image
                src="/images/Hero.png"
                alt="Rivers Pickleball"
                fill
                priority
                className="object-cover"
              />

            </div>


            <div className="min-w-0">

              <p className="truncate text-[15px] font-bold tracking-tight text-white">
                Rivers Pickleball
              </p>

              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                Admin Portal
              </p>

            </div>

          </Link>

        </div>


        {/* ================================================== */}
        {/* NAVIGATION */}
        {/* ================================================== */}

        <div className="flex-1 overflow-y-auto px-3 py-6">


          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Management
          </p>


          <nav className="space-y-1">

            {navigation.map((item) => {

              const Icon = item.icon;

              const active =
                isActive(item.href);


              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group
                    relative
                    flex
                    h-11
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    text-sm
                    font-medium
                    transition-all
                    duration-200

                    ${
                      active
                        ? "bg-[#b7ff00] text-[#06131f] shadow-[0_8px_25px_rgba(183,255,0,0.12)]"
                        : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                    }
                  `}
                >

                  <Icon
                    className={`
                      h-[18px]
                      w-[18px]
                      shrink-0
                      transition-colors

                      ${
                        active
                          ? "text-[#06131f]"
                          : "text-slate-500 group-hover:text-[#b7ff00]"
                      }
                    `}
                    strokeWidth={1.8}
                  />


                  <span className="flex-1">
                    {item.name}
                  </span>


                  {active && (
                    <ChevronRight
                      className="h-4 w-4"
                      strokeWidth={2}
                    />
                  )}

                </Link>
              );

            })}

          </nav>

        </div>


        {/* ================================================== */}
        {/* BOTTOM NAVIGATION */}
        {/* ================================================== */}

        <div className="border-t border-white/[0.08] p-3">


          {/* Settings */}

          <Link
            href="/admin/settings"
            className={`
              flex
              h-11
              items-center
              gap-3
              rounded-xl
              px-3
              text-sm
              font-medium
              transition-colors

              ${
                isActive("/admin/settings")
                  ? "bg-white/[0.07] text-white"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
              }
            `}
          >

            <Settings
              className="h-[18px] w-[18px] text-slate-500"
              strokeWidth={1.8}
            />

            <span>
              Settings
            </span>

          </Link>


          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            className="
              mt-1
              flex
              h-11
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              text-sm
              font-medium
              text-slate-400
              transition-all
              hover:bg-red-500/10
              hover:text-red-300
            "
          >

            <LogOut
              className="h-[18px] w-[18px]"
              strokeWidth={1.8}
            />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>


      {/* ====================================================== */}
      {/* MAIN AREA */}
      {/* ====================================================== */}

      <div className="pl-[250px]">


        {/* ================================================== */}
        {/* TOP HEADER */}
        {/* ================================================== */}

        <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-7 backdrop-blur-xl">


          {/* Page title */}

          <div>

            <p className="text-sm font-semibold text-slate-900">
            
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              
            </p>

          </div>


          {/* Admin profile */}

          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-medium text-slate-800">
                Administrator
              </p>

              <p className="text-[11px] text-slate-400">
                Admin
              </p>

            </div>


            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#06131f] text-sm font-bold text-[#b7ff00] shadow-sm">
              A
            </div>

          </div>

        </header>


        {/* ================================================== */}
        {/* PAGE CONTENT */}
        {/* ================================================== */}

        <main className="min-h-[calc(100vh-72px)] px-6 py-6">
          {children}
        </main>

      </div>

    </div>
  );
}