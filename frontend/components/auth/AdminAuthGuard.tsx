"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

interface AdminAuthGuardProps {
  children: ReactNode;
}

export default function AdminAuthGuard({
  children,
}: AdminAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] =
    useState(true);

  useEffect(() => {
    const accessToken =
      localStorage.getItem("accessToken");

    const storedUser =
      localStorage.getItem("adminUser");

    // =====================================================
    // NO TOKEN
    // =====================================================

    if (!accessToken) {
      router.replace(
        `/admin-login?redirect=${encodeURIComponent(
          pathname
        )}`
      );

      return;
    }

    // =====================================================
    // NO USER DATA
    // =====================================================

    if (!storedUser) {
      localStorage.removeItem(
        "accessToken"
      );

      router.replace(
        "/admin-login"
      );

      return;
    }

    // =====================================================
    // CHECK USER
    // =====================================================

    try {
      const user =
        JSON.parse(storedUser);

      // ===================================================
      // ONLY OWNER / ADMIN
      // ===================================================

      const allowed =
        user.role_name === "Owner" ||
        user.role_name === "Admin";

      if (!allowed) {
        localStorage.removeItem(
          "accessToken"
        );

        localStorage.removeItem(
          "adminUser"
        );

        router.replace(
          "/admin-login"
        );

        return;
      }

      // ===================================================
      // AUTHENTICATED
      // ===================================================

      setChecking(false);

    } catch {
      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "adminUser"
      );

      router.replace(
        "/admin-login"
      );
    }
  }, [router, pathname]);

  // =======================================================
  // CHECKING ACCESS
  // =======================================================

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">

          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#b7ff00]" />

          <p className="text-sm text-slate-500">
            Checking access...
          </p>

        </div>
      </div>
    );
  }

  return <>{children}</>;
}