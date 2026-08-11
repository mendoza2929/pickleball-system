"use client";

import Link from "next/link";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Loader2,
  Save,
  Settings2,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  getBookingRules,
  updateBookingRules,
} from "@/services/settings.service";

import type {
  BookingRules,
} from "@/types/settings";


export default function BookingRulesPage() {

  const pathname =
    usePathname();


  // =====================================================
  // BOOKING RULES
  // =====================================================

  const [
    rules,
    setRules,
  ] = useState<BookingRules | null>(
    null
  );


  // =====================================================
  // FORM STATE
  // =====================================================

  const [
    minDuration,
    setMinDuration,
  ] = useState("1");


  const [
    maxDuration,
    setMaxDuration,
  ] = useState("2");


  const [
    interval,
    setInterval,
  ] = useState("30");


  const [
    advanceDays,
    setAdvanceDays,
  ] = useState("30");


  const [
    sameDay,
    setSameDay,
  ] = useState(true);


  const [
    allowCancellation,
    setAllowCancellation,
  ] = useState(true);


  const [
    cancellationDeadline,
    setCancellationDeadline,
  ] = useState("2");


  // =====================================================
  // UI STATE
  // =====================================================

  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  const [
    success,
    setSuccess,
  ] = useState(false);


  // =====================================================
  // LOAD BOOKING RULES
  // =====================================================

  const loadRules =
    async () => {

      try {

        setLoading(true);

        setError(null);

        const data =
          await getBookingRules();


        setRules(data);


        setMinDuration(
          String(
            data.min_booking_duration_hours
          )
        );


        setMaxDuration(
          String(
            data.max_booking_duration_hours
          )
        );


        setInterval(
          String(
            data.booking_interval_minutes
          )
        );


        setAdvanceDays(
          String(
            data.advance_booking_days
          )
        );


        setSameDay(
          data.allow_same_day_booking
        );


        setAllowCancellation(
          data.allow_cancellation
        );


        setCancellationDeadline(
          String(
            data.cancellation_deadline_hours
          )
        );

      } catch (err: any) {

        console.error(
          "Failed to load booking rules:",
          err
        );


        setError(
          err?.response?.data?.message ??
          "Failed to load booking rules."
        );

      } finally {

        setLoading(false);

      }
    };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadRules();

  }, []);


  // =====================================================
  // SAVE BOOKING RULES
  // =====================================================

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();


      const min =
        Number(minDuration);


      const max =
        Number(maxDuration);


      const intervalValue =
        Number(interval);


      const advance =
        Number(advanceDays);


      const deadline =
        Number(
          cancellationDeadline
        );


      // =================================================
      // VALIDATION
      // =================================================

      if (
        !Number.isFinite(min) ||
        !Number.isFinite(max) ||
        !Number.isFinite(intervalValue) ||
        !Number.isFinite(advance) ||
        !Number.isFinite(deadline)
      ) {

        setError(
          "Please enter valid booking rules."
        );

        return;
      }


      if (max < min) {

        setError(
          "Maximum booking duration must be greater than or equal to minimum duration."
        );

        return;
      }


      try {

        setSaving(true);

        setError(null);

        setSuccess(false);


        const data =
          await updateBookingRules({

            min_booking_duration_hours:
              min,

            max_booking_duration_hours:
              max,

            booking_interval_minutes:
              intervalValue,

            advance_booking_days:
              advance,

            allow_same_day_booking:
              sameDay,

            allow_cancellation:
              allowCancellation,

            cancellation_deadline_hours:
              deadline,

          });


        setRules(data);


        setMinDuration(
          String(
            data.min_booking_duration_hours
          )
        );


        setMaxDuration(
          String(
            data.max_booking_duration_hours
          )
        );


        setInterval(
          String(
            data.booking_interval_minutes
          )
        );


        setAdvanceDays(
          String(
            data.advance_booking_days
          )
        );


        setSameDay(
          data.allow_same_day_booking
        );


        setAllowCancellation(
          data.allow_cancellation
        );


        setCancellationDeadline(
          String(
            data.cancellation_deadline_hours
          )
        );


        setSuccess(true);


        window.setTimeout(() => {

          setSuccess(false);

        }, 3000);

      } catch (err: any) {

        console.error(
          "Failed to update booking rules:",
          err
        );


        setError(
          err?.response?.data?.message ??
          "Failed to update booking rules."
        );

      } finally {

        setSaving(false);

      }
    };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

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

    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div
      className="
        mx-auto
        max-w-5xl
        space-y-6
      "
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div>

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-[#b7ff00]/20
            "
          >

            <Settings2
              className="
                h-5
                w-5
                text-[#06131f]
              "
              strokeWidth={2}
            />

          </div>


          <div>

            <h1
              className="
                text-2xl
                font-bold
                tracking-tight
                text-[#06131f]
              "
            >
              Settings
            </h1>


            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Manage your business configuration.
            </p>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* SETTINGS NAVIGATION */}
      {/* ================================================= */}

      <div
        className="
          flex
          items-center
          gap-2
          border-b
          border-slate-200
          pb-3
        "
      >

        {/* ================================================= */}
        {/* GENERAL */}
        {/* ================================================= */}

        <Link
          href="/admin/settings"
          className={
            pathname === "/admin/settings"
              ? `
                rounded-lg
                bg-[#06131f]
                px-5
                py-2.5
                text-sm
                font-semibold
                !text-white
                shadow-sm
                transition-all
              `
              : `
                rounded-lg
                bg-white
                px-5
                py-2.5
                text-sm
                font-medium
                !text-slate-700
                ring-1
                ring-slate-200
                transition-all
                hover:bg-slate-100
                hover:!text-[#06131f]
              `
          }
        >
          General
        </Link>


        {/* ================================================= */}
        {/* BOOKING RULES */}
        {/* ================================================= */}

        <Link
          href="/admin/settings/booking-rules"
          className={
            pathname.startsWith(
              "/admin/settings/booking-rules"
            )
              ? `
                rounded-lg
                bg-[#06131f]
                px-5
                py-2.5
                text-sm
                font-semibold
                !text-white
                shadow-sm
                transition-all
              `
              : `
                rounded-lg
                bg-white
                px-5
                py-2.5
                text-sm
                font-medium
                !text-slate-700
                ring-1
                ring-slate-200
                transition-all
                hover:bg-slate-100
                hover:!text-[#06131f]
              `
          }
        >
          Booking Rules
        </Link>


        <Link
            href="/admin/settings/notifications"
            className={
            pathname.startsWith(
              "/admin/settings/notifications"
            )
              ? `
                rounded-lg
                bg-[#06131f]
                px-5
                py-2.5
                text-sm
                font-semibold
                !text-white
                shadow-sm
                transition-all
              `
              : `
                rounded-lg
                bg-white
                px-5
                py-2.5
                text-sm
                font-medium
                !text-slate-700
                ring-1
                ring-slate-200
                transition-all
                hover:bg-slate-100
                hover:!text-[#06131f]
              `
          }
            >
            Notifications
        </Link>

        
        <Link
          href="/admin/settings/account"
          className={
            pathname.startsWith(
              "/admin/settings/account"
            )
              ? `
                rounded-lg
                bg-[#06131f]
                px-5
                py-2.5
                text-sm
                font-semibold
                !text-white
                shadow-sm
                transition-all
              `
              : `
                rounded-lg
                bg-white
                px-5
                py-2.5
                text-sm
                font-medium
                !text-slate-700
                ring-1
                ring-slate-200
                transition-all
                hover:bg-slate-100
                hover:!text-[#06131f]
              `
          }
        >
          Account
        </Link>

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
            px-4
            py-3
            text-sm
            font-medium
            text-red-600
          "
        >
          {error}
        </div>

      )}


      {/* ================================================= */}
      {/* SUCCESS */}
      {/* ================================================= */}

      {success && (

        <div
          className="
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-green-200
            bg-green-50
            px-4
            py-3
            text-sm
            font-medium
            text-green-700
          "
        >

          <CheckCircle2
            className="h-4 w-4"
          />

          Booking rules updated successfully.

        </div>

      )}


      {/* ================================================= */}
      {/* FORM */}
      {/* ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >

        {/* ================================================= */}
        {/* BOOKING DURATION */}
        {/* ================================================= */}

        <div
          className="
            border-b
            border-slate-100
            p-6
          "
        >

          <div
            className="
              mb-6
              flex
              items-start
              gap-3
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-slate-100
              "
            >

              <Clock3
                className="
                  h-5
                  w-5
                  text-[#06131f]
                "
              />

            </div>


            <div>

              <h2
                className="
                  text-base
                  font-semibold
                  text-[#06131f]
                "
              >
                Booking Duration
              </h2>


              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                Define how long customers can reserve a court.
              </p>

            </div>

          </div>


          <div
            className="
              grid
              gap-6
              md:grid-cols-2
            "
          >

            {/* MINIMUM */}

            <div className="space-y-2">

              <label
                htmlFor="min_duration"
                className="
                  text-sm
                  font-medium
                  text-[#06131f]
                "
              >
                Minimum Duration
              </label>


              <div className="flex gap-2">

                <Input
                  id="min_duration"
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={minDuration}
                  onChange={(event) =>
                    setMinDuration(
                      event.target.value
                    )
                  }
                  className="
                    h-11
                    text-[#06131f]
                  "
                />


                <div
                  className="
                    flex
                    h-11
                    items-center
                    rounded-md
                    bg-slate-100
                    px-4
                    text-sm
                    text-slate-500
                  "
                >
                  hours
                </div>

              </div>

            </div>


            {/* MAXIMUM */}

            <div className="space-y-2">

              <label
                htmlFor="max_duration"
                className="
                  text-sm
                  font-medium
                  text-[#06131f]
                "
              >
                Maximum Duration
              </label>


              <div className="flex gap-2">

                <Input
                  id="max_duration"
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={maxDuration}
                  onChange={(event) =>
                    setMaxDuration(
                      event.target.value
                    )
                  }
                  className="
                    h-11
                    text-[#06131f]
                  "
                />


                <div
                  className="
                    flex
                    h-11
                    items-center
                    rounded-md
                    bg-slate-100
                    px-4
                    text-sm
                    text-slate-500
                  "
                >
                  hours
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* BOOKING WINDOW */}
        {/* ================================================= */}

        <div
          className="
            border-b
            border-slate-100
            p-6
          "
        >

          <div
            className="
              mb-6
              flex
              items-start
              gap-3
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-slate-100
              "
            >

              <CalendarClock
                className="
                  h-5
                  w-5
                  text-[#06131f]
                "
              />

            </div>


            <div>

              <h2
                className="
                  text-base
                  font-semibold
                  text-[#06131f]
                "
              >
                Booking Window
              </h2>


              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                Control when and how far ahead customers can book.
              </p>

            </div>

          </div>


          <div
            className="
              grid
              gap-6
              md:grid-cols-2
            "
          >

            {/* BOOKING INTERVAL */}

            <div className="space-y-2">

              <label
                htmlFor="interval"
                className="
                  text-sm
                  font-medium
                  text-[#06131f]
                "
              >
                Booking Interval
              </label>


              <div className="flex gap-2">

                <Input
                  id="interval"
                  type="number"
                  min="5"
                  max="120"
                  step="5"
                  value={interval}
                  onChange={(event) =>
                    setInterval(
                      event.target.value
                    )
                  }
                  className="
                    h-11
                    text-[#06131f]
                  "
                />


                <div
                  className="
                    flex
                    h-11
                    items-center
                    rounded-md
                    bg-slate-100
                    px-4
                    text-sm
                    text-slate-500
                  "
                >
                  minutes
                </div>

              </div>


              <p
                className="
                  text-xs
                  text-slate-400
                "
              >
                Example: 30 minutes allows 9:00, 9:30, 10:00, etc.
              </p>

            </div>


            {/* ADVANCE BOOKING */}

            <div className="space-y-2">

              <label
                htmlFor="advance_days"
                className="
                  text-sm
                  font-medium
                  text-[#06131f]
                "
              >
                Advance Booking Limit
              </label>


              <div className="flex gap-2">

                <Input
                  id="advance_days"
                  type="number"
                  min="0"
                  max="365"
                  step="1"
                  value={advanceDays}
                  onChange={(event) =>
                    setAdvanceDays(
                      event.target.value
                    )
                  }
                  className="
                    h-11
                    text-[#06131f]
                  "
                />


                <div
                  className="
                    flex
                    h-11
                    items-center
                    rounded-md
                    bg-slate-100
                    px-4
                    text-sm
                    text-slate-500
                  "
                >
                  days
                </div>

              </div>


              <p
                className="
                  text-xs
                  text-slate-400
                "
              >
                How many days ahead customers can make a reservation.
              </p>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* CANCELLATION */}
        {/* ================================================= */}

        <div
          className="
            border-b
            border-slate-100
            p-6
          "
        >

          <div className="mb-6">

            <h2
              className="
                text-base
                font-semibold
                text-[#06131f]
              "
            >
              Cancellation
            </h2>


            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Control whether customers can cancel their reservations.
            </p>

          </div>


          <div className="space-y-5">

            {/* ================================================= */}
            {/* SAME DAY BOOKING */}
            {/* ================================================= */}

            <label
              className="
                flex
                cursor-pointer
                items-center
                justify-between
                gap-4
                rounded-xl
                border
                border-slate-200
                p-4
                transition
                hover:bg-slate-50
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    font-semibold
                    text-[#06131f]
                  "
                >
                  Allow Same-Day Booking
                </p>


                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Customers can make a reservation for today.
                </p>

              </div>


              <input
                type="checkbox"
                checked={sameDay}
                onChange={(event) =>
                  setSameDay(
                    event.target.checked
                  )
                }
                className="
                  h-5
                  w-5
                  accent-[#b7ff00]
                "
              />

            </label>


            {/* ================================================= */}
            {/* ALLOW CANCELLATION */}
            {/* ================================================= */}

            <label
              className="
                flex
                cursor-pointer
                items-center
                justify-between
                gap-4
                rounded-xl
                border
                border-slate-200
                p-4
                transition
                hover:bg-slate-50
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    font-semibold
                    text-[#06131f]
                  "
                >
                  Allow Cancellation
                </p>


                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Allow customers to cancel their reservations.
                </p>

              </div>


              <input
                type="checkbox"
                checked={allowCancellation}
                onChange={(event) =>
                  setAllowCancellation(
                    event.target.checked
                  )
                }
                className="
                  h-5
                  w-5
                  accent-[#b7ff00]
                "
              />

            </label>


            {/* ================================================= */}
            {/* CANCELLATION DEADLINE */}
            {/* ================================================= */}

            {allowCancellation && (

              <div
                className="
                  max-w-sm
                  space-y-2
                "
              >

                <label
                  htmlFor="cancellation_deadline"
                  className="
                    text-sm
                    font-medium
                    text-[#06131f]
                  "
                >
                  Cancellation Deadline
                </label>


                <div className="flex gap-2">

                  <Input
                    id="cancellation_deadline"
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={cancellationDeadline}
                    onChange={(event) =>
                      setCancellationDeadline(
                        event.target.value
                      )
                    }
                    className="
                      h-11
                      text-[#06131f]
                    "
                  />


                  <div
                    className="
                      flex
                      h-11
                      items-center
                      rounded-md
                      bg-slate-100
                      px-4
                      text-sm
                      text-slate-500
                    "
                  >
                    hours before
                  </div>

                </div>


                <p
                  className="
                    text-xs
                    text-slate-400
                  "
                >
                  Example: 2 hours means cancellation is allowed until 2 hours before the booking.
                </p>

              </div>

            )}

          </div>

        </div>


        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div
          className="
            flex
            justify-end
            border-t
            border-slate-100
            p-6
          "
        >

          <Button
            type="submit"
            disabled={saving}
            className="
              h-10
              bg-[#06131f]
              px-5
              text-white
              hover:bg-[#0c2435]
            "
          >

            {saving ? (

              <Loader2
                className="
                  mr-2
                  h-4
                  w-4
                  animate-spin
                "
              />

            ) : (

              <Save
                className="
                  mr-2
                  h-4
                  w-4
                "
              />

            )}


            {saving
              ? "Saving..."
              : "Save Changes"}

          </Button>

        </div>

      </form>

    </div>
  );
}