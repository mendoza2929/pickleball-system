import api from "@/lib/api";

// ==================================================
// TYPES
// ==================================================

export interface AssignedCourt {
  id: number;

  name: string;

  status: string;
}

export interface MatchCourtAssignment {
  id: number;

  competition_session_id: number;

  court_id: number | null;

  court_assigned_at: string | null;

  match_number: number;

  status: string;

  started_at: string | null;

  completed_at: string | null;
}

interface ApiResponse<T> {
  success: boolean;

  message?: string;

  data: T;
}

// ==================================================
// MATCH COURT SERVICE
// ==================================================

export const matchCourtService = {
  // ------------------------------------------------
  // AUTOMATIC COURT ASSIGNMENT
  // ------------------------------------------------

  async autoAssign(
    matchId: number
  ): Promise<MatchCourtAssignment> {
    const response =
      await api.post<
        ApiResponse<MatchCourtAssignment>
      >(
        `/competitions/matches/${matchId}/assign-court`
      );

    return response.data.data;
  },

  // ------------------------------------------------
  // MANUAL COURT ASSIGNMENT
  // ------------------------------------------------

  async assign(
    matchId: number,
    courtId: number
  ): Promise<MatchCourtAssignment> {
    const response =
      await api.patch<
        ApiResponse<MatchCourtAssignment>
      >(
        `/competitions/matches/${matchId}/court`,
        {
          courtId,
        }
      );

    return response.data.data;
  },

  // ------------------------------------------------
  // REMOVE COURT
  // ------------------------------------------------

  async remove(
    matchId: number
  ): Promise<MatchCourtAssignment> {
    const response =
      await api.delete<
        ApiResponse<MatchCourtAssignment>
      >(
        `/competitions/matches/${matchId}/court`
      );

    return response.data.data;
  },
};