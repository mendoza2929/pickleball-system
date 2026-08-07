import api from "@/lib/api";

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface AvailabilityResponse {
  success: boolean;
  data: {
    court: {
      id: number;
      name: string;
      hourly_rate: number;
    };
    date: string;
    day: string;
    open_time: string | null;
    close_time: string | null;
    slots: TimeSlot[];
  };
}

export const availabilityService = {
  async getAvailability(
    courtId: number,
    date: string
  ) {
    const response =
      await api.get<AvailabilityResponse>(
        "/availability",
        {
          params: {
            courtId,
            date,
          },
        }
      );

    return response.data.data;
  },
};