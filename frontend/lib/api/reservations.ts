import api from "@/lib/api";

// =====================================================
// RESERVATION TYPES
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

  remarks: string | null;

  created_at: string;

  updated_at: string;

  customer?: {
    id: number;

    uuid?: string;

    first_name: string;

    last_name: string;

    email?: string | null;

    phone?: string | null;
  } | null;

  court?: {
    id: number;

    uuid?: string;

    name: string;
  } | null;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

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

// =====================================================
// WALK-IN RESERVATION
// =====================================================

export interface CreateWalkInReservationPayload {
  customer_id: number;

  court_id: number;

  reservation_date: string;

  start_time: string;

  end_time: string;

  remarks?: string;
}
// =====================================================
// UPDATE RESERVATION
// =====================================================

export interface UpdateReservationPayload {
  reservation_status:
    | "Pending"
    | "Confirmed"
    | "Cancelled"
    | "Completed";

  payment_status:
    | "Unpaid"
    | "Partial"
    | "Paid";
}

// =====================================================
// GET ALL RESERVATIONS
// GET /api/reservations
// =====================================================

export async function getReservations(): Promise<
  Reservation[]
> {
  const response =
    await api.get<ReservationsResponse>(
      "/reservations"
    );

  return response.data.data;
}

// =====================================================
// CREATE WALK-IN RESERVATION
// POST /api/reservations/walk-in
// =====================================================

export async function createWalkInReservation(
  payload: CreateWalkInReservationPayload
): Promise<Reservation> {
  const response =
    await api.post<ReservationResponse>(
      "/reservations/walk-in",
      payload
    );

  return response.data.data;
}

// =====================================================
// UPDATE RESERVATION STATUS
// PATCH /api/reservations/:id/status
// =====================================================

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

// =====================================================
// AVAILABILITY
// =====================================================

export interface AvailableSlot {
  start_time: string;

  end_time: string;
}

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

interface AvailabilityResponse {
  success: boolean;

  message: string;

  data: ReservationAvailability;
}

// =====================================================
// GET RESERVATION AVAILABILITY
// GET /api/reservations/availability
// =====================================================

export async function getReservationAvailability(
  courtId: number,

  reservationDate: string,

  durationHours: number = 1
): Promise<ReservationAvailability> {
  const response =
    await api.get<AvailabilityResponse>(
      "/reservations/availability",
      {
        params: {
          court_id: courtId,

          reservation_date:
            reservationDate,

          duration_hours:
            durationHours,
        },
      }
    );

  return response.data.data;
}