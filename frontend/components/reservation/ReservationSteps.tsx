"use client";

import { useEffect, useRef, useState } from "react";

import Container from "@/components/common/Container";
import { useCreatePayment } from "@/hooks/useCreatePayment";
import CourtSelector from "./CourtSelector";
import DateSelector from "./DateSelector";
import TimeSelector from "./TimeSelector";
import GuestForm from "./GuestForm";
import BookingSummary from "./BookingSummary";
import { useCreateReservation } from "@/hooks/useCreateReservation";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCourtSchedules } from "@/hooks/useCourtSchedules";
import { formatTime } from "@/utils/time";
const steps = [
  "Court",
  "Date",
  "Time",
  "Guest",
  "Summary",
  "Payment",
];

export default function ReservationSteps() {
  const [currentStep, setCurrentStep] = useState(0);

  const [selectedCourt, setSelectedCourt] =
    useState<number | null>(null);
  const [isStepLoading, setIsStepLoading] = useState(false);
  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  const [selectedStartTime, setSelectedStartTime] =
     useState<string | null>(null);

  const [selectedEndTime, setSelectedEndTime] =
    useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] =
  useState<"GCASH" | null>(null);
  const [guest, setGuest] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    remarks: "",
  });
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { data: courtSchedules = [] } =
  useCourtSchedules(selectedCourt);
  const router = useRouter();
  const searchParams = useSearchParams();

const courtId = searchParams.get("courtId");

  const createReservation =
  useCreateReservation();
  const createPayment =
  useCreatePayment();
useEffect(() => {
  if (!courtId) return;

  const id = Number(courtId);

  setSelectedCourt((prev) =>
    prev === id ? prev : id
  );

  setCurrentStep((prev) =>
    prev === 1 ? prev : 1
  );
}, [courtId]);


const handleNextStep = async () => {
  if (isStepLoading) return;

  setIsStepLoading(true);

  // Small delay so the loading state is visible
  await new Promise((resolve) => setTimeout(resolve, 500));

  nextStep();

  setIsStepLoading(false);
};

const handleContinue = async () => {
  if (isStepLoading) return;

  // Final payment step
  if (currentStep === steps.length - 1) {
    await submitReservation();
    return;
  }

  setIsStepLoading(true);

  await new Promise((resolve) => setTimeout(resolve, 500));

  nextStep();

  setIsStepLoading(false);
};
const scrollToCurrentStep = (step: number) => {
  const navbarHeight = 90;

  let target: HTMLElement | null = null;

  switch (step) {
    case 1:
      target = document.getElementById("date-step");
      break;

    case 2:
      target = document.getElementById("time-step");
      break;

    case 3:
      target = document.getElementById("guest-step");
      break;

    case 4:
      target = document.getElementById("summary-step");
      break;

    case 5:
      target = document.getElementById("payment-step");
      break;

    default:
      target = document.getElementById("court-step");
  }

  if (!target) return;

  const top =
    target.getBoundingClientRect().top +
    window.scrollY -
    navbarHeight;

  window.scrollTo({
    top,
    behavior: "smooth",
  });
};
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

  
const next = Math.min(currentStep + 1, steps.length - 1);

setCurrentStep(next);

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    scrollToCurrentStep(next);
  });
});
};
   const previousStep = () => {
  const prev = Math.max(currentStep - 1, 0);

setCurrentStep(prev);

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    scrollToCurrentStep(prev);
  });
});
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
    // -----------------------------------------
    // 1. Create reservation
    // -----------------------------------------

    const reservationResult =
      await createReservation.mutateAsync({
        court_id: selectedCourt,

        reservation_date:
          formatLocalDate(selectedDate),

        start_time:
          selectedStartTime,

        end_time:
          selectedEndTime,

        guest_name:
          guest.guest_name,

        guest_email:
          guest.guest_email,

        guest_phone:
          guest.guest_phone,

        remarks:
          guest.remarks,
      });

    // -----------------------------------------
    // Get reservation ID
    // -----------------------------------------

const reservation =
  reservationResult?.data;

const reservationId =
  reservation?.id;

if (
  !reservationId ||
  !Number.isInteger(reservationId) ||
  reservationId <= 0
) {
  console.error(
    "Invalid reservation response:",
    reservationResult
  );

  throw new Error(
    "Reservation was created, but the reservation ID was not returned."
  );
}

console.log(
  "Reservation ID:",
  reservationId
);

// -----------------------------------------
// Create GCash payment
// -----------------------------------------

const paymentResult =
  await createPayment.mutateAsync({
    reservation_id: reservationId,
    payment_method: "GCASH",
  });

console.log(
  "Payment created:",
  paymentResult
);

// -----------------------------------------
// Get Xendit checkout URL
// -----------------------------------------

const checkoutUrl =
  paymentResult?.data?.checkout_url;

