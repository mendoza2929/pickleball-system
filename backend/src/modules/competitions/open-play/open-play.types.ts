// ============================================================
// OPEN PLAY TYPES
// ============================================================

import { MatchStatus } from "../matches/match.types";

// ============================================================
// CREATE NEXT OPEN PLAY MATCH
// ============================================================

export interface CreateNextOpenPlayMatchInput {
  competitionSessionId: number;
}

// ============================================================
// OPEN PLAY MATCH RESULT
// ============================================================

export interface OpenPlayMatchResult {
  created: boolean;

  court_assigned: boolean;

  message?: string;

  reason?: string;

  waiting_count?: number;

  match: OpenPlayMatch | null;
}

// ============================================================
// OPEN PLAY MATCH
// ============================================================

export interface OpenPlayMatch {
  id: number;

  competition_session_id: number;

  court_id: number | null;

  court_assigned_at?: string | null;

  match_number: number;

  status: MatchStatus;

  team_a_score?: number | null;

  team_b_score?: number | null;

  started_at?: string | null;

  completed_at?: string | null;

  created_at?: string;

  updated_at?: string;

  competition_division_id?: number;

  competition_id?: number;

  division_name?: string;

  skill_level?:
    | "beginner"
    | "novice"
    | "intermediate";

  format?:
    | "singles"
    | "doubles";

  session_status?: string;

  players?: OpenPlayMatchPlayer[];
}

// ============================================================
// MATCH PLAYER
// ============================================================

export interface OpenPlayMatchPlayer {
  id?: number;

  competition_player_id: number;

  team: "A" | "B";

  position: number;

  customer_id?: number;

  customer_no?: string;

  first_name: string;

  last_name: string;

  email?: string | null;

  phone?: string | null;

  skill_level?: 
    | "beginner"
    | "novice"
    | "intermediate";
}