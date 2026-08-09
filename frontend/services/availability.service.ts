import api from "@/lib/api";

// ============================================================
// TYPES
// ============================================================

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

// ============================================================
// AVAILABILITY SERVICE
// ============================================================

export const availabilityService = {
  async getAvailability(
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
  },
};