if (!checkoutUrl) {
  throw new Error(
    "Payment checkout URL was not returned."
  );
}

// -----------------------------------------
// Redirect to Xendit
// -----------------------------------------

window.location.href =
  checkoutUrl;

  } catch (error: any) {
    console.error(
      "Reservation/payment error:",
      error
    );

    toast.error(
      error?.response?.data?.message ??
        error?.message ??
        "Unable to process reservation payment."
    );
  }
};
  return (
    <section  ref={stepContainerRef}
   className="py-24 pb-48 lg:pb-72">
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
   ref={cardRef}
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
<div ref={stepContentRef}>
  {/* Court */}

  {currentStep === 0 && (
    <div id="court-step">
      <CourtSelector
        selectedCourt={selectedCourt}
        onSelect={setSelectedCourt}
      />
    </div>
  )}

  {/* Date */}

  {currentStep === 1 && (
    <div
      id="date-step"
      className="scroll-mt-28"
    >
      <DateSelector
        courtId={selectedCourt}
        schedules={courtSchedules}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />
    </div>
  )}

  {/* Time */}

  {currentStep === 2 &&
    selectedCourt &&
    selectedDate && (
     <div
        id="time-step"
        className="scroll-mt-28"
      >
        <TimeSelector
          courtId={selectedCourt}
          date={selectedDate}
          selectedTime={selectedStartTime}
          onSelect={(start, end) => {
            setSelectedStartTime(start);
            setSelectedEndTime(end);
          }}
        />
      </div>
    )}

  {/* Guest */}

  {currentStep === 3 && (
    <div id="guest-step"  className="scroll-mt-28">
      <GuestForm
        value={guest}
        onChange={setGuest}
      />
    </div>
  )}

  {/* Summary */}

  {currentStep === 4 &&
    selectedCourt &&
    selectedDate &&
    selectedStartTime &&
    selectedEndTime && (
      <div id="summary-step">
        <BookingSummary
          courtId={selectedCourt}
          date={selectedDate}
          startTime={selectedStartTime}
          endTime={selectedEndTime}
          guest={guest}
        />
      </div>
    )}
</div>
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

{/* Payment */}

{/* Payment */}

{currentStep === 5 && (
  <div
    id="payment-step"
    className="scroll-mt-28"
  >
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-lime-400">
          Payment
        </p>

        <h2 className="mt-2 text-3xl font-black">
          Pay with GCash
        </h2>

        <p className="mt-3 text-slate-400">
          Complete your reservation securely using GCash.
        </p>
      </div>

      <div className="grid gap-4">
        {/* GCash */}

        <button
          type="button"
          onClick={() => setPaymentMethod("GCASH")}
          className={`
            w-full
            rounded-2xl
            border
            p-6
            text-left
            transition-all
            duration-300

            ${
              paymentMethod === "GCASH"
                ? "border-lime-400 bg-lime-400/10"
                : "border-white/10 bg-white/5 hover:border-lime-400/30 hover:bg-white/10"
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">
                GCash
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Pay securely using GCash.
              </p>
            </div>

            <div
              className={`
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-full
                border-2

                ${
                  paymentMethod === "GCASH"
                    ? "border-lime-400"
                    : "border-slate-600"
                }
              `}
            >
              {paymentMethod === "GCASH" && (
                <div className="h-3 w-3 rounded-full bg-lime-400" />
              )}
            </div>
          </div>
        </button>
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
  type="button"
  onClick={handleContinue}
  disabled={
    isStepLoading ||
    createReservation.isPending ||
    createPayment.isPending
  }
  className="
    inline-flex
    items-center
    justify-center
    gap-2
    rounded-xl
    bg-lime-400
    px-7
    py-3
    font-semibold
    text-slate-950
    transition-all
    duration-200
    hover:bg-lime-300
    hover:shadow-lg
    disabled:cursor-not-allowed
    disabled:opacity-60
  "
>
  {isStepLoading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading...
    </>
  ) : createReservation.isPending || createPayment.isPending ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Processing...
    </>
  ) : currentStep === 0 ? (
    <>
      Select Date
      <ArrowRight className="h-4 w-4" />
    </>
  ) : currentStep === 1 ? (
    <>
      Select Time
      <ArrowRight className="h-4 w-4" />
    </>
  ) : currentStep === 2 ? (
    <>
      Continue to Guest Details
      <ArrowRight className="h-4 w-4" />
    </>
  ) : currentStep === 3 ? (
    <>
      Review Booking
      <ArrowRight className="h-4 w-4" />
    </>
  ) : currentStep === 4 ? (
    <>
      Continue to Payment
      <ArrowRight className="h-4 w-4" />
    </>
  ) : (
    <>
      Pay with GCash
      <ArrowRight className="h-4 w-4" />
    </>
  )}
</button>

          </div>
        </div>
      </Container>
    </section>
  );
}