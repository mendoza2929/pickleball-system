import api from "@/lib/api";

export type SessionStatus =
  | "scheduled"
  | "live"
  | "paused"
  | "completed"
  | "cancelled";

export interface OpenPlaySession {
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

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const sessionService = {

  // ==================================================
  // CREATE
  // ==================================================

  async create(
    divisionId: number
  ): Promise<OpenPlaySession> {

    const response =
      await api.post<
        ApiResponse<OpenPlaySession>
      >(
        `/competitions/divisions/${divisionId}/session`
      );

    return response.data.data;
  },

  // ==================================================
  // GET BY DIVISION
  // ==================================================

  async getByDivision(
    divisionId: number
  ): Promise<OpenPlaySession | null> {

    const response =
      await api.get<
        ApiResponse<OpenPlaySession | null>
      >(
        `/competitions/divisions/${divisionId}/session`
      );

    return response.data.data;
  },

  // ==================================================
  // GET BY ID
  // ==================================================

  async getById(
    sessionId: number
  ): Promise<OpenPlaySession> {

    const response =
      await api.get<
        ApiResponse<OpenPlaySession>
      >(
        `/competitions/sessions/${sessionId}`
      );

    return response.data.data;
  },

  // ==================================================
  // UPDATE STATUS
  // ==================================================

  async updateStatus(
    sessionId: number,
    status: SessionStatus
  ): Promise<OpenPlaySession> {

    const response =
      await api.patch<
        ApiResponse<OpenPlaySession>
      >(
        `/competitions/sessions/${sessionId}`,
        {
          status,
        }
      );

    return response.data.data;
  },

  // ==================================================
  // START
  // ==================================================

  async start(
    sessionId: number
  ): Promise<OpenPlaySession> {

    return this.updateStatus(
      sessionId,
      "live"
    );
  },

  // ==================================================
  // PAUSE
  // ==================================================

  async pause(
    sessionId: number
  ): Promise<OpenPlaySession> {

    return this.updateStatus(
      sessionId,
      "paused"
    );
  },

  // ==================================================
  // RESUME
  // ==================================================

  async resume(
    sessionId: number
  ): Promise<OpenPlaySession> {

    return this.updateStatus(
      sessionId,
      "live"
    );
  },

  // ==================================================
  // COMPLETE
  // ==================================================

  async complete(
    sessionId: number
  ): Promise<OpenPlaySession> {

    return this.updateStatus(
      sessionId,
      "completed"
    );
  },

  // ==================================================
  // CANCEL
  // ==================================================

  async cancel(
    sessionId: number
  ): Promise<OpenPlaySession> {

    return this.updateStatus(
      sessionId,
      "cancelled"
    );
  },
};