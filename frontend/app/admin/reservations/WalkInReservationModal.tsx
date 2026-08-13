"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  CalendarDays,
  Check,
  Clock3,
  Search,
  User,
  UserPlus,
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

import {
  getCustomers,
  createCustomer,
  Customer,
} from "@/lib/api/customers";

interface WalkInReservationModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

// ============================================================
// FORMAT TIME
// ============================================================

function normalizeTime(value: string) {
  return value?.slice(0, 5) ?? "";
}

function timeToMinutes(value: string) {
  const normalized = normalizeTime(value);
  const [hour, minute] = normalized
    .split(":")
    .map(Number);

  return hour * 60 + minute;
}

function formatTime(value: string) {
  if (!value) return "";

  const [hourString, minuteString] =
    normalizeTime(value).split(":");

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

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ============================================================
// COMPONENT
// ============================================================

export default function WalkInReservationModal({
  open,
  onClose,
  onCreated,
}: WalkInReservationModalProps) {
  // ==========================================================
  // COURTS
  // ==========================================================

  const [courts, setCourts] =
    useState<Court[]>([]);

  const [courtId, setCourtId] =
    useState("");

  // ==========================================================
  // CUSTOMERS
  // ==========================================================

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [customerId, setCustomerId] =
    useState("");

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [customerDropdownOpen, setCustomerDropdownOpen] =
    useState(false);

  const customerDropdownRef =
    useRef<HTMLDivElement>(null);

  const [loadingCustomers, setLoadingCustomers] =
    useState(false);

  // ==========================================================
  // CREATE CUSTOMER
  // ==========================================================

  const [showCreateCustomer, setShowCreateCustomer] =
    useState(false);

  const [creatingCustomer, setCreatingCustomer] =
    useState(false);

  const [newCustomer, setNewCustomer] =
    useState({
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
    });

  // ==========================================================
  // RESERVATION
  // ==========================================================

  const [reservationDate, setReservationDate] =
    useState("");

  const [durationHours, setDurationHours] =
    useState("1");

  const [availableSlots, setAvailableSlots] =
    useState<AvailableSlot[]>([]);

  // Multiple time slots can be selected for a walk-in reservation.
  // The selected slots must be consecutive.
  const [selectedSlots, setSelectedSlots] =
    useState<AvailableSlot[]>([]);

  // ==========================================================
  // REMARKS
  // ==========================================================

  const [remarks, setRemarks] =
    useState("");

  // ==========================================================
  // LOADING
  // ==========================================================

  const [loadingCourts, setLoadingCourts] =
    useState(false);

  const [loadingAvailability, setLoadingAvailability] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  // ==========================================================
  // ERROR
  // ==========================================================

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

        const data = await getCourts();

        const availableCourts =
          data.filter(
            (court) =>
              court.status === "Available"
          );

        setCourts(availableCourts);
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
  // LOAD CUSTOMERS
  // ==========================================================

  useEffect(() => {
    if (!open) return;

    const loadCustomers = async () => {
      try {
        setLoadingCustomers(true);
        setError("");

        const result =
          await getCustomers({
            page: 1,
            limit: 100,
            search:
              customerSearch.trim() ||
              undefined,
          });

        // Backend:
        //
        // data: {
        //   customers: [],
        //   pagination: {}
        // }

        setCustomers(
          result.customers ?? []
        );
      } catch (error) {
        console.error(
          "Failed to load customers:",
          error
        );

        setError(
          "Failed to load customers."
        );
      } finally {
        setLoadingCustomers(false);
      }
    };

    const timer = setTimeout(
      loadCustomers,
      300
    );

    return () => {
      clearTimeout(timer);
    };
  }, [
    open,
    customerSearch,
  ]);

  // ==========================================================
  // ==========================================================
  // CLOSE CUSTOMER DROPDOWN WHEN CLICKING OUTSIDE
  // ==========================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setCustomerDropdownOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // LOAD AVAILABILITY
  // ==========================================================

  useEffect(() => {
    if (
      !courtId ||
      !reservationDate
    ) {
      setAvailableSlots([]);
      setSelectedSlots([]);
      return;
    }

    let cancelled = false;

    const loadAvailability =
      async () => {
        try {
          setLoadingAvailability(true);
          setError("");
          setSelectedSlots([]);

          const result =
            await getReservationAvailability(
              Number(courtId),
              reservationDate,
              1
            );

          if (cancelled) {
            return;
          }

          setAvailableSlots(
            result.available_slots ?? []
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
  ]);

  // ==========================================================
  // RESET
  // ==========================================================

  const resetForm = () => {
    setCourtId("");

    setCustomerId("");

    setCustomerSearch("");

    setCustomerDropdownOpen(false);

    setShowCreateCustomer(false);

    setCreatingCustomer(false);

    setNewCustomer({
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
    });

    setReservationDate("");

    setDurationHours("1");

    setAvailableSlots([]);

    setSelectedSlots([]);

    setRemarks("");

    setError("");
  };

  // ==========================================================
  // CLOSE
  // ==========================================================

  const handleClose = () => {
    if (
      saving ||
      creatingCustomer
    ) {
      return;
    }

    resetForm();

    onClose();
  };

  // ==========================================================
  // COURT
  // ==========================================================

  const handleCourtChange = (
    value: string
  ) => {
    setCourtId(value);

    setAvailableSlots([]);

    setSelectedSlots([]);

    setError("");
  };

  // ==========================================================
  // DATE
  // ==========================================================

  const handleDateChange = (
    value: string
  ) => {
    setReservationDate(value);

    setAvailableSlots([]);

    setSelectedSlots([]);

    setError("");
  };

  // ==========================================================
  // DURATION
  // ==========================================================

  const handleDurationChange = (
    value: string
  ) => {
    // Duration is now calculated from the selected
    // one-hour time slots. Keep this handler only
    // for compatibility with existing form state.
    setDurationHours(value);
    setSelectedSlots([]);
    setError("");
  };

  // ==========================================================
  // CUSTOMER
  // ==========================================================

  const handleCustomerChange = (
    value: string
  ) => {
    setCustomerId(value);

    setCustomerDropdownOpen(false);

    setError("");
  };

  // ==========================================================
  // TIME
  // ==========================================================

  const handleTimeSelect = (
    slot: AvailableSlot
  ) => {
    if (saving || creatingCustomer) return;

    const slotStart = timeToMinutes(slot.start_time);
    const slotEnd = timeToMinutes(slot.end_time);

    setError("");

    setSelectedSlots((current) => {
      const exists = current.some(
        (item) =>
          timeToMinutes(item.start_time) ===
            slotStart &&
          timeToMinutes(item.end_time) ===
            slotEnd
      );

      // Clicking an already-selected slot removes it.
      if (exists) {
        return current.filter(
          (item) =>
            !(
              timeToMinutes(item.start_time) ===
                slotStart &&
              timeToMinutes(item.end_time) ===
                slotEnd
            )
        );
      }

      // First slot.
      if (current.length === 0) {
        return [slot];
      }

      const sorted = [...current].sort(
        (a, b) =>
          timeToMinutes(a.start_time) -
          timeToMinutes(b.start_time)
      );

      const firstStart = timeToMinutes(
        sorted[0].start_time
      );

      const lastEnd = timeToMinutes(
        sorted[sorted.length - 1].end_time
      );

      // Add only when the new slot directly touches
      // either end of the current continuous range.
      const touchesStart =
        slotEnd === firstStart;

      const touchesEnd =
        slotStart === lastEnd;

      if (touchesStart || touchesEnd) {
        return [...current, slot].sort(
          (a, b) =>
            timeToMinutes(a.start_time) -
            timeToMinutes(b.start_time)
        );
      }

      setError(
        "Select consecutive time slots. You cannot skip an unavailable time."
      );

      return current;
    });
  };

  // ==========================================================
  // OPEN CREATE CUSTOMER
  // ==========================================================

  const handleOpenCreateCustomer = () => {
    setError("");

    setCustomerDropdownOpen(false);

    const search =
      customerSearch.trim();

    // If the admin searched a full name,
    // try to pre-fill the first/last name.

    const parts =
      search.split(/\s+/);

    let firstName = "";
    let lastName = "";

    if (parts.length === 1) {
      firstName = parts[0] ?? "";
    }

    if (parts.length >= 2) {
      firstName = parts[0] ?? "";

      lastName =
        parts.slice(1).join(" ");
    }

    setNewCustomer({
      first_name: firstName,
      last_name: lastName,
      phone: "",
      email: "",
    });

    setShowCreateCustomer(true);
  };

  // ==========================================================
  // CREATE CUSTOMER
  // ==========================================================

  const handleCreateCustomer =
    async () => {
      setError("");

      const firstName =
        newCustomer.first_name.trim();

      const lastName =
        newCustomer.last_name.trim();

      const phone =
        newCustomer.phone.trim();

      const email =
        newCustomer.email.trim();

      if (!firstName) {
        setError(
          "First name is required."
        );

        return;
      }

      if (!lastName) {
        setError(
          "Last name is required."
        );

        return;
      }

      if (!phone) {
        setError(
          "Phone number is required."
        );

        return;
      }

      try {
        setCreatingCustomer(true);

        const customer =
          await createCustomer({
            first_name: firstName,
            last_name: lastName,
            phone,
            email:
              email || undefined,
            status: "Active",
          });

        // Add new customer to list.
        setCustomers(
          (current) => [
            customer,
            ...current.filter(
              (item) =>
                item.id !==
                customer.id
            ),
          ]
        );

        // Automatically select.
        setCustomerId(
          String(customer.id)
        );

        // Close create form.
        setShowCreateCustomer(false);

        // Reset customer form.
        setNewCustomer({
          first_name: "",
          last_name: "",
          phone: "",
          email: "",
        });

        setCustomerSearch("");

        setCustomerDropdownOpen(false);

        setError("");
      } catch (error: any) {
        console.error(
          "Failed to create customer:",
          error
        );

        setError(
          error?.response?.data
            ?.message ||
            "Failed to create customer."
        );
      } finally {
        setCreatingCustomer(false);
      }
    };

  // ==========================================================
  // SELECTED TIME RANGE
  // ==========================================================

  const sortedSelectedSlots = [...selectedSlots].sort(
    (a, b) =>
      timeToMinutes(a.start_time) -
      timeToMinutes(b.start_time)
  );

  const selectedStartTime =
    sortedSelectedSlots.length > 0
      ? normalizeTime(
          sortedSelectedSlots[0].start_time
        )
      : null;

  const selectedEndTime =
    sortedSelectedSlots.length > 0
      ? normalizeTime(
          sortedSelectedSlots[
            sortedSelectedSlots.length - 1
          ].end_time
        )
      : null;

  const selectedDurationHours =
    selectedSlots.length;

  // ==========================================================
  // SUBMIT RESERVATION
  // ==========================================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");

    // --------------------------------------------------------
    // CUSTOMER
    // --------------------------------------------------------

    if (!customerId) {
      setError(
        "Please select a customer."
      );

      return;
    }

    const numericCustomerId =
      Number(customerId);

    if (
      !Number.isInteger(
        numericCustomerId
      ) ||
      numericCustomerId <= 0
    ) {
      setError(
        "Invalid customer selected."
      );

      return;
    }

    // --------------------------------------------------------
    // COURT
    // --------------------------------------------------------

    if (!courtId) {
      setError(
        "Please select a court."
      );

      return;
    }

    const numericCourtId =
      Number(courtId);

    if (
      !Number.isInteger(
        numericCourtId
      ) ||
      numericCourtId <= 0
    ) {
      setError(
        "Invalid court selected."
      );

      return;
    }

    // --------------------------------------------------------
    // DATE
    // --------------------------------------------------------

    if (!reservationDate) {
      setError(
        "Please select a date."
      );

      return;
    }

    // --------------------------------------------------------
    // TIME
    // --------------------------------------------------------

    if (
      selectedSlots.length === 0 ||
      !selectedStartTime ||
      !selectedEndTime
    ) {
      setError(
        "Please select at least one available time slot."
      );

      return;
    }

    try {
      setSaving(true);

      await createWalkInReservation({
        customer_id:
          numericCustomerId,

        court_id:
          numericCourtId,

        reservation_date:
          reservationDate,

        start_time:
          selectedStartTime,

        end_time:
          selectedEndTime,

        remarks:
          remarks.trim() ||
          undefined,
      });

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
  // SELECTED CUSTOMER
  // ==========================================================

  const selectedCustomer =
    customers.find(
      (customer) =>
        customer.id ===
        Number(customerId)
    );

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
              customer.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={
              saving ||
              creatingCustomer
            }
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
              disabled:opacity-50
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
                CUSTOMER
            ================================================= */}
            <section>
              <div className="mb-2 flex items-center justify-between">
                <label
                  className="
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Customer
                </label>

                {!showCreateCustomer && (
                  <button
                    type="button"
                    onClick={handleOpenCreateCustomer}
                    disabled={saving || creatingCustomer}
                    className="
                      flex
                      items-center
                      gap-1.5
                      text-xs
                      font-medium
                      text-slate-700
                      transition
                      hover:text-slate-950
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    New customer
                  </button>
                )}
              </div>

              {!showCreateCustomer && (
                <>
                  {/* SEARCH + CUSTOMER DROPDOWN */}
                  <div
                    ref={customerDropdownRef}
                    className="relative"
                  >
                    <div
                      className={`
                        relative
                        overflow-hidden
                        rounded-xl
                        border
                        bg-white
                        transition-all
                        ${
                          customerDropdownOpen
                            ? "border-[#9bd900] ring-2 ring-[#b7ff00]/20"
                            : "border-slate-200"
                        }
                      `}
                    >
                      <Search
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
                        value={customerSearch}
                        onChange={(event) => {
                          const value =
                            event.target.value;

                          setCustomerSearch(value);
                          setCustomerDropdownOpen(true);

                          if (customerId) {
                            const selectedName =
                              `${selectedCustomer?.first_name ?? ""} ${selectedCustomer?.last_name ?? ""}`.trim();

                            if (
                              value.trim() !==
                              selectedName
                            ) {
                              setCustomerId("");
                            }
                          }
                        }}
                        onFocus={() =>
                          setCustomerDropdownOpen(true)
                        }
                        placeholder="Search name or phone number..."
                        disabled={
                          saving ||
                          creatingCustomer
                        }
                        className="
                          h-11
                          w-full
                          bg-transparent
                          pl-10
                          pr-10
                          text-sm
                          text-slate-900
                          outline-none
                          placeholder:text-slate-400
                        "
                      />

                      {customerSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerSearch("");
                            setCustomerId("");
                            setCustomerDropdownOpen(true);
                            setError("");
                          }}
                          disabled={
                            saving ||
                            creatingCustomer
                          }
                          className="
                            absolute
                            right-2
                            top-1/2
                            flex
                            h-7
                            w-7
                            -translate-y-1/2
                            items-center
                            justify-center
                            rounded-lg
                            text-slate-400
                            transition
                            hover:bg-slate-100
                            hover:text-slate-700
                          "
                          aria-label="Clear customer search"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {customerDropdownOpen && (
                      <div
                        className="
                          absolute
                          left-0
                          right-0
                          z-50
                          mt-2
                          overflow-hidden
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          shadow-xl
                          shadow-slate-900/10
                        "
                      >
                        <div className="max-h-64 overflow-y-auto py-1">
                          {loadingCustomers ? (
                            <div
                              className="
                                flex
                                items-center
                                gap-3
                                px-4
                                py-4
                                text-sm
                                text-slate-500
                              "
                            >
                              <span
                                className="
                                  h-4
                                  w-4
                                  animate-spin
                                  rounded-full
                                  border-2
                                  border-slate-200
                                  border-t-[#9bd900]
                                "
                              />
                              Searching customers...
                            </div>
                          ) : customers.length === 0 ? (
                            <div className="px-4 py-5">
                              <p className="text-sm font-medium text-slate-700">
                                No customers found
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {customerSearch.trim()
                                  ? "Try another name or phone number."
                                  : "Start typing to search for a customer."}
                              </p>
                            </div>
                          ) : (
                            customers.map((customer) => {
                              const selected =
                                customer.id ===
                                Number(customerId);

                              const initials =
                                `${customer.first_name?.[0] ?? ""}${customer.last_name?.[0] ?? ""}`
                                  .toUpperCase();

                              return (
                                <button
                                  key={customer.id}
                                  type="button"
                                  onClick={() => {
                                    setCustomerId(
                                      String(customer.id)
                                    );

                                    setCustomerSearch(
                                      `${customer.first_name} ${customer.last_name}`
                                    );

                                    setCustomerDropdownOpen(
                                      false
                                    );

                                    setError("");
                                  }}
                                  disabled={
                                    saving ||
                                    creatingCustomer
                                  }
                                  className={`
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    px-3
                                    py-2.5
                                    text-left
                                    transition
                                    ${
                                      selected
                                        ? "bg-[#b7ff00]/10"
                                        : "hover:bg-slate-50"
                                    }
                                  `}
                                >
                                  <div
                                    className={`
                                      flex
                                      h-9
                                      w-9
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-full
                                      text-xs
                                      font-semibold
                                      ${
                                        selected
                                          ? "bg-[#b7ff00]/25 text-slate-900"
                                          : "bg-slate-100 text-slate-600"
                                      }
                                    `}
                                  >
                                    {initials || (
                                      <User className="h-4 w-4" />
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p
                                      className={`
                                        truncate
                                        text-sm
                                        font-medium
                                        ${
                                          selected
                                            ? "text-slate-950"
                                            : "text-slate-800"
                                        }
                                      `}
                                    >
                                      {customer.first_name}{" "}
                                      {customer.last_name}
                                    </p>

                                    <div className="mt-0.5 flex min-w-0 items-center gap-2">
                                      {customer.phone && (
                                        <span className="truncate text-xs text-slate-400">
                                          {customer.phone}
                                        </span>
                                      )}

                                      {customer.email && (
                                        <>
                                          <span className="text-slate-300">
                                            •
                                          </span>

                                          <span className="truncate text-xs text-slate-400">
                                            {customer.email}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {selected && (
                                    <Check className="h-4 w-4 shrink-0 text-[#78a900]" />
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>

                        <div className="border-t border-slate-100 bg-slate-50/80 p-2">
                          <button
                            type="button"
                            onClick={handleOpenCreateCustomer}
                            disabled={
                              saving ||
                              creatingCustomer
                            }
                            className="
                              flex
                              w-full
                              items-center
                              justify-center
                              gap-2
                              rounded-lg
                              px-3
                              py-2.5
                              text-sm
                              font-medium
                              text-slate-700
                              transition
                              hover:bg-white
                              hover:text-slate-950
                            "
                          >
                            <UserPlus className="h-4 w-4" />
                            Create new customer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SELECTED CUSTOMER */}
                  {selectedCustomer && (
                    <div
                      className="
                        mt-3
                        rounded-xl
                        border
                        border-emerald-200
                        bg-emerald-50
                        px-4
                        py-3
                      "
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-emerald-100
                            text-emerald-700
                          "
                        >
                          <Check className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">
                            {selectedCustomer.first_name}{" "}
                            {selectedCustomer.last_name}
                          </p>

                          {selectedCustomer.phone && (
                            <p className="mt-1 text-xs text-slate-500">
                              {selectedCustomer.phone}
                            </p>
                          )}

                          {selectedCustomer.email && (
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {selectedCustomer.email}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setCustomerId("");
                            setCustomerSearch("");
                            setCustomerDropdownOpen(true);
                          }}
                          disabled={
                            saving ||
                            creatingCustomer
                          }
                          className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            text-slate-400
                            transition
                            hover:bg-white
                            hover:text-slate-700
                          "
                          aria-label="Change customer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* =================================================
                  CREATE CUSTOMER
              ================================================= */}
              {showCreateCustomer && (
                <div
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-4
                  "
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Create Customer
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Add the customer before creating the reservation.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateCustomer(false);
                        setError("");
                      }}
                      disabled={creatingCustomer}
                      className="
                        text-xs
                        font-medium
                        text-slate-400
                        hover:text-slate-700
                        disabled:opacity-50
                      "
                    >
                      Cancel
                    </button>
                  </div>

                  {/* FIRST + LAST NAME */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className="
                          mb-1.5
                          block
                          text-xs
                          font-medium
                          text-slate-600
                        "
                      >
                        First name
                      </label>

                      <input
                        value={newCustomer.first_name}
                        onChange={(event) =>
                          setNewCustomer((current) => ({
                            ...current,
                            first_name: event.target.value,
                          }))
                        }
                        disabled={creatingCustomer}
                        autoFocus
                        placeholder="John"
                        className="
                          h-10
                          w-full
                          rounded-lg
                          border
                          border-slate-200
                          bg-white
                          px-3
                          text-sm
                          text-slate-900
                          caret-slate-900
                          outline-none
                          placeholder:text-slate-400
                          focus:border-[#9bd900]
                          focus:ring-2
                          focus:ring-[#b7ff00]/20
                        "
                      />
                    </div>

                    <div>
                      <label
                        className="
                          mb-1.5
                          block
                          text-xs
                          font-medium
                          text-slate-600
                        "
                      >
                        Last name
                      </label>

                      <input
                        value={newCustomer.last_name}
                        onChange={(event) =>
                          setNewCustomer((current) => ({
                            ...current,
                            last_name: event.target.value,
                          }))
                        }
                        disabled={creatingCustomer}
                        placeholder="Doe"
                        className="
                          h-10
                          w-full
                          rounded-lg
                          border
                          border-slate-200
                          bg-white
                          px-3
                          text-sm
                          text-slate-900
                          caret-slate-900
                          outline-none
                          placeholder:text-slate-400
                          focus:border-[#9bd900]
                          focus:ring-2
                          focus:ring-[#b7ff00]/20
                        "
                      />
                    </div>
                  </div>

                  {/* PHONE */}
                  <div className="mt-3">
                    <label
                      className="
                        mb-1.5
                        block
                        text-xs
                        font-medium
                        text-slate-600
                      "
                    >
                      Phone
                    </label>

                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(event) =>
                        setNewCustomer((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      disabled={creatingCustomer}
                      placeholder="09XXXXXXXXX"
                      className="
                        h-10
                        w-full
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        px-3
                        text-sm
                        text-slate-900
                        caret-slate-900
                        outline-none
                        placeholder:text-slate-400
                        focus:border-[#9bd900]
                        focus:ring-2
                        focus:ring-[#b7ff00]/20
                      "
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="mt-3">
                    <label
                      className="
                        mb-1.5
                        block
                        text-xs
                        font-medium
                        text-slate-600
                      "
                    >
                      Email
                      <span className="ml-1 text-slate-400">
                        Optional
                      </span>
                    </label>

                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(event) =>
                        setNewCustomer((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      disabled={creatingCustomer}
                      placeholder="customer@example.com"
                      className="
                        h-10
                        w-full
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        px-3
                        text-sm
                        text-slate-900
                        caret-slate-900
                        outline-none
                        placeholder:text-slate-400
                        focus:border-[#9bd900]
                        focus:ring-2
                        focus:ring-[#b7ff00]/20
                      "
                    />
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateCustomer(false);
                        setError("");
                      }}
                      disabled={creatingCustomer}
                      className="
                        h-10
                        flex-1
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        text-sm
                        font-medium
                        text-slate-700
                        hover:bg-slate-50
                        disabled:opacity-50
                      "
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleCreateCustomer}
                      disabled={creatingCustomer}
                      className="
                        flex
                        h-10
                        flex-1
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
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
                      {creatingCustomer ? (
                        <>
                          <span
                            className="
                              h-4
                              w-4
                              animate-spin
                              rounded-full
                              border-2
                              border-white/30
                              border-t-white
                            "
                          />
                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Create Customer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* =================================================
                COURT
            ================================================= */}

            <section className="mt-6">
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
                  saving ||
                  creatingCustomer
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
                    disabled={
                      saving ||
                      creatingCustomer
                    }
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

                <div
                  className="
                    flex
                    h-11
                    items-center
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  {selectedDurationHours > 0
                    ? `${selectedDurationHours} Hour${selectedDurationHours > 1 ? "s" : ""} selected`
                    : "Select time slots"}
                </div>
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

              <p className="mb-3 text-xs text-slate-400">
                Select one or more consecutive time slots.
                Click a selected slot again to remove it.
              </p>

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
                    Select a court and
                    date to see
                    available times.
                  </p>
                </div>
              ) : loadingAvailability ? (
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
                    Checking available
                    times...
                  </p>
                </div>
              ) : availableSlots.length ===
                0 ? (
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
                    Try another date
                    or duration.
                  </p>
                </div>
              ) : (
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
                        selectedSlots.some(
                          (item) =>
                            timeToMinutes(
                              item.start_time
                            ) ===
                              timeToMinutes(
                                slot.start_time
                              ) &&
                            timeToMinutes(
                              item.end_time
                            ) ===
                              timeToMinutes(
                                slot.end_time
                              )
                        );

                      return (
                        <button
                          key={`${slot.start_time}-${slot.end_time}`}
                          type="button"
                          onClick={() =>
                            handleTimeSelect(
                              slot
                            )
                          }
                          disabled={
                            saving ||
                            creatingCustomer
                          }
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
                              justify-between
                              gap-2
                            "
                          >
                            <div className="flex items-center gap-2">
                              <Clock3
                                className={
                                  selected
                                    ? "h-4 w-4 text-[#78a900]"
                                    : "h-4 w-4 text-slate-400"
                                }
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

                            {selected && (
                              <Check className="h-4 w-4 shrink-0 text-[#78a900]" />
                            )}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </section>

            {selectedSlots.length > 0 && (
              <div
                className="
                  mt-5
                  rounded-xl
                  border
                  border-[#9bd900]/30
                  bg-[#b7ff00]/10
                  px-4
                  py-3
                "
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Selected Time
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatTime(selectedStartTime!)}
                      {" – "}
                      {formatTime(selectedEndTime!)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {selectedDurationHours} Hour
                      {selectedDurationHours > 1 ? "s" : ""}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSlots([]);
                        setError("");
                      }}
                      disabled={saving || creatingCustomer}
                      className="
                        rounded-full
                        px-2.5
                        py-1
                        text-xs
                        font-medium
                        text-slate-500
                        hover:bg-white
                        hover:text-slate-800
                      "
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                REMARKS
            ================================================= */}

            <section className="mt-6">
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
                Remarks
              </label>

              <textarea
                value={remarks}
                onChange={(event) =>
                  setRemarks(
                    event.target.value
                  )
                }
                placeholder="Remarks (optional)"
                rows={3}
                disabled={
                  saving ||
                  creatingCustomer
                }
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
            </section>

            {/* =================================================
                NOTICE
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
                The selected customer
                will be attached to
                this reservation.
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
              disabled={
                saving ||
                creatingCustomer
              }
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
                creatingCustomer ||
                !customerId ||
                !courtId ||
                !reservationDate ||
                selectedSlots.length === 0
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