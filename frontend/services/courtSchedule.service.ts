import api from "@/lib/api";

export interface CourtSchedule {
  id: number;
  uuid: string;
  court_id: number;
  court_name?: string;

  day_of_week:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";

  open_time: string | null;
  close_time: string | null;

  is_closed: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface UpdateCourtSchedulePayload {
  day_of_week: CourtSchedule["day_of_week"];

  open_time: string | null;

  close_time: string | null;

  is_closed: boolean;
}

interface CourtSchedulesResponse {
  success: boolean;
  data: CourtSchedule[];
}

interface CourtScheduleResponse {
  success: boolean;
  data: CourtSchedule;
}

// =====================================================
// GET COURT SCHEDULES
// =====================================================

export async function getCourtSchedules(
  courtId: number
): Promise<CourtSchedule[]> {
  const response =
    await api.get<CourtSchedulesResponse>(
      `/court-schedules/court/${courtId}`
    );

  return response.data.data;
}

// =====================================================
// UPDATE COURT SCHEDULE
// =====================================================

export async function updateCourtSchedule(
  id: number,
  payload: UpdateCourtSchedulePayload
): Promise<CourtSchedule> {
  const response =
    await api.put<CourtScheduleResponse>(
      `/court-schedules/${id}`,
      payload
    );

  return response.data.data;
}