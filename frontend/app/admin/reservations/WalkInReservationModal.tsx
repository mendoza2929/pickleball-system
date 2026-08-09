"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  User,
  X,
} from "lucide-react";

import {
  createWalkInReservation,
} from "@/lib/api/reservations";

import {
  getCourts,
  Court,
} from "@/lib/api/courts";

import {
  getReservationAvailability,
  AvailableSlot,
} from "@/lib/api/availability";

interface WalkInReservationModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

// ============================================================
// FORMAT TIME
// ============================================================

function formatTime(value: string) {
  if (!value) return "";

  const [hourString, minuteString] =
    value.slice(0, 5).split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  const period = hour >= 12 ? "PM" : "AM";

  const displayHour =
    hour % 12 === 0
      ? 12
      : hour % 12;

  return `${displayHour}:${String(
    minute
  ).padStart(2, "0")} ${period}`;
}

// ============================================================
// LOCAL DATE
// ============================================================

function getTodayDate() {
  const date = new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function WalkInReservationModal({
  open,
  onClose,
  onCreated,
}: WalkInReservationModalProps) {
  // ==========================================================
  // STATE
  // ==========================================================

  const [courts, setCourts] =
    useState<Court[]>([]);

  const [courtId, setCourtId] =
    useState("");

  const [reservationDate, setReservationDate] =
    useState("");

  const [durationHours, setDurationHours] =
    useState("1");

  const [availableSlots, setAvailableSlots] =
    useState<AvailableSlot[]>([]);

  const [selectedSlot, setSelectedSlot] =
    useState<AvailableSlot | null>(null);

  const [guestName, setGuestName] =
    useState("");

  const [guestPhone, setGuestPhone] =
    useState("");

  const [remarks, setRemarks] =
    useState("");

  const [loadingCourts, setLoadingCourts] =
    useState(false);

  const [loadingAvailability, setLoadingAvailability] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================================
  // TODAY
  // ==========================================================

  const today = useMemo(
    () => getTodayDate(),
    []
  );

  // ==========================================================
  // LOAD COURTS
  // ==========================================================

  useEffect(() => {
    if (!open) return;

    const loadCourts = async () => {
      try {
        setLoadingCourts(true);
        setError("");

        const data =
          await getCourts();

        const availableCourts = data.filter(
          (court) =>
            court.status === "Available"
        );

        setCourts(
          availableCourts
        );
      } catch (error) {
        console.error(
          "Failed to load courts:",
          error
        );

        setError(
          "Failed to load courts."
        );
      } finally {
        setLoadingCourts(false);
      }
    };

    loadCourts();
  }, [open]);

  // ==========================================================
  // LOAD AVAILABILITY
  // ==========================================================

  useEffect(() => {
    // --------------------------------------------------------
    // Nothing selected yet
    // --------------------------------------------------------

    if (
      !courtId ||
      !reservationDate
    ) {
      setAvailableSlots([]);
      setSelectedSlot(null);
      return;
    }

    let cancelled = false;

    const loadAvailability =
      async () => {
        try {
          setLoadingAvailability(
            true
          );

          setError("");

          // Always clear previously selected time
          setSelectedSlot(null);

          const result =
            await getReservationAvailability(
              Number(courtId),
              reservationDate,
              Number(durationHours)
            );

          // --------------------------------------------------
          // Prevent stale request from updating state
          // --------------------------------------------------

          if (cancelled) {
            return;
          }

          setAvailableSlots(
            result.available_slots ??
              []
          );
        } catch (error: any) {
          if (cancelled) {
            return;
          }

          console.error(
            "Failed to load availability:",
            error
          );

          setAvailableSlots([]);

          setError(
            error?.response?.data
              ?.message ||
              "Failed to load available times."
          );
        } finally {
          if (!cancelled) {
            setLoadingAvailability(
              false
            );
          }
        }
      };

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [
    courtId,
    reservationDate,
    durationHours,
  ]);

  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {
    setCourtId("");
    setReservationDate("");
    setDurationHours("1");

    setAvailableSlots([]);
    setSelectedSlot(null);

    setGuestName("");
    setGuestPhone("");
    setRemarks("");

    setError("");
  };

  // ==========================================================
  // CLOSE
  // ==========================================================

  const handleClose = () => {
    if (saving) return;

    resetForm();

    onClose();
  };

  // ==========================================================
  // SELECT COURT
  // ==========================================================

  const handleCourtChange = (
    value: string
  ) => {
    setCourtId(value);

    setAvailableSlots([]);
    setSelectedSlot(null);

    setError("");
  };

  // ==========================================================
  // SELECT DATE
  // ==========================================================

  const handleDateChange = (
    value: string
  ) => {
    setReservationDate(value);

    setAvailableSlots([]);
    setSelectedSlot(null);

    setError("");
  };

  // ==========================================================
  // SELECT DURATION
  // ==========================================================

  const handleDurationChange = (
    value: string
  ) => {
    setDurationHours(value);

    setAvailableSlots([]);
    setSelectedSlot(null);

    setError("");
  };

  // ==========================================================
  // SELECT TIME
  // ==========================================================

  const handleTimeSelect = (
    slot: AvailableSlot
  ) => {
    if (saving) return;

    setSelectedSlot(slot);

    setError("");
  };

  // ==========================================================
  // CREATE WALK-IN
  // ==========================================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");

    // --------------------------------------------------------
    // Court
    // --------------------------------------------------------

    if (!courtId) {
      setError(
        "Please select a court."
      );

      return;
    }

    // --------------------------------------------------------
    // Date
    // --------------------------------------------------------

    if (!reservationDate) {
      setError(
        "Please select a date."
      );

      return;
    }

    // --------------------------------------------------------
    // Time
    // --------------------------------------------------------

    if (!selectedSlot) {
      setError(
        "Please select an available time."
      );

      return;
    }

    // --------------------------------------------------------
    // Customer name
    // --------------------------------------------------------

    if (!guestName.trim()) {
      setError(
        "Customer name is required."
      );

      return;
    }

    // --------------------------------------------------------
    // Customer phone
    // --------------------------------------------------------

    if (!guestPhone.trim()) {
      setError(
        "Customer phone is required."
      );

      return;
    }

    try {
      setSaving(true);

      // ------------------------------------------------------
      // CREATE WALK-IN
      // ------------------------------------------------------

      await createWalkInReservation({
        court_id:
          Number(courtId),

        reservation_date:
          reservationDate,

        start_time:
          selectedSlot.start_time,

        end_time:
          selectedSlot.end_time,

        guest_name:
          guestName.trim(),

        guest_phone:
          guestPhone.trim(),

        remarks:
          remarks.trim() ||
          undefined,
      });

      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      resetForm();

      onCreated();

      onClose();
    } catch (error: any) {
      console.error(
        "Failed to create walk-in reservation:",
        error
      );

      setError(
        error?.response?.data
          ?.message ||
          "Failed to create walk-in reservation."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // CLOSED
  // ==========================================================

  if (!open) {
    return null;
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      {/* ======================================================
          OVERLAY
      ====================================================== */}

      <button
        type="button"
        aria-label="Close walk-in reservation"
        onClick={handleClose}
        className="
          fixed
          inset-0
          z-[80]
          bg-slate-950/30
          backdrop-blur-[2px]
        "
      />

      {/* ======================================================
          DRAWER
      ====================================================== */}

      <aside
        className="
          fixed
          inset-y-0
          right-0
          z-[90]
          flex
          w-full
          max-w-[500px]
          flex-col
          bg-white
          shadow-2xl
        "
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-slate-200
            px-6
            py-5
          "
        >
          <div>
            <p
              className="
                text-xs
                font-medium
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Admin
            </p>

            <h2
              className="
                mt-1
                text-lg
                font-semibold
                text-slate-900
              "
            >
              Walk-in Reservation
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              Create a reservation for a
              customer at the facility.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-400
              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ====================================================
            FORM
        ==================================================== */}

        <form
          onSubmit={handleSubmit}
          className="
            flex
            flex-1
            flex-col
            overflow-hidden
          "
        >
          {/* ==================================================
              CONTENT
          ================================================== */}

          <div
            className="
              flex-1
              overflow-y-auto
              px-6
              py-6
            "
          >
            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className="
                  mb-5
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-700
                "
              >
                {error}
              </div>
            )}

            {/* =================================================
                COURT
            ================================================= */}

            <section>
              <label
                className="
                  mb-2
                  block
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Court
              </label>

              <select
                value={courtId}
                onChange={(event) =>
                  handleCourtChange(
                    event.target.value
                  )
                }
                disabled={
                  loadingCourts ||
                  saving
                }
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  text-sm
                  text-slate-700
                  outline-none
                  focus:border-[#9bd900]
                  focus:ring-2
                  focus:ring-[#b7ff00]/20
                "
              >
                <option value="">
                  {loadingCourts
                    ? "Loading courts..."
                    : "Select court"}
                </option>

                {courts.map(
                  (court) => (
                    <option
                      key={court.id}
                      value={court.id}
                    >
                      {court.name}
                    </option>
                  )
                )}
              </select>
            </section>

            {/* =================================================
                DATE + DURATION
            ================================================= */}

            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
              "
            >
              {/* DATE */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Date
                </label>

                <div className="relative">
                  <CalendarDays
                    className="
                      pointer-events-none
                      absolute
                      left-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    type="date"
                    min={today}
                    value={
                      reservationDate
                    }
                    onChange={(event) =>
                      handleDateChange(
                        event.target
                          .value
                      )
                    }
                    disabled={saving}
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      pl-10
                      pr-3
                      text-sm
                      text-slate-700
                      outline-none
                      focus:border-[#9bd900]
                      focus:ring-2
                      focus:ring-[#b7ff00]/20
                    "
                  />
                </div>
              </div>

              {/* DURATION */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Duration
                </label>

                <select
                  value={
                    durationHours
                  }
                  onChange={(event) =>
                    handleDurationChange(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-sm
                    text-slate-700
                    outline-none
                    focus:border-[#9bd900]
                    focus:ring-2
                    focus:ring-[#b7ff00]/20
                  "
                >
                  <option value="1">
                    1 Hour
                  </option>

                  <option value="2">
                    2 Hours
                  </option>
                </select>
              </div>
            </div>

            {/* =================================================
                AVAILABLE TIMES
            ================================================= */}

            <section className="mt-6">
              <div
                className="
                  mb-3
                  flex
                  items-center
                  justify-between
                "
              >
                <label
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Available Times
                </label>

                {loadingAvailability && (
                  <span
                    className="
                      text-xs
                      text-slate-400
                    "
                  >
                    Checking...
                  </span>
                )}
              </div>

              {/* -----------------------------------------------
                  NO COURT / DATE
              ----------------------------------------------- */}

              {!courtId ||
              !reservationDate ? (
                <div
                  className="
                    rounded-xl
                    border
                    border-dashed
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-6
                    text-center
                  "
                >
                  <Clock3
                    className="
                      mx-auto
                      h-5
                      w-5
                      text-slate-300
                    "
                  />

                  <p
                    className="
                      mt-2
                      text-xs
                      text-slate-400
                    "
                  >
                    Select a court and date
                    to see available times.
                  </p>
                </div>
              ) : loadingAvailability ? (
                /* ---------------------------------------------
                   LOADING
                --------------------------------------------- */

                <div
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-6
                    text-center
                  "
                >
                  <div
                    className="
                      mx-auto
                      h-5
                      w-5
                      animate-spin
                      rounded-full
                      border-2
                      border-slate-200
                      border-t-[#b7ff00]
                    "
                  />

                  <p
                    className="
                      mt-2
                      text-xs
                      text-slate-400
                    "
                  >
                    Checking available times...
                  </p>
                </div>
              ) : availableSlots.length ===
                0 ? (
                /* ---------------------------------------------
                   NO TIMES
                --------------------------------------------- */

                <div
                  className="
                    rounded-xl
                    border
                    border-amber-200
                    bg-amber-50
                    px-4
                    py-6
                    text-center
                  "
                >
                  <Clock3
                    className="
                      mx-auto
                      h-5
                      w-5
                      text-amber-500
                    "
                  />

                  <p
                    className="
                      mt-2
                      text-sm
                      font-medium
                      text-amber-800
                    "
                  >
                    No available times
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-amber-600
                    "
                  >
                    Try another date or
                    duration.
                  </p>
                </div>
              ) : (
                /* ---------------------------------------------
                   AVAILABLE SLOTS
                --------------------------------------------- */

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-2
                  "
                >
                  {availableSlots.map(
                    (slot) => {
                      const selected =
                        selectedSlot
                          ?.start_time ===
                          slot.start_time &&
                        selectedSlot
                          ?.end_time ===
                          slot.end_time;

                      return (
                        <button
                          key={`${slot.start_time}-${slot.end_time}`}
                          type="button"
                          onClick={() =>
                            handleTimeSelect(
                              slot
                            )
                          }
                          disabled={saving}
                          className={
                            selected
                              ? `
                                rounded-xl
                                border
                                border-[#9bd900]
                                bg-[#b7ff00]/15
                                px-3
                                py-3
                                text-left
                                text-slate-900
                                ring-2
                                ring-[#b7ff00]/20
                              `
                              : `
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-3
                                py-3
                                text-left
                                text-slate-700
                                hover:border-slate-300
                                hover:bg-slate-50
                              `
                          }
                        >
                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >
                            <Clock3
                              className="
                                h-4
                                w-4
                                text-slate-400
                              "
                            />

                            <span
                              className="
                                text-sm
                                font-medium
                              "
                            >
                              {formatTime(
                                slot.start_time
                              )}

                              {" – "}

                              {formatTime(
                                slot.end_time
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </section>

            {/* =================================================
                CUSTOMER
            ================================================= */}

            <section className="mt-6">
              <p
                className="
                  mb-3
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Customer
              </p>

              <div className="space-y-3">
                {/* CUSTOMER NAME */}

                <div className="relative">
                  <User
                    className="
                      pointer-events-none
                      absolute
                      left-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    value={guestName}
                    onChange={(event) =>
                      setGuestName(
                        event.target
                          .value
                      )
                    }
                    placeholder="Customer name"
                    disabled={saving}
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      pl-10
                      pr-4
                      text-sm
                      text-slate-900
                      outline-none
                      placeholder:text-slate-400
                      focus:border-[#9bd900]
                      focus:ring-2
                      focus:ring-[#b7ff00]/20
                    "
                  />
                </div>

                {/* PHONE */}

                <input
                  value={guestPhone}
                  onChange={(event) =>
                    setGuestPhone(
                      event.target
                        .value
                    )
                  }
                  placeholder="Phone number"
                  disabled={saving}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-sm
                    text-slate-900
                    outline-none
                    placeholder:text-slate-400
                    focus:border-[#9bd900]
                    focus:ring-2
                    focus:ring-[#b7ff00]/20
                  "
                />

                {/* REMARKS */}

                <textarea
                  value={remarks}
                  onChange={(event) =>
                    setRemarks(
                      event.target
                        .value
                    )
                  }
                  placeholder="Remarks (optional)"
                  rows={3}
                  disabled={saving}
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-slate-900
                    outline-none
                    placeholder:text-slate-400
                    focus:border-[#9bd900]
                    focus:ring-2
                    focus:ring-[#b7ff00]/20
                  "
                />
              </div>
            </section>

            {/* =================================================
                WALK-IN NOTICE
            ================================================= */}

            <div
              className="
                mt-5
                rounded-xl
                border
                border-emerald-200
                bg-emerald-50
                px-4
                py-3
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-emerald-800
                "
              >
                Walk-in reservation
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-emerald-700
                "
              >
                This reservation will be
                automatically marked as
                Confirmed and Paid.
              </p>
            </div>
          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div
            className="
              flex
              gap-3
              border-t
              border-slate-200
              bg-white
              px-6
              py-4
            "
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="
                h-11
                flex-1
                rounded-xl
                border
                border-slate-200
                bg-white
                text-sm
                font-medium
                text-slate-700
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !courtId ||
                !reservationDate ||
                !selectedSlot ||
                !guestName.trim() ||
                !guestPhone.trim()
              }
              className="
                h-11
                flex-1
                rounded-xl
                bg-slate-900
                text-sm
                font-medium
                text-white
                transition
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving
                ? "Creating..."
                : "Create Walk-in"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}