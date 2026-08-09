import api from "@/lib/api";

// ============================================================
// TYPES
// ============================================================

export type CourtStatus =
  | "Available"
  | "Maintenance"
  | "Inactive";

export interface Court {
  id: number;
  uuid: string;

  court_number: number;
  name: string;

  description?: string | null;

  surface_type: string;

  hourly_rate: number;

  status: CourtStatus;

  created_at?: string;
  updated_at?: string;
}

export interface CreateCourtPayload {
  court_number: number;
  name: string;
  description?: string;
  surface_type: string;
  hourly_rate: number;
}

export interface UpdateCourtPayload {
  court_number?: number;
  name?: string;
  description?: string;
  surface_type?: string;
  hourly_rate?: number;
}

// ============================================================
// API RESPONSE
// ============================================================

interface CourtsResponse {
  success: boolean;
  message?: string;
  data: Court[];
}

interface CourtResponse {
  success: boolean;
  message?: string;
  data: Court;
}

// ============================================================
// GET ALL COURTS
// ============================================================

export async function getCourts(): Promise<Court[]> {
  const response =
    await api.get<CourtsResponse>(
      "/courts"
    );

  return response.data.data;
}

// ============================================================
// GET COURT BY ID
// ============================================================

export async function getCourt(
  id: number
): Promise<Court> {
  const response =
    await api.get<CourtResponse>(
      `/courts/${id}`
    );

  return response.data.data;
}

// ============================================================
// CREATE COURT
// ============================================================

export async function createCourt(
  payload: CreateCourtPayload
): Promise<Court> {
  const response =
    await api.post<CourtResponse>(
      "/courts",
      payload
    );

  return response.data.data;
}

// ============================================================
// UPDATE COURT
// ============================================================

export async function updateCourt(
  id: number,
  payload: UpdateCourtPayload
): Promise<Court> {
  const response =
    await api.put<CourtResponse>(
      `/courts/${id}`,
      payload
    );

  return response.data.data;
}

// ============================================================
// DELETE COURT
// ============================================================

export async function deleteCourt(
  id: number
): Promise<void> {
  await api.delete(
    `/courts/${id}`
  );
}