"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import Link from "next/link";

import api from "@/lib/api";

// =====================================================
// TYPES
// =====================================================

type Competition = {
  id: number;

  name: string;

  type: "open_play" | "tournament";

  status:
    | "draft"
    | "published"
    | "registration_open"
    | "registration_closed"
    | "in_progress"
    | "completed"
    | "cancelled";

  start_at: string;

  end_at: string | null;

  registration_start_at: string | null;

  registration_end_at: string | null;

  description: string | null;
};

type Division = {
  id: number;

  competition_id: number;

  name: string;

  skill_level:
    | "beginner"
    | "novice"
    | "intermediate";

  format:
    | "singles"
    | "doubles";

  max_players: number | null;

  entry_fee: number;

  status:
    | "open"
    | "closed"
    | "in_progress"
    | "completed";
};

type ApiResponse<T> = {
  success: boolean;

  message?: string;

  data: T;
};

type RegistrationResponse = {
  id?: number;

  competition_division_id?: number;

  competition_player_id?: number;

  status?: string;

  registered_at?: string;
};

type Step = 1 | 2 | 3;

// =====================================================
// PAGE
// =====================================================

export default function RegisterPage() {
  // ===================================================
  // STEP
  // ===================================================

  const [step, setStep] = useState<Step>(1);

  // ===================================================
  // COMPETITIONS
  // ===================================================

  const [
    competitions,
    setCompetitions,
  ] = useState<Competition[]>([]);

  // ===================================================
  // DIVISIONS
  // ===================================================

  const [
    divisions,
    setDivisions,
  ] = useState<Division[]>([]);

  // ===================================================
  // SELECTION
  // ===================================================

  const [
    competitionId,
    setCompetitionId,
  ] = useState("");

  const [
    divisionId,
    setDivisionId,
  ] = useState("");

  // ===================================================
  // LOADING
  // ===================================================

  const [
    loadingCompetitions,
    setLoadingCompetitions,
  ] = useState(true);

  const [
    loadingDivisions,
    setLoadingDivisions,
  ] = useState(false);

  const [
    registering,
    setRegistering,
  ] = useState(false);

  // ===================================================
  // MESSAGES
  // ===================================================

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  // ===================================================
  // PLAYER DETAILS
  // ===================================================

  const [
    firstName,
    setFirstName,
  ] = useState("");

  const [
    lastName,
    setLastName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  // ===================================================
  // PAYMENT
  // ===================================================

  const [
    paymentProof,
    setPaymentProof,
  ] = useState<File | null>(null);

  const [
    paymentProofPreview,
    setPaymentProofPreview,
  ] = useState<string | null>(null);

  // =====================================================
  // LOAD COMPETITIONS
  // =====================================================

  useEffect(() => {
    async function loadCompetitions() {
      try {
        setLoadingCompetitions(true);

        setError("");

        const response =
          await api.get<
            ApiResponse<Competition[]>
          >("/competitions");

        const available =
          response.data.data.filter(
            (competition) =>
              competition.type === "open_play" &&
              (
                competition.status ===
                  "registration_open" ||
                competition.status ===
                  "published"
              )
          );

        setCompetitions(available);
      } catch (error: any) {
        console.error(
          "Failed to load competitions:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Unable to load available competitions."
        );

        setCompetitions([]);
      } finally {
        setLoadingCompetitions(false);
      }
    }

    loadCompetitions();
  }, []);

  // =====================================================
  // LOAD DIVISIONS
  // =====================================================

  useEffect(() => {
    async function loadDivisions() {
      if (!competitionId) {
        setDivisions([]);

        setDivisionId("");

        return;
      }

      try {
        setLoadingDivisions(true);

        setError("");

        setDivisionId("");

        const response =
          await api.get<
            ApiResponse<Division[]>
          >(
            `/competitions/${competitionId}/divisions`
          );

        const available =
          response.data.data.filter(
            (division) =>
              division.status === "open"
          );

        setDivisions(available);
      } catch (error: any) {
        console.error(
          "Failed to load divisions:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Unable to load divisions."
        );

        setDivisions([]);
      } finally {
        setLoadingDivisions(false);
      }
    }

    loadDivisions();
  }, [competitionId]);

  // =====================================================
  // CLEANUP PAYMENT PREVIEW
  // =====================================================

  useEffect(() => {
    return () => {
      if (paymentProofPreview) {
        URL.revokeObjectURL(
          paymentProofPreview
        );
      }
    };
  }, [paymentProofPreview]);

  // =====================================================
  // SELECTED COMPETITION
  // =====================================================

  const selectedCompetition =
    useMemo(
      () =>
        competitions.find(
          (competition) =>
            String(competition.id) ===
            competitionId
        ),
      [
        competitions,
        competitionId,
      ]
    );

  // =====================================================
  // SELECTED DIVISION
  // =====================================================

  const selectedDivision =
    useMemo(
      () =>
        divisions.find(
          (division) =>
            String(division.id) ===
            divisionId
        ),
      [
        divisions,
        divisionId,
      ]
    );

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(
    value: string | null
  ) {
    if (!value) {
      return "Date TBA";
    }

    return new Date(
      value
    ).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  // =====================================================
  // FORMAT TIME
  // =====================================================

  function formatTime(
    value: string | null
  ) {
    if (!value) {
      return "";
    }

    return new Date(
      value
    ).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  // =====================================================
  // FORMAT SKILL
  // =====================================================

  function formatSkill(
    value: Division["skill_level"]
  ) {
    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  }

  // =====================================================
  // FORMAT FORMAT
  // =====================================================

  function formatFormat(
    value: Division["format"]
  ) {
    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  }

  // =====================================================
  // PAYMENT PROOF
  // =====================================================

  function handlePaymentProofChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    setSuccess("");

    // ---------------------------------------------------
    // Validate image
    // ---------------------------------------------------

    if (!file.type.startsWith("image/")) {
      setError(
        "Please upload a GCash payment screenshot."
      );

      event.target.value = "";

      return;
    }

    // ---------------------------------------------------
    // Maximum 5MB
    // ---------------------------------------------------

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Payment proof must be 5MB or smaller."
      );

      event.target.value = "";

      return;
    }

    // ---------------------------------------------------
    // Remove previous preview
    // ---------------------------------------------------

    if (paymentProofPreview) {
      URL.revokeObjectURL(
        paymentProofPreview
      );
    }

    // ---------------------------------------------------
    // Set payment proof
    // ---------------------------------------------------

    setPaymentProof(file);

    const previewUrl =
      URL.createObjectURL(file);

    setPaymentProofPreview(
      previewUrl
    );
  }

  // =====================================================
  // CONTINUE
  // =====================================================

  function handleContinue() {
    setError("");

    setSuccess("");

    // ===================================================
    // STEP 1 → STEP 2
    // ===================================================

    if (step === 1) {
      if (!competitionId) {
        setError(
          "Please select a competition."
        );

        return;
      }

      if (!divisionId) {
        setError(
          "Please select a division."
        );

        return;
      }

      if (!selectedCompetition) {
        setError(
          "Selected competition was not found."
        );

        return;
      }

      if (!selectedDivision) {
        setError(
          "Selected division was not found."
        );

        return;
      }

      setStep(2);

      return;
    }

    // ===================================================
    // STEP 2 → STEP 3
    // ===================================================

    if (step === 2) {
      if (!paymentProof) {
        setError(
          "Please upload your GCash payment proof before continuing."
        );

        return;
      }

      setStep(3);

      return;
    }
  }

  // =====================================================
  // BACK
  // =====================================================

  function handleBack() {
    setError("");

    setSuccess("");

    if (step === 3) {
      setStep(2);

      return;
    }

    if (step === 2) {
      setStep(1);

      return;
    }
  }

  // =====================================================
  // REGISTER
  // =====================================================

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    setSuccess("");

    // ===================================================
    // VALIDATE DIVISION
    // ===================================================

    if (!divisionId) {
      setError(
        "Please select a division."
      );

      return;
    }

    if (!selectedDivision) {
      setError(
        "Selected division was not found."
      );

      return;
    }

    // ===================================================
    // VALIDATE PAYMENT
    // ===================================================

    if (!paymentProof) {
      setError(
        "Please upload your GCash payment proof."
      );

      setStep(2);

      return;
    }

    // ===================================================
    // VALIDATE FIRST NAME
    // ===================================================

    if (!firstName.trim()) {
      setError(
        "First name is required."
      );

      return;
    }

    // ===================================================
    // VALIDATE LAST NAME
    // ===================================================

    if (!lastName.trim()) {
      setError(
        "Last name is required."
      );

      return;
    }

    // ===================================================
    // VALIDATE EMAIL
    // ===================================================

    if (!email.trim()) {
      setError(
        "Email is required."
      );

      return;
    }

    // ===================================================
    // VALIDATE PHONE
    // ===================================================

    if (!phone.trim()) {
      setError(
        "Phone number is required."
      );

      return;
    }

    // ===================================================
    // SUBMIT
    // ===================================================

    try {
      setRegistering(true);

      // -------------------------------------------------
      // Create multipart form data
      // -------------------------------------------------

      const formData =
        new FormData();

      formData.append(
        "firstName",
        firstName.trim()
      );

      formData.append(
        "lastName",
        lastName.trim()
      );

      formData.append(
        "email",
        email.trim()
      );

      formData.append(
        "phone",
        phone.trim()
      );

      formData.append(
        "skillLevel",
        selectedDivision.skill_level
      );

      formData.append(
        "paymentMethod",
        "GCASH"
      );

      formData.append(
        "paymentProof",
        paymentProof
      );

      // -------------------------------------------------
      // Register player + payment proof
      // -------------------------------------------------

      const response =
        await api.post<
          ApiResponse<RegistrationResponse>
        >(
          `/competitions/divisions/${divisionId}/register`,
          formData
        );

      console.log(
        "Registration successful:",
        response.data
      );

      // -------------------------------------------------
      // Success message
      // -------------------------------------------------

      setSuccess(
        response.data.message ||
          "Registration submitted successfully. Your payment is pending confirmation."
      );

      // -------------------------------------------------
      // Clear player form
      // -------------------------------------------------

      setFirstName("");

      setLastName("");

      setEmail("");

      setPhone("");

      // -------------------------------------------------
      // Clear payment proof
      // -------------------------------------------------

      setPaymentProof(null);

      if (paymentProofPreview) {
        URL.revokeObjectURL(
          paymentProofPreview
        );
      }

      setPaymentProofPreview(null);

    } catch (error: any) {
      console.error(
        "Registration failed:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Unable to complete registration."
      );
    } finally {
      setRegistering(false);
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-white/10">

        <div
          className="
            mx-auto
            flex
            h-20
            max-w-6xl
            items-center
            justify-between
            px-6
          "
        >

          {/* LOGO */}

          <Link
            href="/"
            className="
              text-lg
              font-bold
              tracking-tight
            "
          >
            Rivers Pickleball
          </Link>

          {/* BACK */}

          <Link
            href="/"
            className="
              text-sm
              font-medium
              text-slate-300
              transition
              hover:text-white
            "
          >
            Back to Home
          </Link>

        </div>

      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        className="
          mx-auto
          max-w-5xl
          px-6
          py-12
        "
      >

        {/* =================================================
            HEADING
        ================================================= */}

        <div
          className="
            mx-auto
            max-w-2xl
            text-center
          "
        >

          <div
            className="
              mb-4
              inline-flex
              items-center
              rounded-full
              border
              border-lime-400/20
              bg-lime-400/10
              px-3
              py-1
              text-xs
              font-semibold
              text-lime-400
            "
          >
            OPEN PLAY REGISTRATION
          </div>

          <h1
            className="
              text-3xl
              font-bold
              tracking-tight
              sm:text-4xl
            "
          >
            Register to Play
          </h1>

          <p
            className="
              mt-3
              text-sm
              leading-6
              text-slate-400
              sm:text-base
            "
          >
            Choose an upcoming Open Play
            session, pay the entry fee,
            and register your player details.
          </p>

        </div>

        {/* =================================================
            STEPS
        ================================================= */}

        <div
          className="
            mx-auto
            mt-10
            flex
            max-w-3xl
            items-center
          "
        >

          <StepIndicator
            number="1"
            label="Choose Division"
            active={step === 1}
            completed={step > 1}
          />

          <div
            className={`
              h-px
              flex-1
              ${
                step > 1
                  ? "bg-lime-400"
                  : "bg-white/10"
              }
            `}
          />

          <StepIndicator
            number="2"
            label="GCash Payment"
            active={step === 2}
            completed={step > 2}
          />

          <div
            className={`
              h-px
              flex-1
              ${
                step > 2
                  ? "bg-lime-400"
                  : "bg-white/10"
              }
            `}
          />

          <StepIndicator
            number="3"
            label="Player Details"
            active={step === 3}
            completed={false}
          />

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mx-auto
              mt-8
              max-w-2xl
              rounded-xl
              border
              border-red-400/20
              bg-red-400/10
              px-4
              py-3
              text-sm
              text-red-300
            "
          >
            {error}
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div
            className="
              mx-auto
              mt-8
              max-w-2xl
              rounded-xl
              border
              border-lime-400/20
              bg-lime-400/10
              px-4
              py-3
              text-sm
              text-lime-300
            "
          >
            {success}
          </div>
        )}

        {/* =================================================
            STEP 1
        ================================================= */}

        {step === 1 && (
          <section
            className="
              mx-auto
              mt-10
              max-w-3xl
            "
          >

            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/[0.04]
                p-6
                shadow-2xl
                shadow-black/20
                sm:p-8
              "
            >

              {/* TITLE */}

              <div>

                <h2
                  className="
                    text-lg
                    font-semibold
                  "
                >
                  Choose an Open Play
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-400
                  "
                >
                  Select the competition
                  and division you want
                  to join.
                </p>

              </div>

              {/* =================================================
                  COMPETITION
              ================================================= */}

              <div className="mt-8">

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-slate-200
                  "
                >
                  Competition
                </label>

                {loadingCompetitions ? (

                  <div
                    className="
                      rounded-xl
                      border
                      border-white/10
                      bg-slate-900
                      px-4
                      py-3
                      text-sm
                      text-slate-400
                    "
                  >
                    Loading competitions...
                  </div>

                ) : competitions.length === 0 ? (

                  <div
                    className="
                      rounded-xl
                      border
                      border-white/10
                      bg-slate-900
                      px-4
                      py-5
                      text-sm
                      text-slate-400
                    "
                  >
                    No Open Play competitions
                    are currently available
                    for registration.
                  </div>

                ) : (

                  <select
                    value={competitionId}
                    onChange={(event) => {
                      setCompetitionId(
                        event.target.value
                      );

                      setError("");

                      setSuccess("");

                      // Reset payment when
                      // competition changes
                      setPaymentProof(null);

                      if (paymentProofPreview) {
                        URL.revokeObjectURL(
                          paymentProofPreview
                        );
                      }

                      setPaymentProofPreview(null);
                    }}
                    className="
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-slate-900
                      px-4
                      py-3
                      text-sm
                      text-white
                      outline-none
                      transition
                      focus:border-lime-400
                      focus:ring-2
                      focus:ring-lime-400/10
                    "
                  >

                    <option value="">
                      Select competition
                    </option>

                    {competitions.map(
                      (competition) => (
                        <option
                          key={competition.id}
                          value={
                            competition.id
                          }
                        >
                          {competition.name}
                        </option>
                      )
                    )}

                  </select>

                )}

              </div>

              {/* =================================================
                  COMPETITION INFORMATION
              ================================================= */}

              {selectedCompetition && (
                <div
                  className="
                    mt-4
                    rounded-xl
                    border
                    border-white/10
                    bg-slate-900/70
                    p-4
                  "
                >

                  <p
                    className="
                      font-semibold
                      text-white
                    "
                  >
                    {selectedCompetition.name}
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-400
                    "
                  >
                    {formatDate(
                      selectedCompetition.start_at
                    )}

                    {selectedCompetition.start_at &&
                      ` · ${formatTime(
                        selectedCompetition.start_at
                      )}`}
                  </p>

                  {selectedCompetition.description && (
                    <p
                      className="
                        mt-3
                        text-sm
                        leading-6
                        text-slate-400
                      "
                    >
                      {
                        selectedCompetition.description
                      }
                    </p>
                  )}

                </div>
              )}

              {/* =================================================
                  DIVISION
              ================================================= */}

              <div className="mt-6">

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-slate-200
                  "
                >
                  Division
                </label>

                {!competitionId ? (

                  <div
                    className="
                      rounded-xl
                      border
                      border-dashed
                      border-white/10
                      bg-slate-900/50
                      px-4
                      py-3
                      text-sm
                      text-slate-500
                    "
                  >
                    Select a competition
                    first.
                  </div>

                ) : loadingDivisions ? (

                  <div
                    className="
                      rounded-xl
                      border
                      border-white/10
                      bg-slate-900
                      px-4
                      py-3
                      text-sm
                      text-slate-400
                    "
                  >
                    Loading divisions...
                  </div>

                ) : divisions.length === 0 ? (

                  <div
                    className="
                      rounded-xl
                      border
                      border-white/10
                      bg-slate-900
                      px-4
                      py-5
                      text-sm
                      text-slate-400
                    "
                  >
                    No open divisions
                    are currently
                    available.
                  </div>

                ) : (

                  <select
                    value={divisionId}
                    onChange={(event) => {
                      setDivisionId(
                        event.target.value
                      );

                      setError("");

                      setSuccess("");

                      // Reset payment when
                      // division changes
                      setPaymentProof(null);

                      if (paymentProofPreview) {
                        URL.revokeObjectURL(
                          paymentProofPreview
                        );
                      }

                      setPaymentProofPreview(null);
                    }}
                    className="
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-slate-900
                      px-4
                      py-3
                      text-sm
                      text-white
                      outline-none
                      transition
                      focus:border-lime-400
                      focus:ring-2
                      focus:ring-lime-400/10
                    "
                  >

                    <option value="">
                      Select division
                    </option>

                    {divisions.map(
                      (division) => (
                        <option
                          key={division.id}
                          value={division.id}
                        >
                          {division.name}
                          {" · "}
                          {formatSkill(
                            division.skill_level
                          )}
                          {" · "}
                          {formatFormat(
                            division.format
                          )}
                        </option>
                      )
                    )}

                  </select>

                )}

              </div>

              {/* =================================================
                  DIVISION PREVIEW
              ================================================= */}

              {selectedDivision && (
                <div
                  className="
                    mt-4
                    grid
                    gap-3
                    sm:grid-cols-3
                  "
                >

                  <InfoCard
                    label="Skill Level"
                    value={formatSkill(
                      selectedDivision.skill_level
                    )}
                  />

                  <InfoCard
                    label="Format"
                    value={formatFormat(
                      selectedDivision.format
                    )}
                  />

                  <InfoCard
                    label="Entry Fee"
                    value={`₱${Number(
                      selectedDivision.entry_fee
                    ).toFixed(2)}`}
                  />

                </div>
              )}

              {/* =================================================
                  CONTINUE
              ================================================= */}

              <div
                className="
                  mt-8
                  flex
                  justify-end
                "
              >

                <button
                  type="button"
                  onClick={
                    handleContinue
                  }
                  disabled={
                    !competitionId ||
                    !divisionId
                  }
                  className="
                    rounded-xl
                    bg-lime-400
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-slate-950
                    transition
                    hover:bg-lime-300
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Continue to Payment
                </button>

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            STEP 2 - GCASH PAYMENT
        ================================================= */}

        {step === 2 && (
          <section
            className="
              mx-auto
              mt-10
              max-w-3xl
            "
          >

            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/[0.04]
                p-6
                shadow-2xl
                shadow-black/20
                sm:p-8
              "
            >

              {/* HEADER */}

              <div className="mb-8">

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-lime-400
                  "
                >
                  Payment
                </p>

                <h2
                  className="
                    mt-2
                    text-2xl
                    font-bold
                  "
                >
                  GCash Payment
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-slate-400
                  "
                >
                  Pay the exact entry fee
                  using GCash, then upload
                  your payment screenshot.
                </p>

              </div>

              {/* =================================================
                  SELECTED DIVISION
              ================================================= */}

              {selectedDivision && (
                <div
                  className="
                    mb-6
                    rounded-xl
                    border
                    border-white/10
                    bg-slate-900/70
                    p-5
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >

                    <div>

                      <p
                        className="
                          text-xs
                          text-slate-500
                        "
                      >
                        Division
                      </p>

                      <p
                        className="
                          mt-1
                          font-semibold
                          text-white
                        "
                      >
                        {selectedDivision.name}
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-slate-400
                        "
                      >
                        {formatSkill(
                          selectedDivision.skill_level
                        )}

                        {" · "}

                        {formatFormat(
                          selectedDivision.format
                        )}
                      </p>

                    </div>

                    <div className="text-right">

                      <p
                        className="
                          text-xs
                          text-slate-500
                        "
                      >
                        Entry Fee
                      </p>

                      <p
                        className="
                          mt-1
                          text-2xl
                          font-black
                          text-lime-400
                        "
                      >
                        ₱
                        {Number(
                          selectedDivision.entry_fee
                        ).toFixed(2)}
                      </p>

                    </div>

                  </div>

                </div>
              )}

              {/* =================================================
                  AMOUNT
              ================================================= */}

              <div
                className="
                  mb-6
                  rounded-2xl
                  border
                  border-lime-400/20
                  bg-lime-400/5
                  p-6
                  text-center
                "
              >

                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >
                  Amount to Send
                </p>

                <p
                  className="
                    mt-2
                    text-4xl
                    font-black
                    text-lime-400
                  "
                >
                  ₱
                  {selectedDivision
                    ? Number(
                        selectedDivision.entry_fee
                      ).toFixed(2)
                    : "0.00"}
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    text-slate-500
                  "
                >
                  Please send the exact
                  amount shown above.
                </p>

              </div>

              {/* =================================================
                  GCASH QR CODE
              ================================================= */}

              <div
                className="
                  mb-6
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  p-6
                "
              >

                <div className="text-center">

                  <h3
                    className="
                      text-xl
                      font-bold
                    "
                  >
                    Scan to Pay
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      text-slate-400
                    "
                  >
                    Scan the organizer's
                    GCash QR code using
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
                    alt="GCash QR Code"
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

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <span
                      className="
                        text-sm
                        text-slate-400
                      "
                    >
                      Amount to send
                    </span>

                    <span
                      className="
                        font-bold
                        text-lime-400
                      "
                    >
                      ₱
                      {selectedDivision
                        ? Number(
                            selectedDivision.entry_fee
                          ).toFixed(2)
                        : "0.00"}
                    </span>

                  </div>

                  <p
                    className="
                      mt-3
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    After sending the payment,
                    take a screenshot of the
                    successful GCash transaction
                    and upload it below.
                  </p>

                </div>

              </div>

              {/* =================================================
                  PAYMENT PROOF
              ================================================= */}

              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-slate-900/60
                  p-6
                "
              >

                <div className="mb-5">

                  <h3
                    className="
                      text-lg
                      font-semibold
                    "
                  >
                    Proof of Payment
                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-400
                    "
                  >
                    Upload a screenshot showing
                    your successful GCash
                    transaction.
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
                        alt="GCash payment proof"
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

                      <p
                        className="
                          mt-1
                          text-xs
                          text-slate-500
                        "
                      >
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
                        Upload GCash payment proof
                      </p>

                      <p
                        className="
                          mt-2
                          text-sm
                          text-slate-500
                        "
                      >
                        PNG, JPG or JPEG
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-slate-600
                        "
                      >
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

              {/* =================================================
                  IMPORTANT NOTICE
              ================================================= */}

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

                    <h4
                      className="
                        font-semibold
                        text-amber-300
                      "
                    >
                      Important Registration Notice
                    </h4>

                    <p
                      className="
                        mt-2
                        text-sm
                        leading-6
                        text-slate-400
                      "
                    >
                      Your registration will
                      remain{" "}
                      <span
                        className="
                          font-semibold
                          text-white
                        "
                      >
                        Pending
                      </span>{" "}
                      until your GCash payment
                      has been reviewed and
                      confirmed.
                    </p>

                    <p
                      className="
                        mt-2
                        text-sm
                        leading-6
                        text-slate-400
                      "
                    >
                      You will receive a
                      notification once your
                      registration has been
                      confirmed.
                    </p>

                    <p
                      className="
                        mt-2
                        text-sm
                        leading-6
                        text-slate-400
                      "
                    >
                      Please make sure the
                      uploaded screenshot clearly
                      shows the successful
                      transaction.
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div
                className="
                  mt-8
                  flex
                  flex-col-reverse
                  gap-3
                  border-t
                  border-white/10
                  pt-6
                  sm:flex-row
                  sm:justify-between
                "
              >

                <button
                  type="button"
                  onClick={
                    handleBack
                  }
                  className="
                    rounded-xl
                    border
                    border-white/10
                    px-5
                    py-3
                    text-sm
                    font-medium
                    text-slate-300
                    transition
                    hover:bg-white/5
                    hover:text-white
                  "
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={
                    handleContinue
                  }
                  disabled={!paymentProof}
                  className="
                    rounded-xl
                    bg-lime-400
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-slate-950
                    transition
                    hover:bg-lime-300
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Continue to Player Details
                </button>

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            STEP 3 - PLAYER DETAILS
        ================================================= */}

        {step === 3 && (
          <section
            className="
              mx-auto
              mt-10
              max-w-3xl
            "
          >

            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/[0.04]
                p-6
                shadow-2xl
                shadow-black/20
                sm:p-8
              "
            >

              {/* =================================================
                  PAYMENT CONFIRMED UPLOAD
              ================================================= */}

              <div
                className="
                  mb-8
                  rounded-xl
                  border
                  border-lime-400/20
                  bg-lime-400/5
                  p-4
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
                      bg-lime-400
                      font-bold
                      text-slate-950
                    "
                  >
                    ✓
                  </div>

                  <div>

                    <p
                      className="
                        font-semibold
                        text-white
                      "
                    >
                      GCash proof uploaded
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-400
                      "
                    >
                      Your payment proof will
                      be reviewed by the admin
                      before your registration
                      is confirmed.
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  SELECTED DIVISION
              ================================================= */}

              {selectedCompetition &&
                selectedDivision && (
                  <div
                    className="
                      mb-8
                      rounded-xl
                      border
                      border-white/10
                      bg-slate-900/70
                      p-4
                    "
                  >

                    <p
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-lime-400
                      "
                    >
                      Your selection
                    </p>

                    <p
                      className="
                        mt-2
                        font-semibold
                        text-white
                      "
                    >
                      {selectedCompetition.name}
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-400
                      "
                    >
                      {selectedDivision.name}
                      {" · "}
                      {formatSkill(
                        selectedDivision.skill_level
                      )}
                      {" · "}
                      {formatFormat(
                        selectedDivision.format
                      )}
                    </p>

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        justify-between
                        border-t
                        border-white/10
                        pt-3
                      "
                    >

                      <span
                        className="
                          text-sm
                          text-slate-500
                        "
                      >
                        Entry fee
                      </span>

                      <span
                        className="
                          font-bold
                          text-lime-400
                        "
                      >
                        ₱
                        {Number(
                          selectedDivision.entry_fee
                        ).toFixed(2)}
                      </span>

                    </div>

                  </div>
                )}

              {/* =================================================
                  PLAYER INFORMATION
              ================================================= */}

              <div>

                <h2
                  className="
                    text-lg
                    font-semibold
                  "
                >
                  Player Details
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-400
                  "
                >
                  Enter the details of the
                  player who will participate.
                </p>

              </div>

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={
                  handleRegister
                }
                className="
                  mt-8
                  space-y-6
                "
              >

                {/* =================================================
                    NAME
                ================================================= */}

                <div
                  className="
                    grid
                    gap-6
                    sm:grid-cols-2
                  "
                >

                  <FormField
                    label="First Name"
                    value={firstName}
                    onChange={
                      setFirstName
                    }
                    placeholder="Enter first name"
                  />

                  <FormField
                    label="Last Name"
                    value={lastName}
                    onChange={
                      setLastName
                    }
                    placeholder="Enter last name"
                  />

                </div>

                {/* =================================================
                    CONTACT
                ================================================= */}

                <div
                  className="
                    grid
                    gap-6
                    sm:grid-cols-2
                  "
                >

                  <FormField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={
                      setEmail
                    }
                    placeholder="you@example.com"
                  />

                  <FormField
                    label="Phone Number"
                    value={phone}
                    onChange={
                      setPhone
                    }
                    placeholder="09XXXXXXXXX"
                  />

                </div>

                {/* =================================================
                    FINAL NOTICE
                ================================================= */}

                <div
                  className="
                    rounded-xl
                    border
                    border-amber-400/20
                    bg-amber-400/5
                    p-4
                  "
                >

                  <p
                    className="
                      text-sm
                      leading-6
                      text-slate-400
                    "
                  >
                    By submitting this
                    registration, you understand
                    that your registration will
                    remain{" "}
                    <span
                      className="
                        font-semibold
                        text-amber-300
                      "
                    >
                      Pending
                    </span>{" "}
                    until the admin verifies
                    your GCash payment.
                  </p>

                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div
                  className="
                    flex
                    flex-col-reverse
                    gap-3
                    border-t
                    border-white/10
                    pt-6
                    sm:flex-row
                    sm:justify-between
                  "
                >

                  <button
                    type="button"
                    onClick={
                      handleBack
                    }
                    disabled={
                      registering
                    }
                    className="
                      rounded-xl
                      border
                      border-white/10
                      px-5
                      py-3
                      text-sm
                      font-medium
                      text-slate-300
                      transition
                      hover:bg-white/5
                      hover:text-white
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={
                      registering
                    }
                    className="
                      rounded-xl
                      bg-lime-400
                      px-6
                      py-3
                      text-sm
                      font-semibold
                      text-slate-950
                      transition
                      hover:bg-lime-300
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {registering
                      ? "Submitting..."
                      : "Submit Registration"}
                  </button>

                </div>

              </form>

            </div>

          </section>
        )}

      </div>

    </main>
  );
}

