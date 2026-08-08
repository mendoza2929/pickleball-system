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

export const reservationService = {
  async createReservation(
    data: CreateReservationRequest
  ) {
    const response = await api.post(
      "/reservations",
      data
    );

    return response.data;
  },

  async getByUuid(uuid: string) {
    const response = await api.get(
      `/reservations/uuid/${uuid}`
    );

    return response.data.data;
  },
};