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
import {
  getCourtScheduleOverrides,
  CourtScheduleOverride,
} from "@/lib/api/courtScheduleOverrides";
import { useCourts } from "@/hooks/useCourts";
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
  
  // Get courts
  const { data: courts = [] } =
    useCourts();

  // Selected court
  const selectedCourtData = courts.find(
    (court) =>
      court.id === selectedCourt
  );

  // Total amount
  const totalAmount =
    selectedCourtData &&
    selectedStartTime &&
    selectedEndTime
      ? Number(
          selectedCourtData.hourly_rate
        ) *
        (
          (
            Number(
              selectedEndTime.split(":")[0]
            ) * 60 +
            Number(
              selectedEndTime.split(":")[1]
            )
          ) -
          (
            Number(
              selectedStartTime.split(":")[0]
            ) * 60 +
            Number(
              selectedStartTime.split(":")[1]
            )
          )
        ) /
        60
      : 0;
  const [paymentMethod, setPaymentMethod] =
    useState<"GCASH" | null>(null);

  const [paymentProof, setPaymentProof] =
    useState<File | null>(null);

  const [paymentProofPreview, setPaymentProofPreview] =
    useState<string | null>(null);
  const [courtOverrides, setCourtOverrides] =
  useState<CourtScheduleOverride[]>([]);
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

useEffect(() => {
  if (!selectedCourt) {
    setCourtOverrides([]);
    return;
  }



  const loadCourtOverrides = async () => {
    try {
      const data =
        await getCourtScheduleOverrides(selectedCourt);

      setCourtOverrides(data);
    } catch (error) {
      console.error(
        "Failed to load court schedule overrides:",
        error
      );

      setCourtOverrides([]);
    }
  };

  loadCourtOverrides();
}, [selectedCourt]);

