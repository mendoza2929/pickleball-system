"use client";

import { useMemo, useState } from "react";
import {
  Clock3,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  CalendarClock,
} from "lucide-react";

import { useCourts } from "@/hooks/useCourts";
import CourtScheduleModal from "./CourtScheduleModal";
import { useCourtSchedules } from "@/hooks/useCourtSchedules";
import CourtFormModal from "./CourtFormModal";
import { deleteCourt as deleteCourtRequest } from "@/services/court.service";
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

export default function CourtsPage() {
  const { data, isLoading, isError } = useCourts();

  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [scheduleCourt, setScheduleCourt] =
    useState<Court | null>(null);
  const [formCourt, setFormCourt] =
    useState<Court | null>(null);

  const [showCourtForm, setShowCourtForm] =
    useState(false);

const [deleteCourt, setDeleteCourt] =
  useState<Court | null>(null);

const [deleting, setDeleting] =
  useState(false);
  const {
    data: schedules = [],
    refetch: refetchSchedules,
    } = useCourtSchedules(
    scheduleCourt?.id ?? null
    );
  const courts = useMemo<Court[]>(() => {
    return (data ?? []) as Court[];
  }, [data]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] px-6 py-14 lg:px-10">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Admin</span>
              <span>/</span>
              <span className="text-slate-700">Courts</span>
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
              Courts
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your pickleball courts, pricing and schedules.
            </p>
          </div>

          {/* ADD COURT */}
          <button
            type="button"
             onClick={() => {
              setFormCourt(null);
              setShowCourtForm(true);
            }}
            className="
              inline-flex
              h-11
              items-center
              gap-2
              rounded-xl
              bg-slate-950
              px-5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-slate-800
            "
          >
            <Plus className="h-4 w-4" />
            Add Court
          </button>
        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}
        <div className="mt-10 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* TABLE HEADER */}
          <div
            className="
              grid
              grid-cols-[80px_minmax(260px,1.8fr)_minmax(160px,1fr)_minmax(180px,1fr)_150px_56px]
              items-center
              border-b
              border-slate-200
              bg-slate-50/70
              px-6
              py-4
              text-xs
              font-medium
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            <div>#</div>
            <div>Court</div>
            <div>Surface</div>
            <div>Hourly Rate</div>
            <div>Status</div>
            <div />
          </div>

          {/* LOADING */}
          {isLoading && (
            <div className="divide-y divide-slate-100">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="
                    grid
                    grid-cols-[80px_minmax(260px,1.8fr)_minmax(160px,1fr)_minmax(180px,1fr)_150px_56px]
                    items-center
                    px-6
                    py-6
                  "
                >
                  <div className="h-4 w-5 animate-pulse rounded bg-slate-100" />

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />

                    <div className="space-y-2">
                      <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
                      <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>

                  <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />

                  <div className="space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-14 animate-pulse rounded bg-slate-100" />
                  </div>

                  <div className="h-7 w-20 animate-pulse rounded-full bg-slate-100" />

                  <div />
                </div>
              ))}
            </div>
          )}

          {/* ERROR */}
          {isError && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-red-500">
                Unable to load courts.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Please try again.
              </p>
            </div>
          )}

          {/* EMPTY */}
          {!isLoading && !isError && courts.length === 0 && (
            <div className="px-6 py-16 text-center">
              <MapPin className="mx-auto h-8 w-8 text-slate-300" />

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No courts found
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Add your first pickleball court.
              </p>
            </div>
          )}

          {/* COURTS */}
          {!isLoading && !isError && courts.length > 0 && (
            <div className="divide-y divide-slate-100">
              {courts.map((court, index) => (
                <div
                  key={court.id}
                  className="
                    relative
                    grid
                    grid-cols-[80px_minmax(260px,1.8fr)_minmax(160px,1fr)_minmax(180px,1fr)_150px_56px]
                    items-center
                    px-6
                    py-5
                    transition-colors
                    hover:bg-slate-50/60
                  "
                >
                  {/* NUMBER */}
                  <div className="text-sm text-slate-500">
                    {index + 1}
                  </div>

                  {/* COURT */}
                  <div className="flex items-center gap-3">
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
                      <MapPin className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {court.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Court #{court.court_number}
                      </p>
                    </div>
                  </div>

                  {/* SURFACE */}
                  <div className="text-sm text-slate-600">
                    {court.surface_type}
                  </div>

                  {/* HOURLY RATE */}
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-slate-400" />

                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(court.hourly_rate)}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      per hour
                    </p>
                  </div>

                  {/* STATUS */}
                  <div>
                    {court.status === "Available" && (
                      <span
                        className="
                          inline-flex
                          rounded-full
                          bg-lime-100
                          px-3
                          py-1
                          text-xs
                          font-medium
                          text-lime-700
                        "
                      >
                        Available
                      </span>
                    )}

                    {court.status === "Maintenance" && (
                      <span
                        className="
                          inline-flex
                          rounded-full
                          bg-amber-100
                          px-3
                          py-1
                          text-xs
                          font-medium
                          text-amber-700
                        "
                      >
                        Maintenance
                      </span>
                    )}

                    {court.status === "Inactive" && (
                      <span
                        className="
                          inline-flex
                          rounded-full
                          bg-slate-100
                          px-3
                          py-1
                          text-xs
                          font-medium
                          text-slate-600
                        "
                      >
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* ACTION MENU */}
                  <div className="relative flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(
                          openMenu === court.id
                            ? null
                            : court.id
                        )
                      }
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        text-slate-400
                        transition
                        hover:bg-slate-100
                        hover:text-slate-700
                      "
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>

                    {openMenu === court.id && (
                      <div
                        className="
                          absolute
                          right-0
                          top-10
                          z-50
                          w-48
                          overflow-hidden
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          p-1
                          shadow-lg
                        "
                      >
                        {/* EDIT */}
                        <button
                          type="button"
                         onClick={() => {
                            setOpenMenu(null);
                            setFormCourt(court);
                            setShowCourtForm(true);
                          }}
                          className="
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-lg
                            px-3
                            py-2.5
                            text-left
                            text-sm
                            text-slate-700
                            hover:bg-slate-50
                          "
                        >
                          <Pencil className="h-4 w-4 text-slate-400" />
                          Edit Court
                        </button>

                        {/* SCHEDULE */}
                       <button
                            type="button"
                            onClick={() => {
                                setOpenMenu(null);
                                setScheduleCourt(court);
                            }}
                            className="
                                flex
                                w-full
                                items-center
                                gap-3
                                rounded-lg
                                px-3
                                py-2.5
                                text-left
                                text-sm
                                text-slate-700
                                hover:bg-slate-50
                            "
                            >
                            <CalendarClock className="h-4 w-4 text-slate-400" />
                            Manage Schedule
                            </button>

                        <div className="my-1 border-t border-slate-100" />

                        {/* DELETE */}
                                           
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenu(null);
                            setDeleteCourt(court);
                          }}
                          className="
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-lg
                            px-3
                            py-2.5
                            text-left
                            text-sm
                            text-red-600
                            hover:bg-red-50
                          "
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Court
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
         {scheduleCourt && (
        <CourtScheduleModal
          courtId={scheduleCourt.id}
          courtName={scheduleCourt.name}
          schedules={schedules}
          onClose={() => setScheduleCourt(null)}
          onSaved={() => {
            refetchSchedules();
          }}
          
        />
      )}
         {showCourtForm && (
        <CourtFormModal
          court={formCourt}
          onClose={() => {
            setShowCourtForm(false);
            setFormCourt(null);
          }}
          onSaved={() => {
            window.location.reload();
          }}
        />
      )}

      {deleteCourt && (
  <div className="fixed inset-0 z-[110]">
    <div
      className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
      onClick={() => {
        if (!deleting) {
          setDeleteCourt(null);
        }
      }}
    />

    <div className="absolute left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
      <div>
        <h2 className="text-lg font-bold text-slate-950">
          Delete Court
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-700">
            {deleteCourt.name}
          </span>
          ?
        </p>

        <p className="mt-1 text-sm text-red-500">
          This action cannot be undone.
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          disabled={deleting}
          onClick={() => setDeleteCourt(null)}
          className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
            type="button"
            disabled={deleting}
            onClick={async () => {
              if (!deleteCourt) return;

              try {
                setDeleting(true);

                await deleteCourtRequest(
                  deleteCourt.id
                );

                setDeleteCourt(null);

                window.location.reload();
              } catch (error) {
                console.error(
                  "Failed to delete court:",
                  error
                );

                alert(
                  "Failed to delete court."
                );
              } finally {
                setDeleting(false);
              }
            }}
            className="h-11 flex-1 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting
              ? "Deleting..."
              : "Delete Court"}
          </button>
      </div>
    </div>
  </div>
)}
    </main>
  );
}