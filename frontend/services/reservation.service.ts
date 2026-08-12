import api from "@/lib/api";

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

export interface Reservation {
  id: number;
  uuid: string;
  reservation_no: string;

  court_id: number;
  reservation_date: string;
  start_time: string;
  end_time: string;

  total_hours: number;
  hourly_rate: number;
  total_amount: number;

  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;

  remarks?: string | null;

  reservation_status: string;
  payment_status: string;

  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const reservationService = {
  // ==================================================
  // CREATE RESERVATION
  // ==================================================

  async createReservation(
    data: CreateReservationRequest
  ): Promise<Reservation> {
    const response =
      await api.post<ApiResponse<Reservation>>(
        "/reservations",
        data
      );

    return response.data.data;
  },

  // ==================================================
  // GET RESERVATION BY UUID
  // ==================================================

  async getByUuid(
    uuid: string
  ): Promise<Reservation> {
    const response =
      await api.get<ApiResponse<Reservation>>(
        `/reservations/uuid/${uuid}`
      );

    return response.data.data;
  },
};