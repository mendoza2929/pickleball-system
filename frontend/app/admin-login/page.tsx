"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError(
        "Email and password are required."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post("/auth/login", {
          email,
          password,
        });

      const data = response.data;

      const accessToken =
        data?.data?.accessToken ??
        data?.accessToken;

      if (!accessToken) {
        throw new Error(
          "Login succeeded but no access token was returned."
        );
      }

      localStorage.setItem(
        "accessToken",
        accessToken
      );

      if (data?.data?.user) {
        localStorage.setItem(
          "adminUser",
          JSON.stringify(
            data.data.user
          )
        );
      }

      router.replace("/admin");

    } catch (error: any) {
      console.error(
        "Admin login failed:",
        error
      );

      setError(
        error?.response?.data?.message ??
          error?.message ??
          "Unable to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06131f]">

      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className="pointer-events-none absolute inset-0">

        {/* Lime glow */}

        <div className="absolute -left-[180px] -top-[180px] h-[550px] w-[550px] rounded-full bg-[#b7ff00]/10 blur-[120px]" />

        {/* Aqua glow */}

        <div className="absolute -bottom-[220px] -right-[150px] h-[600px] w-[600px] rounded-full bg-cyan-400/10 blur-[140px]" />

        {/* Center glow */}

        <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b7ff00]/[0.025] blur-[100px]" />

      </div>


      {/* ================================================= */}
      {/* SUBTLE GRID */}
      {/* ================================================= */}

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />


      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div className="relative flex min-h-screen items-center justify-center px-5 py-10">

        <div className="w-full max-w-[430px]">


          {/* ================================================= */}
          {/* BRAND */}
          {/* ================================================= */}

          <div className="mb-8 text-center">

            <div className="mx-auto mb-5 flex h-[92px] w-[92px] items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)]">

              <Image
                src="/images/Hero.png"
                alt="Rivers Pickleball"
                width={92}
                height={92}
                priority
                className="h-full w-full object-cover"
              />

            </div>


            <h1 className="text-[28px] font-bold tracking-[-0.04em] text-white">
              Rivers Pickleball
            </h1>


            <div className="mt-2 flex items-center justify-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-[#b7ff00]" />

              <p className="text-sm text-slate-400">
                Admin Management Portal
              </p>

            </div>

          </div>


          {/* ================================================= */}
          {/* LOGIN CARD */}
          {/* ================================================= */}

          <div className="rounded-[24px] border border-white/[0.09] bg-white/[0.055] p-2 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl">


            <div className="rounded-[18px] border border-white/[0.07] bg-[#0a1927]/95 p-7 sm:p-8">


              {/* Header */}

              <div className="mb-7">

                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#b7ff00]">
                  Welcome back
                </p>

                <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-white">
                  Sign in to your account
                </h2>

                <p className="mt-2 text-sm leading-5 text-slate-500">
                  Enter your administrator credentials
                  to continue.
                </p>

              </div>


              {/* Error */}

              {error && (
                <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3">

                  <p className="text-sm text-red-300">
                    {error}
                  </p>

                </div>
              )}


              {/* ================================================= */}
              {/* FORM */}
              {/* ================================================= */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >


                {/* Email */}

                <div className="space-y-2">

                  <label
                    htmlFor="email"
                    className="text-xs font-medium text-slate-300"
                  >
                    Email address
                  </label>


                  <div className="group relative">

                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-[#b7ff00]" />

                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-12 rounded-xl border-white/[0.08] bg-white/[0.035] pl-10 text-sm text-white placeholder:text-slate-600 shadow-none transition-all focus:border-[#b7ff00]/40 focus:bg-white/[0.055] focus-visible:ring-0"
                    />

                  </div>

                </div>


                {/* Password */}

                <div className="space-y-2">

                  <div className="flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-xs font-medium text-slate-300"
                    >
                      Password
                    </label>

                  </div>


                  <div className="group relative">

                    <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-[#b7ff00]" />

                    <Input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-12 rounded-xl border-white/[0.08] bg-white/[0.035] pl-10 pr-11 text-sm text-white placeholder:text-slate-600 shadow-none transition-all focus:border-[#b7ff00]/40 focus:bg-white/[0.055] focus-visible:ring-0"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 transition-colors hover:text-slate-300"
                    >

                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}

                    </button>

                  </div>

                </div>


                {/* ================================================= */}
                {/* SUBMIT */}
                {/* ================================================= */}

                <Button
                  type="submit"
                  disabled={loading}
                  className="group mt-2 h-12 w-full rounded-xl bg-[#b7ff00] font-semibold text-[#06131f] shadow-[0_8px_30px_rgba(183,255,0,0.12)] transition-all hover:bg-[#c7ff33] hover:shadow-[0_10px_35px_rgba(183,255,0,0.2)] disabled:opacity-60"
                >

                  <span>
                    {loading
                      ? "Signing in..."
                      : "Sign in"}
                  </span>

                  {!loading && (
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  )}

                </Button>

              </form>


              {/* ================================================= */}
              {/* SECURITY NOTE */}
              {/* ================================================= */}

              <div className="mt-7 flex items-center justify-center gap-2 border-t border-white/[0.06] pt-5">

                <LockKeyhole className="h-3.5 w-3.5 text-slate-600" />

                <p className="text-[11px] text-slate-600">
                  Secure administrator access
                </p>

              </div>

            </div>

          </div>


          {/* Footer */}

          <p className="mt-6 text-center text-[11px] text-slate-700">
            © {new Date().getFullYear()} Rivers Pickleball
          </p>

        </div>

      </div>

    </main>
  );
}