"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  User,
  Lock,
  Loader2,
  Save,
  KeyRound,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "@/services/user.service";

import {
  usePathname,
} from "next/navigation";


// =====================================================
// TYPES
// =====================================================

interface Profile {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: string;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}


// =====================================================
// INPUT STYLES
// =====================================================

const inputClassName = `
  h-11
  w-full
  rounded-lg
  border
  border-slate-300
  bg-white
  px-3
  text-sm
  font-normal
  text-slate-900
  shadow-sm
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-[#06131f]
  focus:ring-2
  focus:ring-[#06131f]/10
  disabled:cursor-not-allowed
  disabled:border-slate-200
  disabled:bg-slate-50
  disabled:text-slate-500
`;


// =====================================================
// PAGE
// =====================================================

export default function AccountSettingsPage() {

  const pathname =
    usePathname();


  // ===================================================
  // PROFILE
  // ===================================================

  const [
    profile,
    setProfile,
  ] = useState<Profile | null>(null);


  const [
    firstName,
    setFirstName,
  ] = useState("");


  const [
    lastName,
    setLastName,
  ] = useState("");


  const [
    phone,
    setPhone,
  ] = useState("");


  // ===================================================
  // PASSWORD
  // ===================================================

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");


  const [
    newPassword,
    setNewPassword,
  ] = useState("");


  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");


  // ===================================================
  // STATES
  // ===================================================

  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false);


  const [
    savingPassword,
    setSavingPassword,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<string | null>(null);


  const [
    success,
    setSuccess,
  ] = useState<string | null>(null);


  // ===================================================
  // LOAD PROFILE
  // ===================================================

  useEffect(() => {

    const loadProfile =
      async () => {

        try {

          setLoading(true);

          setError(null);

          const data =
            await getMyProfile();

          setProfile(data);

          setFirstName(
            data.first_name ?? ""
          );

          setLastName(
            data.last_name ?? ""
          );

          setPhone(
            data.phone ?? ""
          );

        } catch (err: any) {

          console.error(
            "Failed to load profile:",
            err
          );

          setError(
            err?.response?.data?.message ??
            "Failed to load account information."
          );

        } finally {

          setLoading(false);

        }

      };


    loadProfile();

  }, []);


  // ===================================================
  // UPDATE PROFILE
  // ===================================================

  const handleProfileSave =
    async () => {

      if (!firstName.trim()) {

        setError(
          "First name is required."
        );

        setSuccess(null);

        return;
      }


      if (!lastName.trim()) {

        setError(
          "Last name is required."
        );

        setSuccess(null);

        return;
      }


      try {

        setSavingProfile(true);

        setError(null);

        setSuccess(null);


        const updated =
          await updateMyProfile({

            first_name:
              firstName.trim(),

            last_name:
              lastName.trim(),

            phone:
              phone.trim(),

          });


        setProfile(updated);

        setFirstName(
          updated.first_name ?? ""
        );

        setLastName(
          updated.last_name ?? ""
        );

        setPhone(
          updated.phone ?? ""
        );


        setSuccess(
          "Profile updated successfully."
        );

      } catch (err: any) {

        console.error(
          "Failed to update profile:",
          err
        );

        setError(
          err?.response?.data?.message ??
          "Failed to update profile."
        );

      } finally {

        setSavingProfile(false);

      }

    };


  // ===================================================
  // CHANGE PASSWORD
  // ===================================================

  const handlePasswordSave =
    async () => {

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {

        setError(
          "Please complete all password fields."
        );

        setSuccess(null);

        return;
      }


      if (newPassword.length < 8) {

        setError(
          "New password must be at least 8 characters."
        );

        setSuccess(null);

        return;
      }


      if (
        newPassword !==
        confirmPassword
      ) {

        setError(
          "New passwords do not match."
        );

        setSuccess(null);

        return;
      }


      try {

        setSavingPassword(true);

        setError(null);

        setSuccess(null);


        await changeMyPassword({

          current_password:
            currentPassword,

          new_password:
            newPassword,

          confirm_password:
            confirmPassword,

        });


        setCurrentPassword("");

        setNewPassword("");

        setConfirmPassword("");


        setSuccess(
          "Password changed successfully."
        );

      } catch (err: any) {

        console.error(
          "Failed to change password:",
          err
        );

        setError(
          err?.response?.data?.message ??
          "Failed to change password."
        );

      } finally {

        setSavingPassword(false);

      }

    };


  // ===================================================
  // LOADING
  // ===================================================

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


  // ===================================================
  // PAGE
  // ===================================================

  return (

    <div
      className="
        mx-auto
        max-w-6xl
        space-y-6
        pb-10
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
            gap-4
          "
        >

          <div
            className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-[#b7ff00]/20
            "
          >

            <User
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
              Account Settings
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Manage your profile and account security.
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
          flex-wrap
          gap-2
          border-b
          border-slate-200
          pb-3
        "
      >

        {/* GENERAL */}

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


        {/* BOOKING RULES */}

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


        {/* NOTIFICATIONS */}

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


        {/* ACCOUNT */}

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
          {success}
        </div>

      )}


      {/* ================================================= */}
      {/* PROFILE CARD */}
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

        {/* CARD HEADER */}

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
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-50
              text-blue-600
            "
          >

            <User
              className="h-5 w-5"
            />

          </div>


          <div>

            <h2
              className="
                text-base
                font-semibold
                text-slate-900
              "
            >
              Profile
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Update your personal information.
            </p>

          </div>

        </div>


        {/* PROFILE FORM */}

        <div
          className="
            grid
            gap-x-6
            gap-y-5
            p-6
            md:grid-cols-2
          "
        >

          {/* FIRST NAME */}

          <div>

            <label
              htmlFor="first_name"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-800
              "
            >
              First Name
            </label>

            <input
              id="first_name"
              type="text"
              value={firstName}
              onChange={(event) =>
                setFirstName(
                  event.target.value
                )
              }
              placeholder="Enter first name"
              autoComplete="given-name"
              className={inputClassName}
            />

          </div>


          {/* LAST NAME */}

          <div>

            <label
              htmlFor="last_name"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-800
              "
            >
              Last Name
            </label>

            <input
              id="last_name"
              type="text"
              value={lastName}
              onChange={(event) =>
                setLastName(
                  event.target.value
                )
              }
              placeholder="Enter last name"
              autoComplete="family-name"
              className={inputClassName}
            />

          </div>


          {/* USERNAME */}

          <div>

            <label
              htmlFor="username"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-800
              "
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={
                profile?.username ?? ""
              }
              disabled
              className={inputClassName}
            />

          </div>


          {/* EMAIL */}

          <div>

            <label
              htmlFor="email"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-800
              "
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={
                profile?.email ?? ""
              }
              disabled
              className={inputClassName}
            />

            <p
              className="
                mt-1.5
                text-xs
                text-slate-400
              "
            >
              Email changes are disabled for security.
            </p>

          </div>


          {/* PHONE */}

          <div>

            <label
              htmlFor="phone"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-800
              "
            >
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value
                )
              }
              placeholder="Enter phone number"
              autoComplete="tel"
              className={inputClassName}
            />

          </div>


          {/* ACCOUNT ROLE */}

          <div>

            <label
              htmlFor="account_role"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-800
              "
            >
              Account Role
            </label>

            <input
              id="account_role"
              type="text"
              value="Administrator"
              disabled
              className={inputClassName}
            />

            <p
              className="
                mt-1.5
                text-xs
                text-slate-400
              "
            >
              Account role can only be changed by another administrator.
            </p>

          </div>

        </div>


        {/* PROFILE FOOTER */}

        <div
          className="
            flex
            justify-end
            border-t
            border-slate-100
            px-6
            py-4
          "
        >

          <Button
            type="button"
            onClick={handleProfileSave}
            disabled={savingProfile}
            className="
              h-11
              rounded-xl
              bg-[#06131f]
              px-6
              text-white
              shadow-sm
              hover:bg-[#102433]
            "
          >

            {savingProfile ? (

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

            {savingProfile
              ? "Saving..."
              : "Save Profile"}

          </Button>

        </div>

      </section>


      {/* ================================================= */}
      {/* CHANGE PASSWORD CARD */}
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

        {/* CARD HEADER */}

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
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-amber-50
              text-amber-600
            "
          >

            <Lock
              className="h-5 w-5"
            />

          </div>


          <div>

            <h2
              className="
                text-base
                font-semibold
                text-slate-900
              "
            >
              Change Password
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Use a strong password to protect your administrator account.
            </p>

          </div>

        </div>


        {/* PASSWORD FORM */}

        <div
          className="
            grid
            gap-5
            p-6
            md:grid-cols-3
          "
        >

          {/* CURRENT PASSWORD */}

          <div>

            <label
              htmlFor="current_password"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-800
              "
            >
              Current Password
            </label>

            <input
              id="current_password"
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(
                  event.target.value
                )
              }
              placeholder="Current password"
              autoComplete="current-password"
              className={inputClassName}
            />

          </div>


          {/* NEW PASSWORD */}

          <div>

            <label
              htmlFor="new_password"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-800
              "
            >
              New Password
            </label>

            <input
              id="new_password"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(
                  event.target.value
                )
              }
              placeholder="New password"
              autoComplete="new-password"
              className={inputClassName}
            />

            <p
              className="
                mt-1.5
                text-xs
                text-slate-400
              "
            >
              Minimum 8 characters.
            </p>

          </div>


          {/* CONFIRM PASSWORD */}

          <div>

            <label
              htmlFor="confirm_password"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-800
              "
            >
              Confirm New Password
            </label>

            <input
              id="confirm_password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Confirm password"
              autoComplete="new-password"
              className={inputClassName}
            />

          </div>

        </div>


        {/* PASSWORD FOOTER */}

        <div
          className="
            flex
            justify-end
            border-t
            border-slate-100
            px-6
            py-4
          "
        >

          <Button
            type="button"
            onClick={handlePasswordSave}
            disabled={savingPassword}
            className="
              h-11
              rounded-xl
              bg-[#06131f]
              px-6
              text-white
              shadow-sm
              hover:bg-[#102433]
            "
          >

            {savingPassword ? (

              <Loader2
                className="
                  mr-2
                  h-4
                  w-4
                  animate-spin
                "
              />

            ) : (

              <KeyRound
                className="
                  mr-2
                  h-4
                  w-4
                "
              />

            )}

            {savingPassword
              ? "Updating..."
              : "Update Password"}

          </Button>

        </div>

      </section>

    </div>

  );
}