import api from "@/lib/api";
import axios from "axios";

// ============================================================
// TYPES
// ============================================================

export interface CourtScheduleOverride {
  id: number;
  uuid: string;

  court_id: number | null;
  court_name: string | null;

  schedule_date: string;

  open_time: string | null;
  close_time: string | null;

  is_closed: boolean;

  reason: string | null;

  created_at: string;
  updated_at: string;
}

export interface CreateCourtScheduleOverridePayload {
  court_id: number | null;

  schedule_date: string;

  open_time?: string | null;
  close_time?: string | null;

  is_closed: boolean;

  reason?: string | null;
}

export interface UpdateCourtScheduleOverridePayload {
  court_id?: number | null;

  schedule_date?: string;

  open_time?: string | null;
  close_time?: string | null;

  is_closed?: boolean;

  reason?: string | null;
}

// ============================================================
// API RESPONSE
// ============================================================

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================================
// API ERROR HELPER
// ============================================================

function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      fallbackMessage
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

// ============================================================
// GET ALL OVERRIDES FOR COURT
// ============================================================
//
// GET
// /api/court-schedule-overrides/court/:courtId
//
// ============================================================

export async function getCourtScheduleOverrides(
  courtId: number
): Promise<CourtScheduleOverride[]> {
  try {
    const response = await api.get(
      `/court-schedule-overrides/court/${courtId}`
    );

    const result: ApiResponse<
      CourtScheduleOverride[]
    > = response.data;

    if (!result.success) {
      throw new Error(
        result.message ||
          "Failed to retrieve court schedule overrides."
      );
    }

    return result.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to retrieve court schedule overrides."
      )
    );
  }
}

// ============================================================
// GET OVERRIDE BY COURT + DATE
// ============================================================
//
// GET
// /api/court-schedule-overrides/court/:courtId/date/:date
//
// ============================================================

export async function getCourtScheduleOverride(
  courtId: number,
  date: string
): Promise<CourtScheduleOverride | null> {
  try {
    const response = await api.get(
      `/court-schedule-overrides/court/${courtId}/date/${date}`
    );

    const result: ApiResponse<
      CourtScheduleOverride | null
    > = response.data;

    if (!result.success) {
      throw new Error(
        result.message ||
          "Failed to retrieve court schedule override."
      );
    }

    return result.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to retrieve court schedule override."
      )
    );
  }
}

// ============================================================
// GET OVERRIDE BY ID
// ============================================================
//
// GET
// /api/court-schedule-overrides/:id
//
// ============================================================

export async function getCourtScheduleOverrideById(
  id: number
): Promise<CourtScheduleOverride> {
  try {
    const response = await api.get(
      `/court-schedule-overrides/${id}`
    );

    const result: ApiResponse<
      CourtScheduleOverride
    > = response.data;

    if (!result.success) {
      throw new Error(
        result.message ||
          "Failed to retrieve court schedule override."
      );
    }

    return result.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to retrieve court schedule override."
      )
    );
  }
}

// ============================================================
// CREATE OVERRIDE
// ============================================================
//
// POST
// /api/court-schedule-overrides
//
// ============================================================

export async function createCourtScheduleOverride(
  payload: CreateCourtScheduleOverridePayload
): Promise<CourtScheduleOverride> {
  try {
    const response = await api.post(
      "/court-schedule-overrides",
      payload
    );

    const result: ApiResponse<
      CourtScheduleOverride
    > = response.data;

    if (!result.success) {
      throw new Error(
        result.message ||
          "Failed to create court schedule override."
      );
    }

    return result.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to create court schedule override."
      )
    );
  }
}

// ============================================================
// UPDATE OVERRIDE
// ============================================================
//
// PUT
// /api/court-schedule-overrides/:id
//
// ============================================================

export async function updateCourtScheduleOverride(
  id: number,
  payload: UpdateCourtScheduleOverridePayload
): Promise<CourtScheduleOverride> {
  try {
    const response = await api.put(
      `/court-schedule-overrides/${id}`,
      payload
    );

    const result: ApiResponse<
      CourtScheduleOverride
    > = response.data;

    if (!result.success) {
      throw new Error(
        result.message ||
          "Failed to update court schedule override."
      );
    }

    return result.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to update court schedule override."
      )
    );
  }
}

// ============================================================
// DELETE OVERRIDE
// ============================================================
//
// DELETE
// /api/court-schedule-overrides/:id
//
// ============================================================

export async function deleteCourtScheduleOverride(
  id: number
): Promise<void> {
  try {
    const response = await api.delete(
      `/court-schedule-overrides/${id}`
    );

    const result: ApiResponse<null> =
      response.data;

    if (!result.success) {
      throw new Error(
        result.message ||
          "Failed to delete court schedule override."
      );
    }
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to delete court schedule override."
      )
    );
  }
}