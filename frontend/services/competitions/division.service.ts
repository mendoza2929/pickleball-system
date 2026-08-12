import api from "@/lib/api";

export type DivisionSkillLevel =
  | "beginner"
  | "novice"
  | "intermediate";

export type DivisionFormat =
  | "singles"
  | "doubles";

export type DivisionStatus =
  | "open"
  | "closed"
  | "in_progress"
  | "completed";

export interface CompetitionDivision {
  id: number;
  competition_id: number;

  name: string;

  skill_level: DivisionSkillLevel;

  format: DivisionFormat;

  max_players: number | null;

  entry_fee: number;

  status: DivisionStatus;

  created_at: string;
  updated_at: string;

  // ---------------------------------------------
  // SLOT INFORMATION
  // ---------------------------------------------

  confirmed_players: number;

  remaining_slots: number | null;

  is_full: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const divisionService = {
  // ---------------------------------------------
  // GET DIVISIONS BY COMPETITION
  // ---------------------------------------------

  async getByCompetition(
    competitionId: number
  ): Promise<CompetitionDivision[]> {
    const response =
      await api.get<
        ApiResponse<CompetitionDivision[]>
      >(
        `/competitions/${competitionId}/divisions`
      );

    return response.data.data;
  },

  // ---------------------------------------------
  // GET ONE DIVISION
  // ---------------------------------------------

  async getById(
    divisionId: number
  ): Promise<CompetitionDivision> {
    const response =
      await api.get<
        ApiResponse<CompetitionDivision>
      >(
        `/competitions/divisions/${divisionId}`
      );

    return response.data.data;
  },
};