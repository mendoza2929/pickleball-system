"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Bell,
  CreditCard,
  Loader2,
  Mail,
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  XCircle,
  Save,
  ArrowLeft,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  getNotificationSettings,
  updateNotificationSettings,
} from "@/services/settings.service";

import type {
  NotificationSettings,
} from "@/types/settings";
import {
  usePathname,
} from "next/navigation";

// =====================================================
// NOTIFICATION ROW
// =====================================================

interface NotificationRowProps {

  icon: React.ReactNode;

  title: string;

  description: string;

  checked: boolean;

  onChange: (
    value: boolean
  ) => void;
}


function NotificationRow({
  icon,
  title,
  description,
  checked,
  onChange,
}: NotificationRowProps) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        gap-6
        border-b
        border-slate-100
        px-6
        py-5
        last:border-b-0
      "
    >

      <div className="flex min-w-0 items-center gap-4">

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
            text-slate-500
          "
        >
          {icon}
        </div>


        <div className="min-w-0">

          <p className="text-sm font-semibold text-slate-900">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>

        </div>

      </div>


      {/* SWITCH */}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() =>
          onChange(!checked)
        }
        className={`
          relative
          h-6
          w-11
          shrink-0
          rounded-full
          transition-colors
          duration-200
          focus:outline-none
          focus:ring-2
          focus:ring-[#b7ff00]/40
          ${
            checked
              ? "bg-[#b7ff00]"
              : "bg-slate-300"
          }
        `}
      >

        <span
          className={`
            absolute
            top-1/2
            h-5
            w-5
            -translate-y-1/2
            rounded-full
            bg-white
            shadow-sm
            transition-transform
            duration-200
            ${
              checked
                ? "translate-x-5"
                : "translate-x-0.5"
            }
          `}
        />

      </button>

    </div>
  );
}


// =====================================================
// PAGE
// =====================================================

