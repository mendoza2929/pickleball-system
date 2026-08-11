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