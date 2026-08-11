import api from "@/lib/api";

// ==================================================
// TYPES
// ==================================================

export type CompetitionType =
  | "open_play"
  | "tournament";

export type CompetitionStatus =
  | "draft"
  | "published"
  | "registration_open"
  | "registration_closed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Competition {
  id: number;

  name: string;

  type: CompetitionType;

  status: CompetitionStatus;

  start_at: string;

  end_at: string | null;

  registration_start_at:
    | string
    | null;

  registration_end_at:
    | string
    | null;

  description: string | null;

  created_at: string;

  updated_at: string;
}

export interface CreateCompetitionInput {
  name: string;

  type: CompetitionType;

  startAt: string;

  endAt?: string | null;

  registrationStartAt?:
    | string
    | null;

  registrationEndAt?:
    | string
    | null;

  description?: string | null;
}

export interface UpdateCompetitionInput {
  name?: string;

  type?: CompetitionType;

  status?: CompetitionStatus;

  startAt?: string;

  endAt?: string | null;

  registrationStartAt?:
    | string
    | null;

  registrationEndAt?:
    | string
    | null;

  description?: string | null;
}

interface ApiResponse<T> {
  success: boolean;

  message?: string;

  data: T;
}

// ==================================================
// SERVICE
// ==================================================

export const competitionService = {
  // ------------------------------------------------
  // GET ALL
  // ------------------------------------------------

  async getAll(): Promise<
    Competition[]
  > {
    const response =
      await api.get<
        ApiResponse<Competition[]>
      >("/competitions");

    return response.data.data;
  },

  // ------------------------------------------------
  // GET ONE
  // ------------------------------------------------

  async getById(
    id: number
  ): Promise<Competition> {
    const response =
      await api.get<
        ApiResponse<Competition>
      >(
        `/competitions/${id}`
      );

    return response.data.data;
  },

  // ------------------------------------------------
  // CREATE
  // ------------------------------------------------

  async create(
    data: CreateCompetitionInput
  ): Promise<Competition> {
    const response =
      await api.post<
        ApiResponse<Competition>
      >(
        "/competitions",
        data
      );

    return response.data.data;
  },

  // ------------------------------------------------
  // UPDATE
  // ------------------------------------------------

  async update(
    id: number,
    data: UpdateCompetitionInput
  ): Promise<Competition> {
    const response =
      await api.patch<
        ApiResponse<Competition>
      >(
        `/competitions/${id}`,
        data
      );

    return response.data.data;
  },

  // ------------------------------------------------
  // DELETE
  // ------------------------------------------------

  async delete(
    id: number
  ): Promise<void> {
    await api.delete(
      `/competitions/${id}`
    );
  },
};