// =====================================================
// STEP INDICATOR
// =====================================================

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: string;

  label: string;

  active: boolean;

  completed: boolean;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
      "
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
          text-sm
          font-semibold
          transition

          ${
            active || completed
              ? "bg-lime-400 text-slate-950"
              : "bg-white/10 text-slate-500"
          }
        `}
      >
        {completed
          ? "✓"
          : number}
      </div>

      <span
        className={`
          hidden
          whitespace-nowrap
          text-sm
          font-medium
          sm:block

          ${
            active
              ? "text-white"
              : "text-slate-500"
          }
        `}
      >
        {label}
      </span>

    </div>
  );
}

// =====================================================
// INFO CARD
// =====================================================

function InfoCard({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/10
        bg-slate-900/70
        p-4
      "
    >

      <p
        className="
          text-xs
          text-slate-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-sm
          font-semibold
          text-white
        "
      >
        {value}
      </p>

    </div>
  );
}

// =====================================================
// FORM FIELD
// =====================================================

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;

  value: string;

  onChange: (
    value: string
  ) => void;

  placeholder: string;

  type?: string;
}) {
  return (
    <div>

      <label
        className="
          mb-2
          block
          text-sm
          font-medium
          text-slate-200
        "
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="
          w-full
          rounded-xl
          border
          border-white/10
          bg-slate-900
          px-4
          py-3
          text-sm
          text-white
          placeholder:text-slate-600
          outline-none
          transition
          focus:border-lime-400
          focus:ring-2
          focus:ring-lime-400/10
        "
      />

    </div>
  );
}