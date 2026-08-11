import api from "@/lib/api";

export type MatchStatus =
  | "pending"
  | "called"
  | "playing"
  | "completed"
  | "cancelled";

export type MatchTeam = "A" | "B";

export interface MatchPlayer {
  id?: number;
  competition_player_id: number;
  team: MatchTeam;
  position: number;

  customer_id?: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  skill_level?: string;
}

export interface OpenPlayMatch {
  id: number;
  competition_session_id: number;
  court_id: number | null;
  court_assigned_at?: string | null;
  match_number: number;

  status: MatchStatus;

  team_a_score?: number | null;
  team_b_score?: number | null;

  started_at: string | null;
  completed_at: string | null;

  created_at: string;
  updated_at?: string;

  players: MatchPlayer[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const matchService = {
  // -----------------------------------------------
  // CREATE MATCH FROM QUEUE
  // -----------------------------------------------

  async create(
    sessionId: number
  ): Promise<OpenPlayMatch> {
    const response =
      await api.post<
        ApiResponse<OpenPlayMatch>
      >(
        `/competitions/sessions/${sessionId}/matches`
      );

    return response.data.data;
  },

  // -----------------------------------------------
  // GET SESSION MATCHES
  // -----------------------------------------------

  async getBySession(
    sessionId: number
  ): Promise<OpenPlayMatch[]> {
    const response =
      await api.get<
        ApiResponse<OpenPlayMatch[]>
      >(
        `/competitions/sessions/${sessionId}/matches`
      );

    return response.data.data;
  },

  // -----------------------------------------------
  // GET ONE MATCH
  // -----------------------------------------------

  async getById(
    matchId: number
  ): Promise<OpenPlayMatch> {
    const response =
      await api.get<
        ApiResponse<OpenPlayMatch>
      >(
        `/competitions/matches/${matchId}`
      );

    return response.data.data;
  },

  // -----------------------------------------------
  // GENERAL STATUS
  // -----------------------------------------------

  async updateStatus(
    matchId: number,
    status: MatchStatus
  ): Promise<OpenPlayMatch> {
    const response =
      await api.patch<
        ApiResponse<OpenPlayMatch>
      >(
        `/competitions/matches/${matchId}`,
        { status }
      );

    return response.data.data;
  },

  // -----------------------------------------------
  // START MATCH
  // -----------------------------------------------

  async start(
    matchId: number
  ): Promise<OpenPlayMatch> {
    const response =
      await api.patch<
        ApiResponse<OpenPlayMatch>
      >(
        `/competitions/matches/${matchId}/start`
      );

    return response.data.data;
  },

  // -----------------------------------------------
  // COMPLETE MATCH
  // -----------------------------------------------

  async complete(
    matchId: number,
    teamAScore: number,
    teamBScore: number
  ): Promise<OpenPlayMatch> {
    const response =
      await api.patch<
        ApiResponse<OpenPlayMatch>
      >(
        `/competitions/matches/${matchId}/complete`,
        {
          teamAScore,
          teamBScore,
        }
      );

    return response.data.data;
  },
};