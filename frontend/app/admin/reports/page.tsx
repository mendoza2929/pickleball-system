"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  Loader2,
  RefreshCcw,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import ReportStats
  from "@/components/reports/ReportStats";

import RevenueChart
  from "@/components/reports/RevenueChart";

import RevenueByCourt
  from "@/components/reports/RevenueByCourt";

import PaymentMethods
  from "@/components/reports/PaymentMethodsChart";

import PeakBookingHours
  from "@/components/reports/PeakBookingHours";

import {
  getReportOverview,
} from "@/services/report.service";

import type {
  ReportOverview,
} from "@/types/report";


export default function ReportsPage() {

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const firstDay =
    new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
      .toISOString()
      .split("T")[0];


  const [
    dateFrom,
    setDateFrom,
  ] = useState(firstDay);


  const [
    dateTo,
    setDateTo,
  ] = useState(today);


  const [
    report,
    setReport,
  ] = useState<ReportOverview | null>(
    null
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  const loadReport =
    async () => {

      try {

        setLoading(true);
        setError(null);

        const data =
          await getReportOverview({
            date_from:
              dateFrom,

            date_to:
              dateTo,
          });

        setReport(data);

      } catch (err: any) {

        console.error(
          "Failed to load report:",
          err
        );

        setError(
          err?.response?.data?.message ??
          "Failed to load report."
        );

      } finally {

        setLoading(false);

      }
    };


  useEffect(() => {
    loadReport();
  }, []);


  const handleApply =
    () => {

      if (
        !dateFrom ||
        !dateTo
      ) {
        return;
      }

      loadReport();
    };


  return (
    <div className="space-y-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        <div>

          <h1 className="text-2xl font-bold tracking-tight text-[#06131f]">
            Reports & Analytics
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor revenue, reservations, and court performance.
          </p>

        </div>


        {/* DATE FILTER */}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

          <div className="relative">

            <CalendarDays
              className="
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-slate-400
              "
            />

            <Input
              type="date"
              value={dateFrom}
              onChange={(event) =>
                setDateFrom(
                  event.target.value
                )
              }
              className="
                h-10
                border-slate-200
                bg-white
                pl-9
                text-[#06131f]
              "
            />

          </div>


          <span className="hidden text-sm text-slate-400 sm:block">
            to
          </span>


          <div className="relative">

            <CalendarDays
              className="
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-slate-400
              "
            />

            <Input
              type="date"
              value={dateTo}
              onChange={(event) =>
                setDateTo(
                  event.target.value
                )
              }
              className="
                h-10
                border-slate-200
                bg-white
                pl-9
                text-[#06131f]
              "
            />

          </div>


          <Button
            onClick={handleApply}
            disabled={loading}
            className="
              h-10
              bg-[#06131f]
              text-white
              hover:bg-[#0c2435]
            "
          >

            {loading ? (
              <Loader2
                className="
                  mr-2
                  h-4
                  w-4
                  animate-spin
                "
              />
            ) : (
              <RefreshCcw
                className="
                  mr-2
                  h-4
                  w-4
                "
              />
            )}

            Apply

          </Button>

        </div>

      </div>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (

        <div
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            p-4
            text-sm
            text-red-600
          "
        >
          {error}
        </div>

      )}


      {/* ================================================= */}
      {/* LOADING */}
      {/* ================================================= */}

      {loading && !report ? (

        <div
          className="
            flex
            min-h-[400px]
            items-center
            justify-center
          "
        >

          <Loader2
            className="
              h-8
              w-8
              animate-spin
              text-[#06131f]
            "
          />

        </div>

      ) : report ? (

        <>

          {/* ================================================= */}
          {/* STATS */}
          {/* ================================================= */}

          <ReportStats
            report={report}
          />


          {/* ================================================= */}
          {/* REVENUE */}
          {/* ================================================= */}

          <RevenueChart
            data={
              report.revenue_by_date
            }
          />


          {/* ================================================= */}
          {/* COURTS + PAYMENTS */}
          {/* ================================================= */}

          <div className="grid gap-6 lg:grid-cols-2">

            <RevenueByCourt
              data={
                report.revenue_by_court
              }
            />

            <PaymentMethods
              data={
                report.payment_methods
              }
            />

          </div>


          {/* ================================================= */}
          {/* PEAK HOURS */}
          {/* ================================================= */}

          <PeakBookingHours
            data={
              report.peak_hours
            }
          />

        </>

      ) : null}

    </div>
  );
}