"use client";

import { useState } from "react";

import Container from "@/components/common/Container";

import CourtSelector from "./CourtSelector";
import DateSelector from "./DateSelector";
import TimeSelector from "./TimeSelector";
import GuestForm from "./GuestForm";
import BookingSummary from "./BookingSummary";
import { useCreateReservation } from "@/hooks/useCreateReservation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCourtSchedules } from "@/hooks/useCourtSchedules";
import { formatTime } from "@/utils/time";
const steps = [
  "Court",
  "Date",
  "Time",
  "Guest",
  "Summary",
];

export default function ReservationSteps() {
  const [currentStep, setCurrentStep] = useState(0);

  const [selectedCourt, setSelectedCourt] =
    useState<number | null>(null);

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  const [selectedStartTime, setSelectedStartTime] =
     useState<string | null>(null);

  const [selectedEndTime, setSelectedEndTime] =
    useState<string | null>(null);

  const [guest, setGuest] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    remarks: "",
  });
  const { data: courtSchedules = [] } =
  useCourtSchedules(selectedCourt);
  const router = useRouter();
  const createReservation =
  useCreateReservation();
    const nextStep = () => {
    if (currentStep === 0 && !selectedCourt) {
         toast.error("Please select a court.");
        return;
    }

    if (currentStep === 1 && !selectedDate) {
        toast.error("Please select a reservation date.");
        return;
    }

    if (currentStep === 2 && !selectedStartTime) {
        toast.error("Please select an available time slot.");
        return;
    }

    if (currentStep === 3) {
      if (
        !guest.guest_name.trim() ||
        !guest.guest_email.trim() ||
        !guest.guest_phone.trim()
      ) {
        toast.error("Please complete the guest information.");
        return;
      }
    }


    setCurrentStep((prev) =>
        Math.min(prev + 1, steps.length - 1)
    );
    };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };
function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
const submitReservation = async () => {
  if (
    !selectedCourt ||
    !selectedDate ||
    !selectedStartTime ||
    !selectedEndTime
  ) {
    return;
  }

  try {
    console.log({
      court_id: selectedCourt,
      reservation_date: formatLocalDate(selectedDate),
      start_time: selectedStartTime,
      end_time: selectedEndTime,
    });

    const result =
      await createReservation.mutateAsync({
        court_id: selectedCourt,

        reservation_date:
          formatLocalDate(selectedDate),

        start_time: selectedStartTime,

        end_time: selectedEndTime,

        guest_name: guest.guest_name,

        guest_email: guest.guest_email,

        guest_phone: guest.guest_phone,

        remarks: guest.remarks,
      });

    toast.success("Reservation created!");

  router.push(
  `/reservation/success/${result.data.uuid}`
);
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ??
        "Unable to create reservation."
    );
  }
};
  return (
    <section className="py-24">
      <Container>
        {/* Step Indicator */}

        <div className="mx-auto mb-16 flex max-w-5xl items-center justify-between">

          {steps.map((step, index) => {
            const active = index <= currentStep;

            return (
              <div
                key={step}
                className="flex flex-1 items-center"
              >
                <div className="flex flex-col items-center">

                  <div
                    className={`
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      text-sm
                      font-bold
                      transition-all

                      ${
                        active
                          ? "border-lime-400 bg-lime-400 text-slate-950"
                          : "border-slate-700 bg-slate-900 text-slate-500"
                      }
                    `}
                  >
                    {index + 1}
                  </div>

                  <span
                    className={`
                      mt-3
                      text-sm

                      ${
                        active
                          ? "text-white"
                          : "text-slate-500"
                      }
                    `}
                  >
                    {step}
                  </span>
                </div>

                {index !== steps.length - 1 && (
                  <div
                    className={`
                      mx-4
                      h-[2px]
                      flex-1

                      ${
                        index < currentStep
                          ? "bg-lime-400"
                          : "bg-slate-700"
                      }
                    `}
                  />
                )}
              </div>
            );
          })}

        </div>

        {/* Card */}

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-slate-900/60
            p-8
            backdrop-blur-xl
            lg:p-12
          "
        >
          {/* Step Content */}

{currentStep === 0 && (
  <CourtSelector
    selectedCourt={selectedCourt}
    onSelect={setSelectedCourt}
  />
)}

{currentStep === 1 && (
  <DateSelector
    courtId={selectedCourt}
    schedules={courtSchedules}
    selectedDate={selectedDate}
    onSelect={setSelectedDate}
  />
)}

{currentStep === 2 &&
  selectedCourt &&
  selectedDate && (
    <TimeSelector
      courtId={selectedCourt}
      date={selectedDate}
      selectedTime={selectedStartTime}
      onSelect={(start, end) => {
        setSelectedStartTime(start);
        setSelectedEndTime(end);
      }}
    />
)}

{currentStep === 3 && (
  <GuestForm
    value={guest}
    onChange={setGuest}
  />
)}

{currentStep === 4 &&
  selectedCourt &&
  selectedDate &&
  selectedStartTime &&
  selectedEndTime && (
    <BookingSummary
      courtId={selectedCourt}
      date={selectedDate}
      startTime={selectedStartTime}
      endTime={selectedEndTime}
      guest={guest}
    />
)}

{/* ✅ Reservation Summary */}

{selectedCourt && (
  <div
    className="
      mt-10
      rounded-2xl
      border
      border-white/10
      bg-slate-950/60
      p-6
    "
  >
    <h3 className="mb-5 text-lg font-semibold">
      Reservation Summary
    </h3>

    <div className="grid gap-5 md:grid-cols-2">

      <div>
        <span className="text-slate-500">
          Court
        </span>

        <p>{selectedCourt}</p>
      </div>

      <div>
        <span className="text-slate-500">
          Date
        </span>

        <p>
          {selectedDate
            ? selectedDate.toLocaleDateString()
            : "-"}
        </p>
      </div>

      <div>
        <span className="text-slate-500">
          Start Time
        </span>

        <p>
  {selectedStartTime
    ? formatTime(selectedStartTime)
    : "-"}
</p>
      </div>

      <div>
        <span className="text-slate-500">
          End Time
        </span>

        <p>
          {selectedEndTime
            ? formatTime(selectedEndTime)
            : "-"}
        </p>
      </div>

    </div>
  </div>
)}


          {/* Footer */}

          <div className="mt-12 flex items-center justify-between">

            <button
              onClick={previousStep}
              disabled={currentStep === 0}
              className="
                rounded-xl
                border
                border-white/10
                px-6
                py-3
                transition
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Previous
            </button>

            <button
              onClick={() => {
              if (currentStep === steps.length - 1) {
                submitReservation();
                return;
              }

              nextStep();
            }}
              className="
                rounded-xl
                bg-lime-400
                px-7
                py-3
                font-semibold
                text-slate-950
                transition
                hover:bg-lime-300
              "
            >
            {currentStep === 0 && "Continue to Date"}
            {currentStep === 1 && "Continue to Time"}
            {currentStep === 2 && "Continue to Guest"}
            {currentStep === 3 && "Review Reservation"}
            {currentStep === 4 &&
            (createReservation.isPending
              ? "Creating Reservation..."
              : "Confirm Reservation")}
            </button>

          </div>
        </div>
      </Container>
    </section>
  );
}