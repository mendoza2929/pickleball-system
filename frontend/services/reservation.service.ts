import api from "@/lib/api";

// =====================================================
// RESERVATION TYPES
// =====================================================

export interface CreateReservationRequest {
  court_id: number;
  reservation_date: string;
  start_time: string;
  end_time: string;

  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;

  remarks?: string;
}

// =====================================================
// RESERVATION RESPONSE
// =====================================================

export interface Reservation {
  id: number;
  uuid: string;
  reservation_no: string;

  user_id: number | null;
  customer_id: number | null;

  court_id: number;

  reservation_date: string;

  start_time: string;
  end_time: string;

  total_hours: number;
  hourly_rate: number;
  total_amount: number;

  reservation_status:
    | "Pending"
    | "Confirmed"
    | "Cancelled"
    | "Completed";

  payment_status:
    | "Unpaid"
    | "Partial"
    | "Paid";

  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;

  remarks?: string | null;

  created_at: string;
  updated_at: string;
}

// =====================================================
// API RESPONSE
// =====================================================

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// =====================================================
// COMPETITION DIVISION TYPES
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

  created_at: string;
  updated_at: string;

  // =================================================
  // SLOT INFORMATION
  // =================================================

  confirmed_players: number;

  remaining_slots: number | null;

  is_full: boolean;
}

// =====================================================
// AVAILABLE SLOT
// =====================================================

export interface AvailableSlot {
  start_time: string;
  end_time: string;
}

// =====================================================
// RESERVATION AVAILABILITY
// =====================================================

export interface ReservationAvailability {
  court_id: number;

  court_name: string;

  reservation_date: string;

  day_of_week: string;

  duration_hours: number;

  is_closed: boolean;

  open_time: string | null;

  close_time: string | null;

  available_slots: AvailableSlot[];
}

// =====================================================
// RESERVATION SERVICE
// =====================================================

export const reservationService = {
  // ===================================================
  // CREATE ONLINE RESERVATION
  // ===================================================

  async createReservation(
    data: CreateReservationRequest
  ): Promise<Reservation> {
    const response =
      await api.post<
        ApiResponse<Reservation>
      >(
        "/reservations",
        data
      );

    return response.data.data;
  },

  // ===================================================
  // GET RESERVATION BY UUID
  // ===================================================

  async getByUuid(
    uuid: string
  ): Promise<Reservation> {
    const response =
      await api.get<
        ApiResponse<Reservation>
      >(
        `/reservations/uuid/${uuid}`
      );

    return response.data.data;
  },

  // ===================================================
  // GET COURT AVAILABILITY
  // ===================================================

  async getAvailability(
    courtId: number,
    reservationDate: string,
    durationHours: number = 1
  ): Promise<ReservationAvailability> {
    const response =
      await api.get<
        ApiResponse<ReservationAvailability>
      >(
        "/reservations/availability",
        {
          params: {
            court_id:
              courtId,

            reservation_date:
              reservationDate,

            duration_hours:
              durationHours,
          },
        }
      );

    return response.data.data;
  },

  // ===================================================
  // GET COMPETITION DIVISIONS
  //
  // Used by the competition registration page.
  // ===================================================

  async getCompetitionDivisions(
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

  // ===================================================
  // GET ONE COMPETITION DIVISION
  // ===================================================

  async getCompetitionDivision(
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