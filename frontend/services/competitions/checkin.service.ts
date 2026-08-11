import api from "@/lib/api";

// ==================================================
// TYPES
// ==================================================

export type CheckinStatus =
  | "checked_in"
  | "no_show"
  | "cancelled";

export interface CompetitionCheckin {
  id: number;

  competition_registration_id: number;

  status: CheckinStatus;

  checked_in_at: string | null;

  created_at: string;

  updated_at: string;

  competition_player_id?: number;

  customer_id?: number;

  customer_no?: string;

  first_name?: string;

  last_name?: string;

  email?: string;

  phone?: string;
}

interface ApiResponse<T> {
  success: boolean;

  message?: string;

  data: T;
}

// ==================================================
// CHECK-IN SERVICE
// ==================================================

export const checkinService = {
  // ------------------------------------------------
  // CHECK IN REGISTERED PLAYER
  // ------------------------------------------------

  async create(
    registrationId: number
  ): Promise<CompetitionCheckin> {
    const response =
      await api.post<
        ApiResponse<CompetitionCheckin>
      >(
        `/competitions/registrations/${registrationId}/check-in`
      );

    return response.data.data;
  },

  // ------------------------------------------------
  // GET CHECK-IN BY ID
  // ------------------------------------------------

  async getById(
    checkinId: number
  ): Promise<CompetitionCheckin> {
    const response =
      await api.get<
        ApiResponse<CompetitionCheckin>
      >(
        `/competitions/check-ins/${checkinId}`
      );

    return response.data.data;
  },

  // ------------------------------------------------
  // GET CHECK-INS BY DIVISION
  // ------------------------------------------------

  async getByDivision(
    divisionId: number
  ): Promise<CompetitionCheckin[]> {
    const response =
      await api.get<
        ApiResponse<CompetitionCheckin[]>
      >(
        `/competitions/divisions/${divisionId}/check-ins`
      );

    return response.data.data;
  },

  // ------------------------------------------------
  // MARK NO-SHOW
  // ------------------------------------------------

  async noShow(
    checkinId: number
  ): Promise<CompetitionCheckin> {
    const response =
      await api.patch<
        ApiResponse<CompetitionCheckin>
      >(
        `/competitions/check-ins/${checkinId}/no-show`
      );

    return response.data.data;
  },

  // ------------------------------------------------
  // CANCEL CHECK-IN
  // ------------------------------------------------

  async cancel(
    checkinId: number
  ): Promise<CompetitionCheckin> {
    const response =
      await api.patch<
        ApiResponse<CompetitionCheckin>
      >(
        `/competitions/check-ins/${checkinId}/cancel`
      );

    return response.data.data;
  },
};