export default function NotificationsSettingsPage() {
const pathname =
    usePathname();

  const [
    settings,
    setSettings,
  ] = useState<NotificationSettings | null>(
    null
  );


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
  ] = useState<string | null>(
    null
  );


  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {

    const loadSettings =
      async () => {

        try {

          setLoading(true);

          setError(null);

          const data =
            await getNotificationSettings();

          setSettings(data);

        } catch (err: any) {

          console.error(
            "Failed to load notification settings:",
            err
          );

          setError(
            err?.response?.data?.message ??
            "Failed to load notification settings."
          );

        } finally {

          setLoading(false);

        }

      };


    loadSettings();

  }, []);


  // =====================================================
  // UPDATE LOCAL VALUE
  // =====================================================

  const updateSetting = (
    key: keyof NotificationSettings,
    value: boolean
  ) => {

    setSettings(
      (current) => {

        if (!current) {
          return current;
        }

        return {
          ...current,
          [key]: value,
        };

      }
    );

    setSuccess(null);

  };


  // =====================================================
  // SAVE
  // =====================================================

  const handleSave =
    async () => {

      if (!settings) {
        return;
      }


      try {

        setSaving(true);

        setError(null);

        setSuccess(null);


        const updated =
          await updateNotificationSettings({

            reservation_created_admin:
              settings.reservation_created_admin,

            reservation_confirmed_customer:
              settings.reservation_confirmed_customer,

            reservation_cancelled_customer:
              settings.reservation_cancelled_customer,

            reservation_completed_customer:
              settings.reservation_completed_customer,

            payment_submitted_admin:
              settings.payment_submitted_admin,

            payment_approved_customer:
              settings.payment_approved_customer,

            payment_rejected_customer:
              settings.payment_rejected_customer,

          });


        setSettings(updated);

        setSuccess(
          "Notification settings saved successfully."
        );

      } catch (err: any) {

        console.error(
          "Failed to save notification settings:",
          err
        );

        setError(
          err?.response?.data?.message ??
          "Failed to save notification settings."
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
          min-h-[500px]
          items-center
          justify-center
        "
      >

        <Loader2
          className="
            h-8
            w-8
            animate-spin
            text-slate-400
          "
        />

      </div>

    );

  }


  return (

    <div className="mx-auto max-w-6xl space-y-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div>

        <div className="flex items-center gap-4">

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-[#b7ff00]/20
            "
          >

            <Bell
              className="
                h-7
                w-7
                text-[#06131f]
              "
              strokeWidth={1.8}
            />

          </div>


          <div>

            <h1
              className="
                text-2xl
                font-semibold
                tracking-tight
                text-slate-900
              "
            >
              Notification Settings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Choose which notifications should be sent
              to administrators and customers.
            </p>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* SETTINGS TABS */}
      {/* ================================================= */}

      <div
        className="
          flex
          gap-2
          border-b
          border-slate-200
          pb-3
        "
      >

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
            rounded-xl
            border
            border-green-200
            bg-green-50
            px-4
            py-3
            text-sm
            text-green-700
          "
        >
          {success}
        </div>

      )}


      {settings && (

        <>

          {/* ================================================= */}
          {/* RESERVATIONS */}
          {/* ================================================= */}

          <section
            className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm
            "
          >

            <div
              className="
                flex
                items-center
                gap-4
                border-b
                border-slate-100
                px-6
                py-5
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
                  bg-blue-50
                  text-blue-600
                "
              >

                <CalendarCheck
                  className="h-5 w-5"
                />

              </div>


              <div>

                <h2 className="text-base font-semibold text-slate-900">
                  Reservation Notifications
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Control notifications related to
                  reservation activity.
                </p>

              </div>

            </div>


            <NotificationRow

              icon={
                <Mail className="h-5 w-5" />
              }

              title="New Reservation"

              description="Notify administrators when a new reservation is created."

              checked={
                settings.reservation_created_admin
              }

              onChange={(value) =>
                updateSetting(
                  "reservation_created_admin",
                  value
                )
              }

            />


            <NotificationRow

              icon={
                <CheckCircle2 className="h-5 w-5" />
              }

              title="Reservation Confirmed"

              description="Notify customers when their reservation is confirmed."

              checked={
                settings.reservation_confirmed_customer
              }

              onChange={(value) =>
                updateSetting(
                  "reservation_confirmed_customer",
                  value
                )
              }

            />


            <NotificationRow

              icon={
                <XCircle className="h-5 w-5" />
              }

              title="Reservation Cancelled"

              description="Notify customers when their reservation is cancelled."

              checked={
                settings.reservation_cancelled_customer
              }

              onChange={(value) =>
                updateSetting(
                  "reservation_cancelled_customer",
                  value
                )
              }

            />


            <NotificationRow

              icon={
                <CalendarX className="h-5 w-5" />
              }

              title="Reservation Completed"

              description="Notify customers when their reservation has been completed."

              checked={
                settings.reservation_completed_customer
              }

              onChange={(value) =>
                updateSetting(
                  "reservation_completed_customer",
                  value
                )
              }

            />

          </section>


          {/* ================================================= */}
          {/* PAYMENTS */}
          {/* ================================================= */}

          <section
            className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm
            "
          >

            <div
              className="
                flex
                items-center
                gap-4
                border-b
                border-slate-100
                px-6
                py-5
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
                  bg-emerald-50
                  text-emerald-600
                "
              >

                <CreditCard
                  className="h-5 w-5"
                />

              </div>


              <div>

                <h2 className="text-base font-semibold text-slate-900">
                  Payment Notifications
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Control notifications related to payment activity.
                </p>

              </div>

            </div>


            <NotificationRow

              icon={
                <Mail className="h-5 w-5" />
              }

              title="Payment Submitted"

              description="Notify administrators when a customer submits payment proof."

              checked={
                settings.payment_submitted_admin
              }

              onChange={(value) =>
                updateSetting(
                  "payment_submitted_admin",
                  value
                )
              }

            />


            <NotificationRow

              icon={
                <CheckCircle2 className="h-5 w-5" />
              }

              title="Payment Approved"

              description="Notify customers when their payment is approved."

              checked={
                settings.payment_approved_customer
              }

              onChange={(value) =>
                updateSetting(
                  "payment_approved_customer",
                  value
                )
              }

            />


            <NotificationRow

              icon={
                <XCircle className="h-5 w-5" />
              }

              title="Payment Rejected"

              description="Notify customers when their payment is rejected."

              checked={
                settings.payment_rejected_customer
              }

              onChange={(value) =>
                updateSetting(
                  "payment_rejected_customer",
                  value
                )
              }

            />

          </section>


          {/* ================================================= */}
          {/* SAVE */}
          {/* ================================================= */}

          <div
            className="
              flex
              items-center
              justify-between
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-6
              py-5
              shadow-sm
            "
          >

            <div>

              <p className="text-sm font-medium text-slate-900">
                Notification preferences
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Changes will apply to future notifications.
              </p>

            </div>


            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="
                bg-[#06131f]
                text-white
                hover:bg-[#102433]
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

        </>

      )}

    </div>

  );
}