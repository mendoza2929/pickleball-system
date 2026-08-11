import api from "@/lib/api";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Court {
  id: number;
  name: string;
  status: string;
}

export interface AssignedMatch {
  id: number;
  competition_session_id: number;
  court_id: number | null;
  court_assigned_at: string | null;
  match_number: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
}

export const courtService = {
  // -----------------------------------------------
  // AUTOMATIC COURT ASSIGNMENT
  // -----------------------------------------------

  async autoAssign(
    matchId: number
  ): Promise<AssignedMatch> {
    const response =
      await api.post<
        ApiResponse<AssignedMatch>
      >(
        `/competitions/matches/${matchId}/assign-court`
      );

    return response.data.data;
  },

  // -----------------------------------------------
  // MANUAL COURT ASSIGNMENT
  // -----------------------------------------------

  async assign(
    matchId: number,
    courtId: number
  ): Promise<AssignedMatch> {
    const response =
      await api.patch<
        ApiResponse<AssignedMatch>
      >(
        `/competitions/matches/${matchId}/court`,
        {
          courtId,
        }
      );

    return response.data.data;
  },

  // -----------------------------------------------
  // REMOVE COURT
  // -----------------------------------------------

  async remove(
    matchId: number
  ): Promise<AssignedMatch> {
    const response =
      await api.delete<
        ApiResponse<AssignedMatch>
      >(
        `/competitions/matches/${matchId}/court`
      );

    return response.data.data;
  },
};