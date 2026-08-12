// ==================================================
// MATCH TYPES
// ==================================================

export type MatchStatus =
  | "pending"
  | "called"
  | "playing"
  | "completed"
  | "cancelled";

export type MatchTeam =
  | "A"
  | "B";

// ==================================================
// CREATE MATCH
// ==================================================

export interface CreateMatchInput {
  competitionSessionId: number;
}

// ==================================================
// UPDATE MATCH STATUS
// ==================================================

export interface UpdateMatchStatusInput {
  status: MatchStatus;
}

// ==================================================
// COMPLETE MATCH
// ==================================================

export interface CompleteMatchInput {
  teamAScore: number;
  teamBScore: number;
}

// ==================================================
// MATCH PLAYER
// ==================================================

export interface MatchPlayerInput {
  competitionPlayerId: number;
  team: MatchTeam;
  position: number;
}

// ==================================================
// MATCH
// ==================================================

export interface Match {
  id: number;

  competition_session_id: number;

  court_id: number | null;

  court_assigned_at: Date | null;

  match_number: number;

  status: MatchStatus;

  team_a_score: number | null;

  team_b_score: number | null;

  started_at: Date | null;

  completed_at: Date | null;

  created_at: Date;

  updated_at: Date;

  players?: MatchPlayerInput[];
}