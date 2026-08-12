import api from "@/lib/api";

// =====================================================
// TYPES
// =====================================================

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

  created_at?: string;
  updated_at?: string;
}

export interface CreateDivisionPayload {
  name: string;
  skillLevel: DivisionSkillLevel;
  format: DivisionFormat;
  maxPlayers: number | null;
  entryFee: number;
  status: DivisionStatus;
}

export interface UpdateDivisionPayload {
  name?: string;
  skillLevel?: DivisionSkillLevel;
  format?: DivisionFormat;
  maxPlayers?: number | null;
  entryFee?: number;
  status?: DivisionStatus;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// =====================================================
// DIVISION SERVICE
// =====================================================

export const divisionService = {
  // ===================================================
  // GET DIVISIONS BY COMPETITION
  // GET /api/competitions/:competitionId/divisions
  // ===================================================

  async getByCompetition(
    competitionId: number
  ): Promise<CompetitionDivision[]> {
    if (
      !Number.isInteger(competitionId) ||
      competitionId <= 0
    ) {
      throw new Error(
        "Invalid competition ID."
      );
    }

    const response =
      await api.get<
        ApiResponse<CompetitionDivision[]>
      >(
        `/competitions/${competitionId}/divisions`
      );

    return response.data.data;
  },

  // ===================================================
  // GET ONE DIVISION
  // GET /api/competitions/divisions/:id
  // ===================================================

  async getById(
    divisionId: number
  ): Promise<CompetitionDivision> {
    if (
      !Number.isInteger(divisionId) ||
      divisionId <= 0
    ) {
      throw new Error(
        "Invalid division ID."
      );
    }

    const response =
      await api.get<
        ApiResponse<CompetitionDivision>
      >(
        `/competitions/divisions/${divisionId}`
      );

    return response.data.data;
  },

  // ===================================================
  // CREATE DIVISION
  // POST /api/competitions/:competitionId/divisions
  // ===================================================

  async create(
    competitionId: number,
    payload: CreateDivisionPayload
  ): Promise<CompetitionDivision> {
    if (
      !Number.isInteger(competitionId) ||
      competitionId <= 0
    ) {
      throw new Error(
        "Invalid competition ID."
      );
    }

    const response =
      await api.post<
        ApiResponse<CompetitionDivision>
      >(
        `/competitions/${competitionId}/divisions`,
        payload
      );

    return response.data.data;
  },

  // ===================================================
  // UPDATE DIVISION
  // PATCH /api/competitions/divisions/:id
  // ===================================================

  async update(
    divisionId: number,
    payload: UpdateDivisionPayload
  ): Promise<CompetitionDivision> {
    if (
      !Number.isInteger(divisionId) ||
      divisionId <= 0
    ) {
      throw new Error(
        "Invalid division ID."
      );
    }

    const response =
      await api.patch<
        ApiResponse<CompetitionDivision>
      >(
        `/competitions/divisions/${divisionId}`,
        payload
      );

    return response.data.data;
  },
};