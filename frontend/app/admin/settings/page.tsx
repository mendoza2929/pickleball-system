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
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Save,
  Settings2,
  Phone,
} from "lucide-react";

import {
  Input,
} from "@/components/ui/input";

import {
  Button,
} from "@/components/ui/button";

import {
  getGeneralSettings,
  updateGeneralSettings,
} from "@/services/settings.service";

import type {
  GeneralSettings,
} from "@/types/settings";


export default function SettingsPage() {

  const pathname =
    usePathname();


  // ==========================================================
  // SETTINGS
  // ==========================================================

  const [
    settings,
    setSettings,
  ] = useState<GeneralSettings | null>(
    null
  );


  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [
    businessName,
    setBusinessName,
  ] = useState("");


  const [
    contactNumber,
    setContactNumber,
  ] = useState("");


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    address,
    setAddress,
  ] = useState("");


  // ==========================================================
  // UI STATE
  // ==========================================================

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


  // ==========================================================
  // LOAD GENERAL SETTINGS
  // ==========================================================

  const loadSettings =
    async () => {

      try {

        setLoading(true);

        setError(null);

        const data =
          await getGeneralSettings();


        setSettings(data);


        setBusinessName(
          data.business_name ?? ""
        );


        setContactNumber(
          data.contact_number ?? ""
        );


        setEmail(
          data.email ?? ""
        );


        setAddress(
          data.address ?? ""
        );

      } catch (err: any) {

        console.error(
          "Failed to load settings:",
          err
        );


        setError(
          err?.response?.data?.message ??
          "Failed to load settings."
        );

      } finally {

        setLoading(false);

      }
    };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadSettings();

  }, []);


  // ==========================================================
  // SAVE GENERAL SETTINGS
  // ==========================================================

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();


      try {

        setSaving(true);

        setError(null);

        setSuccess(false);


        const data =
          await updateGeneralSettings({

            business_name:
              businessName.trim(),

            contact_number:
              contactNumber.trim(),

            email:
              email.trim(),

            address:
              address.trim(),

          });


        setSettings(data);


        setBusinessName(
          data.business_name ?? ""
        );


        setContactNumber(
          data.contact_number ?? ""
        );


        setEmail(
          data.email ?? ""
        );


        setAddress(
          data.address ?? ""
        );


        setSuccess(true);


        window.setTimeout(() => {

          setSuccess(false);

        }, 3000);

      } catch (err: any) {

        console.error(
          "Failed to update settings:",
          err
        );


        setError(
          err?.response?.data?.message ??
          "Failed to update settings."
        );

      } finally {

        setSaving(false);

      }
    };


  // ==========================================================
  // LOADING
  // ==========================================================

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


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div
      className="
        mx-auto
        max-w-5xl
        space-y-6
      "
    >

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

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


      {/* ================================================== */}
      {/* SETTINGS NAVIGATION */}
      {/* ================================================== */}

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


      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

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


      {/* ================================================== */}
      {/* SUCCESS */}
      {/* ================================================== */}

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

          General settings updated successfully.

        </div>

      )}


      {/* ================================================== */}
      {/* GENERAL INFORMATION */}
      {/* ================================================== */}

      <div
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
        {/* CARD HEADER */}
        {/* ================================================= */}

        <div
          className="
            border-b
            border-slate-100
            px-6
            py-5
          "
        >

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
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-slate-100
              "
            >

              <Building2
                className="
                  h-5
                  w-5
                  text-[#06131f]
                "
                strokeWidth={1.8}
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
                General Information
              </h2>


              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                Update the information displayed throughout the system.
              </p>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* FORM */}
        {/* ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="p-6"
        >

          <div
            className="
              grid
              gap-6
              md:grid-cols-2
            "
          >

            {/* ================================================= */}
            {/* BUSINESS NAME */}
            {/* ================================================= */}

            <div
              className="
                space-y-2
                md:col-span-2
              "
            >

              <label
                htmlFor="business_name"
                className="
                  text-sm
                  font-medium
                  text-[#06131f]
                "
              >
                Business Name
              </label>


              <div className="relative">

                <Building2
                  className="
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-slate-400
                  "
                  strokeWidth={1.8}
                />


                <Input
                  id="business_name"
                  value={businessName}
                  onChange={(event) =>
                    setBusinessName(
                      event.target.value
                    )
                  }
                  placeholder="Rivers Pickleball"
                  maxLength={150}
                  required
                  className="
                    h-11
                    border-slate-200
                    pl-10
                    text-[#06131f]
                  "
                />

              </div>

            </div>


            {/* ================================================= */}
            {/* CONTACT NUMBER */}
            {/* ================================================= */}

            <div
              className="space-y-2"
            >

              <label
                htmlFor="contact_number"
                className="
                  text-sm
                  font-medium
                  text-[#06131f]
                "
              >
                Contact Number
              </label>


              <div className="relative">

                <Phone
                  className="
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-slate-400
                  "
                  strokeWidth={1.8}
                />


                <Input
                  id="contact_number"
                  value={contactNumber}
                  onChange={(event) =>
                    setContactNumber(
                      event.target.value
                    )
                  }
                  placeholder="09XXXXXXXXX"
                  maxLength={30}
                  className="
                    h-11
                    border-slate-200
                    pl-10
                    text-[#06131f]
                  "
                />

              </div>

            </div>


            {/* ================================================= */}
            {/* EMAIL */}
            {/* ================================================= */}

            <div
              className="space-y-2"
            >

              <label
                htmlFor="email"
                className="
                  text-sm
                  font-medium
                  text-[#06131f]
                "
              >
                Email Address
              </label>


              <div className="relative">

                <Mail
                  className="
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-slate-400
                  "
                  strokeWidth={1.8}
                />


                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="contact@riverspickleball.com"
                  maxLength={150}
                  className="
                    h-11
                    border-slate-200
                    pl-10
                    text-[#06131f]
                  "
                />

              </div>

            </div>


            {/* ================================================= */}
            {/* ADDRESS */}
            {/* ================================================= */}

            <div
              className="
                space-y-2
                md:col-span-2
              "
            >

              <label
                htmlFor="address"
                className="
                  text-sm
                  font-medium
                  text-[#06131f]
                "
              >
                Business Address
              </label>


              <div className="relative">

                <MapPin
                  className="
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-slate-400
                  "
                  strokeWidth={1.8}
                />


                <Input
                  id="address"
                  value={address}
                  onChange={(event) =>
                    setAddress(
                      event.target.value
                    )
                  }
                  placeholder="Business address"
                  maxLength={255}
                  className="
                    h-11
                    border-slate-200
                    pl-10
                    text-[#06131f]
                  "
                />

              </div>

            </div>

          </div>


          {/* ================================================= */}
          {/* FORM FOOTER */}
          {/* ================================================= */}

          <div
            className="
              mt-8
              flex
              items-center
              justify-end
              border-t
              border-slate-100
              pt-6
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
                shadow-sm
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

    </div>
  );
}