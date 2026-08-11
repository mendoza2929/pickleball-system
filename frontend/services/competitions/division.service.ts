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
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface CreateDivisionInput {
  name: string;
  skillLevel: DivisionSkillLevel;
  format: DivisionFormat;
  maxPlayers?: number | null;
  entryFee?: number;
  status?: DivisionStatus;
}

export interface UpdateDivisionInput {
  name?: string;
  skillLevel?: DivisionSkillLevel;
  format?: DivisionFormat;
  maxPlayers?: number | null;
  entryFee?: number;
  status?: DivisionStatus;
}

export const divisionService = {
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

  async create(
    competitionId: number,
    data: CreateDivisionInput
  ): Promise<CompetitionDivision> {
    const response =
      await api.post<
        ApiResponse<CompetitionDivision>
      >(
        `/competitions/${competitionId}/divisions`,
        data
      );

    return response.data.data;
  },

  async update(
    divisionId: number,
    data: UpdateDivisionInput
  ): Promise<CompetitionDivision> {
    const response =
      await api.patch<
        ApiResponse<CompetitionDivision>
      >(
        `/competitions/divisions/${divisionId}`,
        data
      );

    return response.data.data;
  },
};