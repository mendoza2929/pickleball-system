"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "@/lib/api";

interface Court {
  id: number;
  uuid: string;
  court_number: number;
  name: string;
  description?: string | null;
  surface_type: string;
  hourly_rate: number;
  status: "Available" | "Maintenance" | "Inactive";
}

interface Props {
  court?: Court | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function CourtFormModal({
  court,
  onClose,
  onSaved,
}: Props) {
  const isEdit = !!court;

  // ============================================================
  // FORM STATE
  // ============================================================

  const [courtNumber, setCourtNumber] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [surfaceType, setSurfaceType] = useState("Indoor");
  const [hourlyRate, setHourlyRate] = useState("");

  const [status, setStatus] =
    useState<"Available" | "Maintenance" | "Inactive">(
      "Available"
    );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD COURT WHEN EDITING
  // ============================================================

  useEffect(() => {
    if (court) {
      setCourtNumber(String(court.court_number));
      setName(court.name);
      setDescription(court.description ?? "");
      setSurfaceType(court.surface_type);
      setHourlyRate(String(court.hourly_rate));
      setStatus(court.status);
    } else {
      setCourtNumber("");
      setName("");
      setDescription("");
      setSurfaceType("Indoor");
      setHourlyRate("");
      setStatus("Available");
    }

    setError("");
  }, [court]);

  // ============================================================
  // SUBMIT
  // ============================================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    // ----------------------------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------------------------

    if (
      !courtNumber.trim() ||
      !name.trim() ||
      !hourlyRate.trim()
    ) {
      setError(
        "Court number, court name and hourly rate are required."
      );

      return;
    }

    // ----------------------------------------------------------
    // COURT NUMBER
    // ----------------------------------------------------------

    const number = Number(courtNumber);

    if (
      !Number.isInteger(number) ||
      number <= 0
    ) {
      setError(
        "Court number must be a valid number."
      );

      return;
    }

    // ----------------------------------------------------------
    // HOURLY RATE
    // ----------------------------------------------------------

    const rate = Number(hourlyRate);

    if (
      Number.isNaN(rate) ||
      rate <= 0
    ) {
      setError(
        "Hourly rate must be greater than 0."
      );

      return;
    }

    try {
      setLoading(true);

      // --------------------------------------------------------
      // PAYLOAD
      // --------------------------------------------------------

      const payload = {
        court_number: number,

        name: name.trim(),

        description:
          description.trim() || null,

        surface_type: surfaceType,

        hourly_rate: rate,

        ...(isEdit
          ? {
              status,
            }
          : {}),
      };

      // --------------------------------------------------------
      // CREATE / UPDATE
      // --------------------------------------------------------

      if (isEdit) {
        await api.put(
          `/courts/${court.id}`,
          payload
        );
      } else {
        await api.post(
          "/courts",
          payload
        );
      }

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      onSaved();
      onClose();
    } catch (err: any) {
      console.error(
        "Failed to save court:",
        err
      );

      setError(
        err?.response?.data?.message ??
          "Failed to save court."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="fixed inset-0 z-[100]">
      {/* ======================================================
          OVERLAY
      ====================================================== */}

      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={() => {
          if (!loading) {
            onClose();
          }
        }}
      />

      {/* ======================================================
          PANEL
      ====================================================== */}

      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white text-slate-900 shadow-2xl">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                COURT
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                {isEdit
                  ? "Edit Court"
                  : "Add Court"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {isEdit
                  ? "Update the court information."
                  : "Add a new pickleball court."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ====================================================
            FORM
        ==================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ==================================================
              COURT NUMBER
          ================================================== */}

          <div>
            <label
              htmlFor="court-number"
              className="text-sm font-medium text-slate-700"
            >
              Court Number
            </label>

            <input
              id="court-number"
              type="number"
              min="1"
              value={courtNumber}
              onChange={(e) =>
                setCourtNumber(
                  e.target.value
                )
              }
              placeholder="1"
              className="
                mt-2
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                text-sm
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-slate-400
                focus:ring-2
                focus:ring-slate-950/5
              "
            />
          </div>

          {/* ==================================================
              COURT NAME
          ================================================== */}

          <div>
            <label
              htmlFor="court-name"
              className="text-sm font-medium text-slate-700"
            >
              Court Name
            </label>

            <input
              id="court-name"
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Court Alpha"
              className="
                mt-2
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                text-sm
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-slate-400
                focus:ring-2
                focus:ring-slate-950/5
              "
            />
          </div>

          {/* ==================================================
              SURFACE TYPE
          ================================================== */}

          <div>
            <label
              htmlFor="surface-type"
              className="text-sm font-medium text-slate-700"
            >
              Surface Type
            </label>

            <select
              id="surface-type"
              value={surfaceType}
              onChange={(e) =>
                setSurfaceType(
                  e.target.value
                )
              }
              className="
                mt-2
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                text-sm
                text-slate-900
                outline-none
                focus:border-slate-400
                focus:ring-2
                focus:ring-slate-950/5
              "
            >
              <option value="Indoor">
                Indoor
              </option>

              <option value="Outdoor">
                Outdoor
              </option>
            </select>
          </div>

          {/* ==================================================
              HOURLY RATE
          ================================================== */}

          <div>
            <label
              htmlFor="hourly-rate"
              className="text-sm font-medium text-slate-700"
            >
              Hourly Rate
            </label>

            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                ₱
              </span>

              <input
                id="hourly-rate"
                type="number"
                min="0"
                step="0.01"
                value={hourlyRate}
                onChange={(e) =>
                  setHourlyRate(
                    e.target.value
                  )
                }
                placeholder="250.00"
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  pl-8
                  pr-3
                  text-sm
                  text-slate-900
                  outline-none
                  placeholder:text-slate-400
                  focus:border-slate-400
                  focus:ring-2
                  focus:ring-slate-950/5
                "
              />
            </div>
          </div>

          {/* ==================================================
              STATUS - EDIT ONLY
          ================================================== */}

          {isEdit && (
            <div>
              <label
                htmlFor="court-status"
                className="text-sm font-medium text-slate-700"
              >
                Status
              </label>

              <select
                id="court-status"
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as
                      | "Available"
                      | "Maintenance"
                      | "Inactive"
                  )
                }
                className="
                  mt-2
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-sm
                  text-slate-900
                  outline-none
                  focus:border-slate-400
                  focus:ring-2
                  focus:ring-slate-950/5
                "
              >
                <option value="Available">
                  Available
                </option>

                <option value="Maintenance">
                  Maintenance
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>
          )}

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <div>
            <label
              htmlFor="court-description"
              className="text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="court-description"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows={4}
              placeholder="Optional court description..."
              className="
                mt-2
                w-full
                resize-none
                rounded-xl
                border
                border-slate-200
                bg-white
                p-3
                text-sm
                text-slate-900
                outline-none
                placeholder:text-slate-400
                focus:border-slate-400
                focus:ring-2
                focus:ring-slate-950/5
              "
            />
          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="sticky bottom-0 -mx-6 border-t border-slate-200 bg-white px-6 py-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="
                  h-11
                  flex-1
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="
                  h-11
                  flex-1
                  rounded-xl
                  bg-slate-950
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-slate-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading
                  ? "Saving..."
                  : isEdit
                  ? "Save Changes"
                  : "Create Court"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}