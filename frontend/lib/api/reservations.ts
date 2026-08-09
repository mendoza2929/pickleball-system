import api from "@/lib/api";

export interface Reservation {
  id: number;
  uuid: string;
  reservation_no: string;

  user_id: number | null;

  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;

  court_id: number;
  court_name?: string | null;

  player_name?: string | null;

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

  remarks?: string | null;

  created_at?: string;
  updated_at?: string;
}

interface ReservationsResponse {
  success: boolean;
  message: string;
  data: Reservation[];
}

interface ReservationResponse {
  success: boolean;
  message: string;
  data: Reservation;
}

export async function getReservations(): Promise<Reservation[]> {
  const response =
    await api.get<ReservationsResponse>(
      "/reservations"
    );

  return response.data.data;
}

// ============================================================
// UPDATE RESERVATION STATUS / PAYMENT STATUS
// ============================================================

export interface UpdateReservationPayload {
  reservation_status?: Reservation["reservation_status"];
  payment_status?: Reservation["payment_status"];
}

export async function updateReservation(
  id: number,
  payload: UpdateReservationPayload
): Promise<Reservation> {
  const response =
    await api.patch<ReservationResponse>(
       `/reservations/${id}/status`,
      payload
    );

  return response.data.data;
}