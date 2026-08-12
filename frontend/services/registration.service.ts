import api from "@/lib/api";

// =====================================================
// TYPES
// =====================================================

export interface Division {
  id: number;

  competition_id: number;

  name: string;

  skill_level:
    | "beginner"
    | "novice"
    | "intermediate";

  format:
    | "singles"
    | "doubles";

  max_players: number | null;

  entry_fee: number;

  status:
    | "open"
    | "closed"
    | "in_progress"
    | "completed";

  /**
   * Number of players who are actually
   * checked in.
   */
  checked_in_players: number;

  /**
   * Remaining slots based ONLY on
   * checked-in players.
   */
  remaining_slots: number | null;
}

interface ApiResponse<T> {
  success: boolean;

  message?: string;

  data: T;
}

// =====================================================
// REGISTRATION SERVICE
// =====================================================

export const registrationService = {
  // ===================================================
  // GET DIVISIONS
  // ===================================================

  async getDivisions(
    competitionId: number
  ): Promise<Division[]> {
    if (
      !Number.isInteger(
        competitionId
      ) ||
      competitionId <= 0
    ) {
      throw new Error(
        "Invalid competition ID."
      );
    }

    const response =
      await api.get<
        ApiResponse<Division[]>
      >(
        `/competitions/${competitionId}/divisions`
      );

    return response.data.data;
  },

  // ===================================================
  // REGISTER PLAYER
  // ===================================================

  async register(
    divisionId: number,
    formData: FormData
  ) {
    if (
      !Number.isInteger(
        divisionId
      ) ||
      divisionId <= 0
    ) {
      throw new Error(
        "Invalid division ID."
      );
    }

    const response =
      await api.post(
        `/competitions/divisions/${divisionId}/register`,
        formData
      );

    return response.data;
  },
};