const handlePaymentProofChange = (
  event: React.ChangeEvent<HTMLInputElement>
) => {

  const file =
    event.target.files?.[0];

  if (!file) {
    return;
  }

  // Only images
  if (!file.type.startsWith("image/")) {
    toast.error(
      "Please upload an image file."
    );

    return;
  }

  // Maximum 5MB
  if (file.size > 5 * 1024 * 1024) {
    toast.error(
      "Payment proof must be 5MB or smaller."
    );

    return;
  }

  setPaymentProof(file);

  const previewUrl =
    URL.createObjectURL(file);

  setPaymentProofPreview(
    previewUrl
  );
};
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

  if (currentStep === 5) {
    if (!paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    if (paymentMethod === "GCASH" && !paymentProof) {
      toast.error("Please upload your GCash proof of payment.");
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

  // ==========================================
  // VALIDATE PAYMENT
  // ==========================================

  if (!paymentMethod) {
    toast.error(
      "Please select a payment method."
    );
    return;
  }

  if (
    paymentMethod === "GCASH" &&
    !paymentProof
  ) {
    toast.error(
      "Please upload your GCash proof of payment."
    );
    return;
  }

  const proof = paymentProof;

  if (!proof) {
    toast.error(
      "Please upload your GCash proof of payment."
    );
    return;
  }

  try {
    // ==========================================
    // 1. CREATE RESERVATION
    // ==========================================

    const reservation =
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

    // ==========================================
    // 2. GET RESERVATION ID
    // ==========================================

    const reservationId =
      reservation.id;

    if (
      !reservationId ||
      !Number.isInteger(reservationId) ||
      reservationId <= 0
    ) {
      console.error(
        "Invalid reservation response:",
        reservation
      );

      throw new Error(
        "Reservation was created, but the reservation ID was not returned."
      );
    }

    console.log(
      "Created reservation:",
      reservation
    );

    console.log(
      "Reservation ID:",
      reservationId
    );

    // ==========================================
    // 3. CREATE PAYMENT FORM DATA
    // ==========================================

    const formData =
      new FormData();

    formData.append(
      "reservation_id",
      String(reservationId)
    );

    formData.append(
      "payment_method",
      "GCASH"
    );

    formData.append(
      "proof",
      proof
    );

    // ==========================================
    // 4. UPLOAD PAYMENT PROOF
    // ==========================================

    const paymentResult =
      await createPayment.mutateAsync(
        formData
      );

    console.log(
      "Payment proof uploaded:",
      paymentResult
    );

    // ==========================================
    // 5. SUCCESS MESSAGE
    // ==========================================

    toast.success(
      "Payment proof uploaded successfully."
    );

    toast.success(
      "Your reservation is pending confirmation. You will receive a message once it is confirmed."
    );

    // ==========================================
    // 6. REDIRECT TO SUCCESS PAGE
    // ==========================================

    router.push(
      `/reservation/success/${reservation.uuid}`
    );

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
      overrides={courtOverrides}
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

{/* ============================================================
    PAYMENT
============================================================ */}
{/* ============================================================
    PAYMENT
============================================================ */}

{currentStep === 5 && (
  <div
    id="payment-step"
    className="scroll-mt-28"
  >
    <div className="mx-auto max-w-3xl">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-lime-400">
          Payment
        </p>

        <h2 className="mt-2 text-3xl font-black">
          GCash Payment
        </h2>

        <p className="mt-3 text-slate-400">
          Scan the owner's GCash QR code and upload
          your payment proof to submit your reservation.
        </p>
      </div>

      {/* ======================================================
          TOTAL AMOUNT
      ====================================================== */}

      <div
        className="
          mb-6
          rounded-2xl
          border
          border-lime-400/30
          bg-lime-400/10
          p-6
          text-center
        "
      >
        <p className="text-sm text-slate-400">
          Total Amount to Pay
        </p>

        <p className="mt-2 text-4xl font-black text-lime-400">
          
          {totalAmount.toLocaleString("en-PH", {
              style: "currency",
              currency: "PHP",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Please pay the exact amount shown above.
        </p>
      </div>

      {/* ======================================================
          GCASH QR CODE
      ====================================================== */}

      <div
        className="
          mb-6
          rounded-2xl
          border
          border-white/10
          bg-white/5
          p-6
        "
      >
        <div className="text-center">

          <h3 className="text-xl font-bold">
            Scan to Pay
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Scan the owner's GCash QR code using
            your GCash application.
          </p>

        </div>

        <div
          className="
            mx-auto
            mt-6
            flex
            w-fit
            items-center
            justify-center
            rounded-2xl
            bg-white
            p-4
          "
        >
          <img
             src="/images/Hero.png"
            alt="Owner GCash QR Code"
            className="
              h-64
              w-64
              object-contain
            "
          />
        </div>

        {/* Amount reminder */}

        <div
          className="
            mt-6
            rounded-xl
            border
            border-white/10
            bg-slate-950/70
            p-4
          "
        >
          <div className="flex items-center justify-between">

            <span className="text-sm text-slate-400">
              Amount to send
            </span>

            <span className="font-bold text-lime-400">
              
             {totalAmount.toLocaleString("en-PH", {
                  style: "currency",
                  currency: "PHP",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </span>

          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            After sending the payment, take a
            screenshot of the successful GCash
            transaction and upload it below.
          </p>
        </div>
      </div>

      {/* ======================================================
          PAYMENT METHOD
      ====================================================== */}

      <div className="mb-6">

        <button
          type="button"
          onClick={() =>
            setPaymentMethod("GCASH")
          }
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
                Upload your GCash payment screenshot.
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
                <div
                  className="
                    h-3
                    w-3
                    rounded-full
                    bg-lime-400
                  "
                />
              )}

            </div>

          </div>

        </button>

      </div>

      {/* ======================================================
          UPLOAD PAYMENT PROOF
      ====================================================== */}

      {paymentMethod === "GCASH" && (
        <div
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-6
          "
        >

          <div className="mb-5">

            <h3 className="text-lg font-semibold">
              Proof of Payment
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Upload a screenshot showing your
              completed GCash transaction.
            </p>

          </div>

          <label
            htmlFor="payment-proof"
            className="
              flex
              min-h-[220px]
              cursor-pointer
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-dashed
              border-white/20
              bg-slate-950/60
              p-6
              text-center
              transition
              hover:border-lime-400/50
              hover:bg-slate-950
            "
          >

            {paymentProofPreview ? (
              <div className="w-full">

                <img
                  src={paymentProofPreview}
                  alt="Payment proof preview"
                  className="
                    mx-auto
                    max-h-[350px]
                    rounded-xl
                    object-contain
                  "
                />

                <p
                  className="
                    mt-4
                    truncate
                    text-sm
                    text-slate-400
                  "
                >
                  {paymentProof?.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Click to replace image
                </p>

              </div>
            ) : (
              <>

                <div
                  className="
                    mb-4
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-lime-400/10
                    text-2xl
                    text-lime-400
                  "
                >
                  ↑
                </div>

                <p className="font-semibold">
                  Upload payment proof
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  PNG, JPG or JPEG
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Maximum file size: 5MB
                </p>

              </>
            )}

          </label>

          <input
            id="payment-proof"
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={
              handlePaymentProofChange
            }
          />

        </div>
      )}

      {/* ======================================================
          IMPORTANT NOTICE
      ====================================================== */}

      <div
        className="
          mt-6
          rounded-2xl
          border
          border-amber-400/20
          bg-amber-400/5
          p-5
        "
      >

        <div className="flex gap-3">

          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-amber-400/10
              font-bold
              text-amber-400
            "
          >
            !
          </div>

          <div>

            <h4 className="font-semibold text-amber-300">
              Important Reservation Notice
            </h4>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Your reservation will remain{" "}
              <span className="font-semibold text-white">
                Pending
              </span>{" "}
              until your payment proof has been
              reviewed.
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              You will receive a message once your
              reservation has been confirmed.
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              If your reservation is not confirmed
              within{" "}
              <span className="font-semibold text-amber-300">
                24 hours
              </span>
              , the reservation will be
              automatically cancelled.
            </p>

          </div>

        </div>

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
        Submit Payment Proof
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