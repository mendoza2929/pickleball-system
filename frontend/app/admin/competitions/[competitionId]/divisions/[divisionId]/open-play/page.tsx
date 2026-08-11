"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Gamepad2,
  GripVertical,
  Loader2,
  Eye,
  MapPin,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Trophy,
  Users,
  UserCheck,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { queueService } from "@/services/competitions/queue.service";
import { checkinService } from "@/services/competitions/checkin.service";
import { Badge } from "@/components/ui/badge";


// ============================================================
// TYPES
// ============================================================

type SessionStatus =
  | "scheduled"
  | "live"
  | "paused"
  | "completed"
  | "cancelled";

type CheckinStatus =
  | "checked_in"
  | "no_show"
  | "cancelled";

type QueueStatus =
  | "waiting"
  | "matched"
  | "called"
  | "playing"
  | "completed"
  | "removed";

type MatchStatus =
  | "pending"
  | "called"
  | "playing"
  | "completed"
  | "cancelled";

interface Session {
  id: number;
  competition_division_id: number;
  status: SessionStatus;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;

  competition_id?: number;
  division_name?: string;
  skill_level?: string;
  format?: string;
  max_players?: number;
  entry_fee?: number;
  division_status?: string;
}

interface Registration {
  id: number;
  competition_division_id: number;
  competition_player_id: number;
  status: "pending" | "confirmed" | "waitlisted" | "cancelled";
  registered_at?: string | null;
  customer_id?: number;
  customer_no?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  player_skill_level?: string;
  player_status?: string;

  // Payment verification fields returned by the registrations API.
  payment_method?: string | null;
  payment_amount?: number | string | null;
  payment_status?: string | null;
  payment_proof_url?: string | null;
  payment_proof?: string | null;
  payment_proof_path?: string | null;
  proof_image_url?: string | null;
  payment_reference?: string | null;
  payment_transaction_id?: string | null;
  payment_paid_at?: string | null;
}

interface Checkin {
  id: number;
  competition_registration_id?: number;
  competition_player_id?: number;
  player_name?: string;
  first_name?: string;
  last_name?: string;
  status: CheckinStatus;
  checked_in_at?: string | null;
}

interface QueueEntry {
  id: number;
  competition_session_id: number;
  competition_checkin_id?: number;
  competition_player_id?: number;

  player_name?: string;
  first_name?: string;
  last_name?: string;

  status: QueueStatus;
  queued_at?: string;
  called_at?: string | null;
}

interface MatchPlayer {
  id?: number;
  competition_player_id: number;
  team: "A" | "B";
  position: number;

  player_name?: string;
  first_name?: string;
  last_name?: string;
}

interface Match {
  id: number;
  competition_session_id: number;
  match_number: number;
  court_id: number | null;
  court_name?: string | null;

  status: MatchStatus;

  team_a_score?: number | null;
  team_b_score?: number | null;

  started_at?: string | null;
  completed_at?: string | null;
  court_assigned_at?: string | null;

  players?: MatchPlayer[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}


// ============================================================
// HELPERS
// ============================================================

function getPlayerName(
  player:
    | Checkin
    | QueueEntry
    | MatchPlayer
    | null
    | undefined
) {
  if (!player) {
    return "Unknown Player";
  }

  if (player.player_name) {
    return player.player_name;
  }

  const name = [
    player.first_name,
    player.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return name || "Player";
}


function formatTime(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  try {
    return new Date(value).toLocaleTimeString(
      [],
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  } catch {
    return "—";
  }
}


/**
 * Resolve the payment-proof path the same way the Reservations page does.
 *
 * Supports:
 * - https://backend.example.com/uploads/payment-proofs/file.png
 * - /uploads/payment-proofs/file.png
 * - uploads/payment-proofs/file.png
 * - payment-proof filename only
 * - Windows-style backslash paths
 */
function getProofUrl(
  proofUrl?: string | null
): string | null {
  if (!proofUrl) {
    return null;
  }

  const value = String(proofUrl).trim();

  if (!value) {
    return null;
  }

  // Already a complete URL.
  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:5000";

  const baseUrl = backendUrl.replace(/\/$/, "");

  // Normalize Windows paths.
  let normalizedPath = value.replace(/\\/g, "/");

  if (!normalizedPath.startsWith("/")) {
    normalizedPath = `/${normalizedPath}`;
  }

  // If the database only stores the filename/path without /uploads,
  // resolve it to the same payment-proof upload directory used by Reservations.
  if (!normalizedPath.startsWith("/uploads/")) {
    normalizedPath =
      `/uploads/payment-proofs${normalizedPath}`;
  }

  return `${baseUrl}${normalizedPath}`;
}


// ============================================================
// STATUS BADGES
// ============================================================

function SessionStatusBadge({
  status,
}: {
  status: SessionStatus;
}) {
  const config: Record<
    SessionStatus,
    {
      label: string;
      className: string;
    }
  > = {
    scheduled: {
      label: "Scheduled",
      className:
        "border-slate-200 bg-slate-50 text-slate-700",
    },

    live: {
      label: "Live",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    paused: {
      label: "Paused",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    completed: {
      label: "Completed",
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    },

    cancelled: {
      label: "Cancelled",
      className:
        "border-red-200 bg-red-50 text-red-700",
    },
  };

  const item = config[status];

  return (
    <Badge
      variant="outline"
      className={`font-medium ${item.className}`}
    >
      {status === "live" && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
      )}

      {item.label}
    </Badge>
  );
}


function MatchStatusBadge({
  status,
}: {
  status: MatchStatus;
}) {
  const config: Record<
    MatchStatus,
    {
      label: string;
      className: string;
    }
  > = {
    pending: {
      label: "Waiting Court",
      className:
        "border-slate-200 bg-slate-50 text-slate-700",
    },

    called: {
      label: "Called",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    playing: {
      label: "Playing",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    completed: {
      label: "Completed",
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    },

    cancelled: {
      label: "Cancelled",
      className:
        "border-red-200 bg-red-50 text-red-700",
    },
  };

  const item = config[status];

  return (
    <Badge
      variant="outline"
      className={`font-medium ${item.className}`}
    >
      {item.label}
    </Badge>
  );
}


// ============================================================
// PAGE
// ============================================================

export default function OpenPlayPage() {
  const params = useParams();

  const competitionId = Number(
    params.competitionId
  );

  const divisionId = Number(
    params.divisionId
  );

  // ==========================================================
  // STATE
  // ==========================================================

  const [session, setSession] =
    useState<Session | null>(null);

  const [registrations, setRegistrations] =
    useState<Registration[]>([]);

  const [checkins, setCheckins] =
    useState<Checkin[]>([]);

  const [queue, setQueue] =
    useState<QueueEntry[]>([]);

  const [matches, setMatches] =
    useState<Match[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================================
  // PAYMENT REVIEW
  // ==========================================================

  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);

  const [paymentReviewOpen, setPaymentReviewOpen] =
    useState(false);

  // ==========================================================
  // MANUAL TEAM SELECTION
  // ==========================================================

  const [teamAIds, setTeamAIds] =
    useState<number[]>([]);

  const [teamBIds, setTeamBIds] =
    useState<number[]>([]);

  const [draggedPlayerId, setDraggedPlayerId] =
    useState<number | null>(null);

  const waitingPlayers = useMemo(
    () =>
      queue.filter(
        (item) => item.status === "waiting"
      ),
    [queue]
  );

  const teamAPlayers = useMemo(
    () =>
      teamAIds
        .map((id) =>
          waitingPlayers.find(
            (player) => player.id === id
          )
        )
        .filter(Boolean) as QueueEntry[],
    [teamAIds, waitingPlayers]
  );

  const teamBPlayers = useMemo(
    () =>
      teamBIds
        .map((id) =>
          waitingPlayers.find(
            (player) => player.id === id
          )
        )
        .filter(Boolean) as QueueEntry[],
    [teamBIds, waitingPlayers]
  );

  // ==========================================================
  // MATCH FORMAT
  // ==========================================================

  // Normalize the session/division format.
  // Supports: single, singles, Single, SINGLES, single-player, etc.
  const normalizedFormat = String(
    session?.format || ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  const isSingles =
    normalizedFormat === "single" ||
    normalizedFormat === "singles";

  const playersPerTeam =
    isSingles ? 1 : 2;

  const totalPlayersPerMatch =
    playersPerTeam * 2;

  const matchFormatLabel =
    isSingles ? "Singles" : "Doubles";

  function removeFromTeams(playerId: number) {
    setTeamAIds((current) =>
      current.filter((id) => id !== playerId)
    );

    setTeamBIds((current) =>
      current.filter((id) => id !== playerId)
    );
  }

  function assignPlayer(
    playerId: number,
    team: "A" | "B"
  ) {
    const player = waitingPlayers.find(
      (item) => item.id === playerId
    );

    if (!player) {
      return;
    }

    const alreadyInTeam =
      team === "A"
        ? teamAIds.includes(playerId)
        : teamBIds.includes(playerId);

    if (alreadyInTeam) {
      setDraggedPlayerId(null);
      return;
    }

    const teamIsFull =
      team === "A"
        ? teamAIds.length >= playersPerTeam
        : teamBIds.length >= playersPerTeam;

    if (teamIsFull) {
      setError(
        `Team ${team} already has ${playersPerTeam} player${
          playersPerTeam === 1 ? "" : "s"
        }.`
      );
      setDraggedPlayerId(null);
      return;
    }

    removeFromTeams(playerId);

    if (team === "A") {
      setTeamAIds((current) =>
        current.length < playersPerTeam
          ? [...current, playerId]
          : current
      );
    } else {
      setTeamBIds((current) =>
        current.length < playersPerTeam
          ? [...current, playerId]
          : current
      );
    }

    setError(null);
    setDraggedPlayerId(null);
  }

  function clearTeamSelection() {
    setTeamAIds([]);
    setTeamBIds([]);
    setDraggedPlayerId(null);
  }

  // ==========================================================
  // LOAD SESSION
  // ==========================================================

  const loadSession =
    useCallback(async () => {
      if (
        !Number.isInteger(divisionId) ||
        divisionId <= 0
      ) {
        setError("Invalid division ID.");
        setLoading(false);
        return;
      }

      try {
        setError(null);

        const response =
          await api.get<
            ApiResponse<Session | null>
          >(
            `/competitions/divisions/${divisionId}/session`
          );

        setSession(
          response.data.data
        );
      } catch (err: any) {
        console.error(
          "Load session error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load Open Play session."
        );
      }
    }, [divisionId]);

  // ==========================================================
  // LOAD REGISTRATIONS
  // ==========================================================

  const loadRegistrations =
    useCallback(async () => {
      if (
        !Number.isInteger(divisionId) ||
        divisionId <= 0
      ) {
        return;
      }

      try {
        const response =
          await api.get<
            ApiResponse<Registration[]>
          >(
            `/competitions/divisions/${divisionId}/registrations`
          );

        setRegistrations(
          response.data.data || []
        );
      } catch (err) {
        console.error(
          "Load registrations error:",
          err
        );

        setRegistrations([]);
      }
    }, [divisionId]);

  // ==========================================================
  // LOAD CHECKINS
  // ==========================================================

  const loadCheckins =
    useCallback(async () => {
      if (
        !Number.isInteger(divisionId) ||
        divisionId <= 0
      ) {
        return;
      }

      try {
        const response =
          await api.get<
            ApiResponse<Checkin[]>
          >(
            `/competitions/divisions/${divisionId}/check-ins`
          );

        setCheckins(
          response.data.data || []
        );
      } catch (err) {
        console.error(
          "Load check-ins error:",
          err
        );

        setCheckins([]);
      }
    }, [divisionId]);

  // ==========================================================
  // LOAD QUEUE
  // ==========================================================

  const loadQueue =
    useCallback(
      async (sessionId: number) => {
        try {
          const response =
            await api.get<
              ApiResponse<QueueEntry[]>
            >(
              `/competitions/sessions/${sessionId}/queue`
            );

          setQueue(
            response.data.data || []
          );
        } catch (err) {
          console.error(
            "Load queue error:",
            err
          );

          setQueue([]);
        }
      },
      []
    );

  // ==========================================================
  // LOAD MATCHES
  // ==========================================================

  const loadMatches =
    useCallback(
      async (sessionId: number) => {
        try {
          const response =
            await api.get<
              ApiResponse<Match[]>
            >(
              `/competitions/sessions/${sessionId}/matches`
            );

          setMatches(
            response.data.data || []
          );
        } catch (err) {
          console.error(
            "Load matches error:",
            err
          );

          setMatches([]);
        }
      },
      []
    );

  // ==========================================================
  // LOAD EVERYTHING
  // ==========================================================

  const loadData =
    useCallback(async () => {
      setLoading(true);

      try {
        await loadSession();
        await loadRegistrations();
        await loadCheckins();
      } finally {
        setLoading(false);
      }
    }, [
      loadSession,
      loadRegistrations,
      loadCheckins,
    ]);

  // ==========================================================
  // LOAD SESSION DEPENDENT DATA
  // ==========================================================

  useEffect(() => {
    if (!session?.id) {
      return;
    }

    loadQueue(session.id);
    loadMatches(session.id);
  }, [
    session?.id,
    loadQueue,
    loadMatches,
  ]);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================================
  // AUTO REFRESH
  // ==========================================================

  useEffect(() => {
    if (!session?.id) {
      return;
    }

    const interval =
      window.setInterval(() => {
        loadQueue(session.id);
        loadMatches(session.id);
        loadRegistrations();
        loadCheckins();
      }, 10000);

    return () =>
      window.clearInterval(
        interval
      );
  }, [
    session?.id,
    loadQueue,
    loadMatches,
    loadRegistrations,
    loadCheckins,
  ]);

  // ==========================================================
  // SESSION ACTION
  // ==========================================================

  async function updateSession(
    status: SessionStatus
  ) {
    if (!session) {
      return;
    }

    try {
      setActionLoading(true);

      const response =
        await api.patch<
          ApiResponse<Session>
        >(
          `/competitions/sessions/${session.id}`,
          { status }
        );

      setSession(
        response.data.data
      );
    } catch (err: any) {
      console.error(
        "Update session error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update session."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ==========================================================
  // PAYMENT REVIEW
  // ==========================================================

  function openPaymentReview(registration: Registration) {
    setError(null);
    setSelectedRegistration(registration);
    setPaymentReviewOpen(true);
  }

  function closePaymentReview() {
    if (actionLoading) {
      return;
    }

    setPaymentReviewOpen(false);
    setSelectedRegistration(null);
  }

  function getPaymentProofUrl(
    registration: Registration
  ): string | null {
    const rawProofUrl =
      registration.payment_proof_url ||
      registration.payment_proof ||
      registration.payment_proof_path ||
      registration.proof_image_url ||
      null;

    return getProofUrl(rawProofUrl);
  }

  function formatPaymentAmount(value?: number | string | null) {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return String(value);
    }

    return `₱${amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // ==========================================================
  // VERIFY PAYMENT
  // ==========================================================

  async function handleVerifyPayment(
    registration: Registration
  ) {
    const proofUrl = getPaymentProofUrl(registration);

    if (!proofUrl) {
      setError(
        "Payment proof is not available. The payment cannot be verified."
      );
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      await api.patch(
        `/competitions/registrations/${registration.id}/payment`,
        {
          paymentStatus: "confirmed",
        }
      );

      setSelectedRegistration((current) =>
        current
          ? {
              ...current,
              payment_status: "confirmed",
            }
          : null
      );

      await loadRegistrations();
    } catch (err: any) {
      console.error("Verify payment error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to verify payment."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ==========================================================
  // CONFIRM REGISTRATION
  // ==========================================================

  async function handleConfirmRegistration(
    registration: Registration
  ) {
    const proofUrl = getPaymentProofUrl(registration);

    if (!proofUrl) {
      setError(
        "The registration has no payment proof. Do not confirm this registration."
      );
      return;
    }

    if (registration.payment_status !== "confirmed") {
      setError(
        "Payment must be verified before confirming this registration."
      );
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      await api.patch(
        `/competitions/registrations/${registration.id}`,
        {
          status: "confirmed",
        }
      );

      await loadRegistrations();

      setPaymentReviewOpen(false);
      setSelectedRegistration(null);
    } catch (err: any) {
      console.error(
        "Confirm registration error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to confirm registration."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ==========================================================
  // CHECK IN PLAYER
  // ==========================================================

  // ==================================================
// CHECK IN + AUTOMATICALLY JOIN QUEUE
// ==================================================

async function handleCheckIn(
  registrationId: number
) {
  if (!session) return;

  // Check-in is only allowed while the Open Play session is live.
  // This guard prevents the check-in API from being called and saved
  // when the session is scheduled, paused, completed, or cancelled.
  if (session.status !== "live") {
    setError(
      "Check-in is only available while the Open Play session is live."
    );
    return;
  }

  try {
    setActionLoading(true);
    setError(null);

    // ------------------------------------------------------
    // 1. CHECK PLAYER IN
    // ------------------------------------------------------

    const checkin =
      await checkinService.create(
        registrationId
      );

    console.log(
      "Check-in created:",
      checkin
    );

    // ------------------------------------------------------
    // 2. AUTOMATICALLY JOIN WAITING QUEUE
    // ------------------------------------------------------

    const queueEntry =
      await queueService.join(
        session.id,
        checkin.id
      );

    console.log(
      "Queue entry created:",
      queueEntry
    );

    // ------------------------------------------------------
    // 3. EXPLICITLY REFRESH ALL SESSION DATA
    // ------------------------------------------------------

    await Promise.all([
      loadRegistrations(),
      loadCheckins(),
      loadQueue(session.id),
      loadMatches(session.id),
    ]);
  } catch (error: any) {
    console.error(
      "Check-in / queue error:",
      error
    );

    const message =
      error?.response?.data?.message ??
      error?.message ??
      "Failed to check in player and join queue.";

    setError(message);
    alert(message);
  } finally {
    setActionLoading(false);
  }
}
  // ==========================================================
  // CREATE MATCH
  // ==========================================================

async function createMatch() {
  if (!session) {
    return;
  }

  // ==================================================
  // SESSION MUST BE LIVE
  // ==================================================

  if (session.status !== "live") {
    setError(
      "The Open Play session must be live before creating a match."
    );
    return;
  }

  // ==================================================
  // VALIDATE TEAMS
  // ==================================================

  if (
    teamAPlayers.length !== playersPerTeam ||
    teamBPlayers.length !== playersPerTeam
  ) {
    setError(
      `Select exactly ${playersPerTeam} player${
        playersPerTeam === 1 ? "" : "s"
      } for Team A and ${playersPerTeam} player${
        playersPerTeam === 1 ? "" : "s"
      } for Team B.`
    );
    return;
  }

  // ==================================================
  // VALIDATE UNIQUE PLAYERS
  // ==================================================

  const selectedQueueIds = [
    ...teamAPlayers.map(
      (player) => player.id
    ),
    ...teamBPlayers.map(
      (player) => player.id
    ),
  ];

  if (
    new Set(selectedQueueIds).size !==
    totalPlayersPerMatch
  ) {
    setError(
      "A player cannot be assigned to both teams."
    );
    return;
  }

  // ==================================================
  // VALIDATE PLAYER IDs
  // ==================================================

  const invalidPlayer =
    [
      ...teamAPlayers,
      ...teamBPlayers,
    ].some(
      (player) =>
        !player.competition_player_id
    );

  if (invalidPlayer) {
    setError(
      "One or more selected players do not have a competition player ID."
    );
    return;
  }

  try {
    setActionLoading(true);
    setError(null);

    // ==================================================
    // SEND TEAM SELECTION
    // ==================================================

    await api.post(
      `/competitions/sessions/${session.id}/matches`,
      {
        teamAQueueIds:
          teamAPlayers.map(
            (player) => player.id
          ),

        teamBQueueIds:
          teamBPlayers.map(
            (player) => player.id
          ),
      }
    );

    clearTeamSelection();

    await Promise.all([
      loadQueue(session.id),
      loadMatches(session.id),
    ]);
  } catch (err: any) {
    console.error(
      "Create match error:",
      err
    );

    setError(
      err?.response?.data?.message ||
        "Unable to create match."
    );
  } finally {
    setActionLoading(false);
  }
}
  // ==========================================================
  // START MATCH
  // ==========================================================

  async function startMatch(
    matchId: number
  ) {
    try {
      setActionLoading(true);

      await api.patch(
        `/competitions/matches/${matchId}/start`
      );

      if (session) {
        await loadMatches(
          session.id
        );
        await loadQueue(
          session.id
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to start match."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ==========================================================
  // STATS
  // ==========================================================

  const stats = useMemo(() => {
    const checkedIn =
      checkins.filter(
        (item) =>
          item.status ===
          "checked_in"
      ).length;

    const waiting =
      queue.filter(
        (item) =>
          item.status ===
          "waiting"
      ).length;

    const playing =
      matches.filter(
        (item) =>
          item.status ===
          "playing"
      ).length;

    const completed =
      matches.filter(
        (item) =>
          item.status ===
          "completed"
      ).length;

    return {
      checkedIn,
      waiting,
      playing,
      completed,
    };
  }, [
    checkins,
    queue,
    matches,
  ]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="space-y-6">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white"
                />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />

              <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && !session) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Card className="border-red-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center px-6 py-12 text-center">
              <div className="mb-4 rounded-full bg-red-50 p-4">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>

              <h2 className="text-lg font-semibold text-slate-900">
                Unable to load Open Play
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                {error}
              </p>

              <Button
                onClick={loadData}
                className="mt-6"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // ==========================================================
  // NO SESSION
  // ==========================================================

  if (!session) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center px-6 py-12 text-center">
              <div className="mb-4 rounded-full bg-slate-100 p-4">
                <Gamepad2 className="h-8 w-8 text-slate-500" />
              </div>

              <h2 className="text-lg font-semibold text-slate-900">
                No Open Play Session
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                There is currently no Open Play
                session for this division.
              </p>

              <Button
                className="mt-6"
                onClick={async () => {
                  try {
                    setActionLoading(true);

                    const response =
                      await api.post<
                        ApiResponse<Session>
                      >(
                        `/competitions/divisions/${divisionId}/session`
                      );

                    setSession(
                      response.data.data
                    );
                  } catch (err: any) {
                    setError(
                      err?.response?.data?.message ||
                        "Unable to create session."
                    );
                  } finally {
                    setActionLoading(false);
                  }
                }}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}

                Create Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1500px] px-5 py-6 lg:px-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span>Competitions</span>

              <ChevronRight className="h-4 w-4" />

              <span>
                Division {divisionId}
              </span>

              <ChevronRight className="h-4 w-4" />

              <span className="text-slate-700">
                Open Play
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                Open Play
              </h1>

              <SessionStatusBadge
                status={
                  session.status
                }
              />
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {session.division_name ||
                "Open Play Division"}

              {session.skill_level && (
                <>
                  {" · "}
                  {session.skill_level}
                </>
              )}

              {session.format && (
                <>
                  {" · "}
                  {session.format}
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                loadData();

                if (session) {
                  loadQueue(
                    session.id
                  );

                  loadMatches(
                    session.id
                  );
                }
              }}
              disabled={actionLoading}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>

            {session.status ===
              "scheduled" && (
              <Button
                onClick={() =>
                  updateSession(
                    "live"
                  )
                }
                disabled={actionLoading}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            )}

            {session.status ===
              "live" && (
              <Button
                variant="outline"
                onClick={() =>
                  updateSession(
                    "paused"
                  )
                }
                disabled={actionLoading}
                className="border-amber-200 bg-white text-amber-700 hover:bg-amber-50"
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            )}

            {session.status ===
              "paused" && (
              <Button
                onClick={() =>
                  updateSession(
                    "live"
                  )
                }
                disabled={actionLoading}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            )}
          </div>
        </div>

        {/* ==================================================
            ERROR ALERT
        ================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <div className="flex-1">
              {error}
            </div>

            <button
              type="button"
              onClick={() =>
                setError(null)
              }
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* ==================================================
            STATS
        ================================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={UserCheck}
            label="Checked In"
            value={stats.checkedIn}
            description="Players ready"
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            icon={Clock3}
            label="Waiting"
            value={stats.waiting}
            description="Players in queue"
            iconClass="bg-amber-50 text-amber-600"
          />

          <StatCard
            icon={Activity}
            label="Playing"
            value={stats.playing}
            description="Live matches"
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            icon={Trophy}
            label="Completed"
            value={stats.completed}
            description="Finished matches"
            iconClass="bg-violet-50 text-violet-600"
          />

        </div>

        {/* ==================================================
            MAIN GRID
        ================================================== */}

        <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">

          {/* =================================================
              CHECK-IN
          ================================================= */}

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                    <Users className="h-5 w-5 text-blue-600" />
                    Player Check-in
                  </CardTitle>

                  <p className="mt-1 text-sm text-slate-500">
                    Registered players for this division.
                  </p>
                </div>

                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-700"
                >
                  {registrations.length}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {registrations.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No registered players"
                  description="Players registered for this division will appear here."
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {registrations.map(
                    (registration) => {
                      const checkin =
                        checkins.find(
                          (item) =>
                            item.competition_registration_id ===
                            registration.id
                        );

                      const playerName =
                        [
                          registration.first_name,
                          registration.last_name,
                        ]
                          .filter(Boolean)
                          .join(" ") ||
                        "Unknown Player";

                      const isCheckedIn =
                        checkin?.status ===
                        "checked_in";

                      const isNoShow =
                        checkin?.status ===
                        "no_show";

                      return (
                        <div
                          key={registration.id}
                          className="flex items-center justify-between gap-4 px-5 py-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                              {playerName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {playerName}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {registration.email ||
                                  registration.phone ||
                                  registration.customer_no ||
                                  "No contact information"}
                              </p>

                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                {registration.player_skill_level && (
                                  <span className="text-xs text-slate-500">
                                    {
                                      registration.player_skill_level
                                    }
                                  </span>
                                )}

                                {registration.player_skill_level && (
                                  <span className="text-slate-300">
                                    •
                                  </span>
                                )}

                                <span
                                  className={
                                    registration.status ===
                                    "cancelled"
                                      ? "text-xs font-medium text-red-600"
                                      : registration.status ===
                                        "confirmed"
                                      ? "text-xs font-medium text-emerald-600"
                                      : "text-xs font-medium text-amber-600"
                                  }
                                >
                                  {registration.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isCheckedIn ? (
                              <Badge
                                variant="outline"
                                className="border-emerald-200 bg-emerald-50 text-emerald-700"
                              >
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                Checked In
                              </Badge>
                            ) : isNoShow ? (
                              <Badge
                                variant="outline"
                                className="border-red-200 bg-red-50 text-red-700"
                              >
                                No Show
                              </Badge>
                            ) : registration.status ===
                              "cancelled" ? (
                              <Badge
                                variant="outline"
                                className="border-red-200 bg-red-50 text-red-700"
                              >
                                Cancelled
                              </Badge>
                            ) : registration.status ===
                              "waitlisted" ? (
                              <Badge
                                variant="outline"
                                className="border-amber-200 bg-amber-50 text-amber-700"
                              >
                                Waitlisted
                              </Badge>
                            ) : registration.status ===
                              "pending" ? (
                              <Button
                                size="sm"
                                onClick={() =>
                                  openPaymentReview(
                                    registration
                                  )
                                }
                                disabled={actionLoading}
                                className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Review Payment
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleCheckIn(
                                    registration.id
                                  )
                                }
                                disabled={
                                  actionLoading ||
                                  session.status !== "live"
                                }
                                className={
                                  session.status === "live"
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-slate-200 text-slate-500 hover:bg-slate-200"
                                }
                              >
                                {actionLoading ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <UserCheck className="mr-2 h-4 w-4" />
                                )}
                                {session.status === "live"
                                  ? "Check In"
                                  : "Session Not Live"}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* =================================================
              MATCHES
          ================================================= */}

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                    <Gamepad2 className="h-5 w-5 text-emerald-600" />
                    Matches
                  </CardTitle>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage courts, live games, and results.
                  </p>
                </div>

                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-700"
                >
                  {matches.length}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">

              {matches.length === 0 ? (
                <EmptyState
                  icon={Gamepad2}
                  title="No matches yet"
                  description={`Create a ${matchFormatLabel.toLowerCase()} match when ${totalPlayersPerMatch} players are waiting in the queue.`}
                />
              ) : (
                <div className="divide-y divide-slate-100">

                  {matches.map(
                    (match) => (
                      <div
                        key={match.id}
                        className="px-5 py-4"
                      >

                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                              Match #
                              {match.match_number}
                            </span>

                            <MatchStatusBadge
                              status={
                                match.status
                              }
                            />
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="h-3.5 w-3.5" />

                            {match.court_name ||
                              (match.court_id
                                ? `Court ${match.court_id}`
                                : "No court")}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">

                          <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                              Team A
                            </p>

                            <div className="space-y-1">
                              {(match.players ||
                                [])
                                .filter(
                                  (
                                    player
                                  ) =>
                                    player.team ===
                                    "A"
                                )
                                .map(
                                  (
                                    player,
                                    index
                                  ) => (
                                    <p
                                      key={
                                        player.id ??
                                        `${player.competition_player_id}-${index}`
                                      }
                                      className="text-sm font-medium text-slate-800"
                                    >
                                      {getPlayerName(
                                        player
                                      )}
                                    </p>
                                  )
                                )}
                            </div>

                            {match.team_a_score !=
                              null && (
                              <p className="mt-2 text-2xl font-bold text-blue-700">
                                {
                                  match.team_a_score
                                }
                              </p>
                            )}
                          </div>

                          <div className="rounded-lg border border-violet-100 bg-violet-50/60 p-3">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-violet-600">
                              Team B
                            </p>

                            <div className="space-y-1">
                              {(match.players ||
                                [])
                                .filter(
                                  (
                                    player
                                  ) =>
                                    player.team ===
                                    "B"
                                )
                                .map(
                                  (
                                    player,
                                    index
                                  ) => (
                                    <p
                                      key={
                                        player.id ??
                                        `${player.competition_player_id}-${index}`
                                      }
                                      className="text-sm font-medium text-slate-800"
                                    >
                                      {getPlayerName(
                                        player
                                      )}
                                    </p>
                                  )
                                )}
                            </div>

                            {match.team_b_score !=
                              null && (
                              <p className="mt-2 text-2xl font-bold text-violet-700">
                                {
                                  match.team_b_score
                                }
                              </p>
                            )}
                          </div>

                        </div>

                        {match.status ===
                          "called" && (
                          <Button
                            size="sm"
                            className="mt-3 w-full bg-emerald-600 text-white hover:bg-emerald-700"
                            onClick={() =>
                              startMatch(
                                match.id
                              )
                            }
                            disabled={
                              actionLoading
                            }
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Start Match
                          </Button>
                        )}

                      </div>
                    )
                  )}

                </div>
              )}

            </CardContent>
          </Card>

        </div>

        {/* ==================================================
            WAITING QUEUE
        ================================================== */}

        <Card className="mt-6 border-slate-200 bg-white shadow-sm">

          <CardHeader className="border-b border-slate-100">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>
                <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                  <Clock3 className="h-5 w-5 text-amber-600" />
                  Waiting Queue
                </CardTitle>

                <p className="mt-1 text-sm text-slate-500">
                  Drag players into Team A or Team B to choose the {matchFormatLabel.toLowerCase()} pairing.
                </p>
              </div>

              <div className="flex items-center gap-2">

                {(teamAIds.length > 0 ||
                  teamBIds.length > 0) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearTeamSelection}
                    disabled={actionLoading}
                    className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    Clear
                  </Button>
                )}

                <Button
                  onClick={createMatch}
                  disabled={
                    actionLoading ||
                    session.status !== "live" ||
                    teamAPlayers.length !== playersPerTeam ||
                    teamBPlayers.length !== playersPerTeam
                  }
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {actionLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}

                  Create {matchFormatLabel} Match
                </Button>

              </div>

            </div>
          </CardHeader>

          <CardContent className="p-5">

            {waitingPlayers.length === 0 ? (
              <EmptyState
                icon={Clock3}
                title="Queue is empty"
                description="Checked-in players will appear here when they join Open Play."
              />
            ) : (
              <div className="space-y-5">

                {/* AVAILABLE PLAYERS */}

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Waiting Players
                      </h3>

                      <p className="text-xs text-slate-500">
                        Drag a player into Team A or Team B.
                      </p>
                    </div>

                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-700"
                    >
                      {waitingPlayers.length} waiting
                    </Badge>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                    {waitingPlayers.map(
                      (player, index) => {
                        const assignedTeam =
                          teamAIds.includes(player.id)
                            ? "A"
                            : teamBIds.includes(player.id)
                              ? "B"
                              : null;

                        return (
                          <div
                            key={player.id}
                            draggable
                            onDragStart={() =>
                              setDraggedPlayerId(
                                player.id
                              )
                            }
                            onDragEnd={() =>
                              setDraggedPlayerId(null)
                            }
                            className={`group flex cursor-grab items-center gap-3 rounded-xl border p-3 transition active:cursor-grabbing ${
                              assignedTeam === "A"
                                ? "border-blue-200 bg-blue-50"
                                : assignedTeam === "B"
                                  ? "border-violet-200 bg-violet-50"
                                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                            }`}
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {getPlayerName(
                                  player
                                )}
                              </p>

                              <p className="text-xs text-slate-500">
                                {assignedTeam
                                  ? `Team ${assignedTeam}`
                                  : "Drag to a team"}
                              </p>
                            </div>

                            <GripVertical className="h-4 w-4 shrink-0 text-slate-400" />
                          </div>
                        );
                      }
                    )}

                  </div>
                </div>

                {/* TEAM DROP ZONES */}

                <div className="grid gap-4 md:grid-cols-2">

                  {/* TEAM A */}

                  <div
                    onDragOver={(event) =>
                      event.preventDefault()
                    }
                    onDrop={(event) => {
                      event.preventDefault();

                      if (
                        draggedPlayerId !== null
                      ) {
                        assignPlayer(
                          draggedPlayerId,
                          "A"
                        );
                      }
                    }}
                    className={`min-h-[190px] rounded-xl border-2 border-dashed p-4 transition ${
                      draggedPlayerId !== null &&
                      teamAPlayers.length < playersPerTeam
                        ? "border-blue-300 bg-blue-50/50"
                        : "border-blue-100 bg-blue-50/20"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-blue-700">
                          Team A
                        </p>

                        <p className="text-xs text-slate-500">
                          {teamAPlayers.length}/{playersPerTeam} player{playersPerTeam === 1 ? "" : "s"}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-white text-blue-700"
                      >
                        {teamAPlayers.length}/{playersPerTeam}
                      </Badge>
                    </div>

                    <div className="space-y-2">

                      {teamAPlayers.map(
                        (player, index) => (
                          <div
                            key={player.id}
                            draggable
                            onDragStart={() =>
                              setDraggedPlayerId(
                                player.id
                              )
                            }
                            onDragEnd={() =>
                              setDraggedPlayerId(null)
                            }
                            className="flex cursor-grab items-center gap-3 rounded-lg border border-blue-100 bg-white p-3 shadow-sm active:cursor-grabbing"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {getPlayerName(
                                  player
                                )}
                              </p>

                              <p className="text-xs text-blue-600">
                                Team A
                              </p>
                            </div>

                            <GripVertical className="h-4 w-4 text-slate-400" />
                          </div>
                        )
                      )}

                      {teamAPlayers.length === 0 && (
                        <div className="flex min-h-[90px] items-center justify-center rounded-lg border border-blue-100 bg-white/70 text-center text-xs text-slate-400">
                          Drop a player here
                        </div>
                      )}

                      {!isSingles &&
                        teamAPlayers.length === 1 && (
                          <div className="rounded-lg border border-dashed border-blue-100 px-3 py-2 text-center text-xs text-slate-400">
                            Drop one more player
                          </div>
                        )}

                    </div>
                  </div>

                  {/* TEAM B */}

                  <div
                    onDragOver={(event) =>
                      event.preventDefault()
                    }
                    onDrop={(event) => {
                      event.preventDefault();

                      if (
                        draggedPlayerId !== null
                      ) {
                        assignPlayer(
                          draggedPlayerId,
                          "B"
                        );
                      }
                    }}
                    className={`min-h-[190px] rounded-xl border-2 border-dashed p-4 transition ${
                      draggedPlayerId !== null &&
                      teamBPlayers.length < playersPerTeam
                        ? "border-violet-300 bg-violet-50/50"
                        : "border-violet-100 bg-violet-50/20"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-violet-700">
                          Team B
                        </p>

                        <p className="text-xs text-slate-500">
                          {teamBPlayers.length}/{playersPerTeam} player{playersPerTeam === 1 ? "" : "s"}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className="border-violet-200 bg-white text-violet-700"
                      >
                        {teamBPlayers.length}/{playersPerTeam}
                      </Badge>
                    </div>

                    <div className="space-y-2">

                      {teamBPlayers.map(
                        (player, index) => (
                          <div
                            key={player.id}
                            draggable
                            onDragStart={() =>
                              setDraggedPlayerId(
                                player.id
                              )
                            }
                            onDragEnd={() =>
                              setDraggedPlayerId(null)
                            }
                            className="flex cursor-grab items-center gap-3 rounded-lg border border-violet-100 bg-white p-3 shadow-sm active:cursor-grabbing"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-bold text-violet-700">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {getPlayerName(
                                  player
                                )}
                              </p>

                              <p className="text-xs text-violet-600">
                                Team B
                              </p>
                            </div>

                            <GripVertical className="h-4 w-4 text-slate-400" />
                          </div>
                        )
                      )}

                      {teamBPlayers.length === 0 && (
                        <div className="flex min-h-[90px] items-center justify-center rounded-lg border border-violet-100 bg-white/70 text-center text-xs text-slate-400">
                          Drop a player here
                        </div>
                      )}

                      {!isSingles &&
                        teamBPlayers.length === 1 && (
                          <div className="rounded-lg border border-dashed border-violet-100 px-3 py-2 text-center text-xs text-slate-400">
                            Drop one more player
                          </div>
                        )}

                    </div>
                  </div>

                </div>

                {/* MATCH VALIDATION */}

                <div
                  className={`rounded-lg border px-4 py-3 text-sm ${
                    teamAPlayers.length === playersPerTeam &&
                    teamBPlayers.length === playersPerTeam
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-100 bg-amber-50 text-amber-700"
                  }`}
                >
                  {teamAPlayers.length === playersPerTeam &&
                  teamBPlayers.length === playersPerTeam ? (
                    <span className="font-medium">
                      Teams ready. You can create the {matchFormatLabel.toLowerCase()} match.
                    </span>
                  ) : (
                    <>
                      Select{" "}
                      <span className="font-semibold">
                        {playersPerTeam} player
                        {playersPerTeam === 1 ? "" : "s"} for Team A
                      </span>{" "}
                      and{" "}
                      <span className="font-semibold">
                        {playersPerTeam} player
                        {playersPerTeam === 1 ? "" : "s"} for Team B
                      </span>
                      .
                    </>
                  )}
                </div>

              </div>
            )}

          </CardContent>
        </Card>

        {/* ==================================================
            SESSION FOOTER
        ================================================== */}

        <div className="mt-6 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <div>
            Session #{session.id}
          </div>

          <div className="flex items-center gap-4">
            {session.started_at && (
              <span>
                Started{" "}
                {formatTime(
                  session.started_at
                )}
              </span>
            )}

            <span>
              Auto-refresh: 10s
            </span>
          </div>

        </div>


        {/* ==================================================
            PAYMENT REVIEW MODAL
        ================================================== */}

        {paymentReviewOpen && selectedRegistration && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-review-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closePaymentReview();
              }
            }}
          >
            <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 id="payment-review-title" className="text-lg font-semibold text-slate-950">
                      Review Payment
                    </h2>
                    <p className="text-sm text-slate-500">
                      Verify the GCash payment before confirming this registration.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closePaymentReview}
                  disabled={actionLoading}
                  aria-label="Close payment review"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-6">
                <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Player
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                          {(
                            selectedRegistration.first_name?.charAt(0) ||
                            selectedRegistration.last_name?.charAt(0) ||
                            "P"
                          ).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {[
                              selectedRegistration.first_name,
                              selectedRegistration.last_name,
                            ]
                              .filter(Boolean)
                              .join(" ") || "Unknown Player"}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {selectedRegistration.email ||
                              selectedRegistration.phone ||
                              selectedRegistration.customer_no ||
                              "No contact information"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Registration
                      </p>

                      <div className="mt-3 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-slate-500">Status</span>
                          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                            Pending
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-slate-500">Payment</span>
                          <span className="text-sm font-medium text-slate-900">
                            {selectedRegistration.payment_method || "GCash"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-slate-500">Amount</span>
                          <span className="text-base font-bold text-slate-950">
                            {formatPaymentAmount(
                              selectedRegistration.payment_amount ?? session.entry_fee
                            )}
                          </span>
                        </div>

                        {(selectedRegistration.payment_reference ||
                          selectedRegistration.payment_transaction_id) && (
                          <div className="border-t border-slate-100 pt-3">
                            <p className="text-xs text-slate-500">Reference Number</p>
                            <p className="mt-1 break-all text-sm font-medium text-slate-900">
                              {selectedRegistration.payment_reference ||
                                selectedRegistration.payment_transaction_id}
                            </p>
                          </div>
                        )}

                        {selectedRegistration.payment_paid_at && (
                          <div>
                            <p className="text-xs text-slate-500">Paid At</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                              {new Date(selectedRegistration.payment_paid_at).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <div>
                          <p className="text-sm font-semibold text-amber-900">
                            Verify before confirming
                          </p>
                          <p className="mt-1 text-xs leading-5 text-amber-800">
                            Check the screenshot, payment amount, and reference number before approving the registration.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          GCash Payment Proof
                        </p>
                        <p className="text-xs text-slate-500">
                          Review the uploaded screenshot.
                        </p>
                      </div>

                      {selectedRegistration.payment_status && (
                        <Badge
                          variant="outline"
                          className={
                            selectedRegistration.payment_status === "confirmed"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : selectedRegistration.payment_status === "rejected"
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                          }
                        >
                          {selectedRegistration.payment_status === "confirmed"
                            ? "Verified"
                            : selectedRegistration.payment_status === "rejected"
                              ? "Rejected"
                              : "Pending"}
                        </Badge>
                      )}
                    </div>

                    {getPaymentProofUrl(selectedRegistration) ? (
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        <div className="flex min-h-[420px] items-center justify-center p-4">
                          <img
                            key={getPaymentProofUrl(selectedRegistration) || "payment-proof"}
                            src={
                              getPaymentProofUrl(
                                selectedRegistration
                              ) || undefined
                            }
                            alt="GCash payment proof"
                            className="block max-h-[560px] max-w-full rounded-xl object-contain"
                            onLoad={() => {
                              console.log(
                                "GCash payment proof loaded:",
                                getPaymentProofUrl(
                                  selectedRegistration
                                )
                              );
                            }}
                            onError={(event) => {
                              console.error(
                                "Failed to load GCash payment proof:",
                                getPaymentProofUrl(
                                  selectedRegistration
                                )
                              );

                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        </div>

                        {getPaymentProofUrl(selectedRegistration) && (
                          <div className="border-t border-slate-200 bg-white px-4 py-3">
                            <a
                              href={
                                getPaymentProofUrl(
                                  selectedRegistration
                                ) || undefined
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium !text-white transition hover:bg-slate-800"
                            >
                              Open full image
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50 p-6 text-center">
                        <div>
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-500 shadow-sm">
                            <XCircle className="h-6 w-6" />
                          </div>
                          <p className="mt-3 text-sm font-semibold text-red-700">
                            Payment proof is not available
                          </p>
                          <p className="mt-1 max-w-sm text-xs leading-5 text-red-600">
                            The registration API did not return a payment proof image. Do not confirm this registration until the payment can be verified.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500">
                  {selectedRegistration.payment_status === "confirmed" ? (
                    <span className="font-medium text-emerald-600">
                      Payment verified. You can now confirm this registration.
                    </span>
                  ) : (
                    <span>
                      Verify the payment before confirming this registration.
                    </span>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closePaymentReview}
                    disabled={actionLoading}
                    className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>

                  {selectedRegistration.payment_status !== "confirmed" ? (
                    <Button
                      type="button"
                      onClick={() =>
                        handleVerifyPayment(selectedRegistration)
                      }
                      disabled={
                        actionLoading ||
                        !getPaymentProofUrl(selectedRegistration)
                      }
                      className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500"
                    >
                      {actionLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Verify Payment
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() =>
                        handleConfirmRegistration(selectedRegistration)
                      }
                      disabled={actionLoading}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-500"
                    >
                      {actionLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Confirm Registration
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  description: string;
  iconClass: string;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-0.5 text-2xl font-bold text-slate-950">
            {value}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            {description}
          </p>
        </div>

      </CardContent>
    </Card>
  );
}


// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[230px] flex-col items-center justify-center px-6 py-10 text-center">

      <div className="mb-4 rounded-full bg-slate-100 p-4">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>

      <h3 className="text-sm font-semibold text-slate-800">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}