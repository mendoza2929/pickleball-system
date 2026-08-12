const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

export interface CourtAllocation {
  id: number;
  competition_id: number;
  competition_division_id:
    | number
    | null;
  court_id: number;
  allocation_date: string;
  start_time: string;
  end_time: string;
  allocation_type: string;
  status: string;

  court_number?: number;
  court_name?: string;
  court_status?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ==================================================
// GET ACCESS TOKEN
// ==================================================

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  /*
   * Use the same localStorage key used by
   * your login/authentication code.
   *
   * The fallback keys make this work if your
   * project currently uses one of these names.
   */

  return (
    localStorage.getItem("accessToken") ??
    localStorage.getItem("access_token") ??
    localStorage.getItem("token")
  );
}

// ==================================================
// AUTHENTICATED FETCH
// ==================================================

async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
) {
  const token =
    getAccessToken();

  const headers = new Headers(
    options.headers
  );

  headers.set(
    "Accept",
    "application/json"
  );

  headers.set(
    "Content-Type",
    "application/json"
  );

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response =
    await fetch(url, {
      ...options,
      headers,
      credentials: "include",
      cache: "no-store",
    });

  /*
   * Avoid trying to parse an HTML error page
   * as JSON.
   */

  const contentType =
    response.headers.get(
      "content-type"
    );

  if (
    !contentType?.includes(
      "application/json"
    )
  ) {
    const text =
      await response.text();

    throw new Error(
      text ||
        `Request failed with status ${response.status}`
    );
  }

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return result;
}

// ==================================================
// COURT ALLOCATION SERVICE
// ==================================================

export const courtAllocationService = {
  // ==================================================
  // GET ALL ALLOCATIONS FOR COMPETITION
  // ==================================================

  async getByCompetition(
    competitionId: number
  ): Promise<
    ApiResponse<CourtAllocation[]>
  > {
    if (
      !Number.isInteger(
        competitionId
      ) ||
      competitionId <= 0
    ) {
      throw new Error(
        "Invalid competition ID."
      );
    }

    const response =
      await authenticatedFetch(
        `${API_URL}/competitions/${competitionId}/court-allocations`
      );

    return response;
  },

  // ==================================================
  // GET AVAILABLE COURTS
  // ==================================================

  async getAvailableCourts(
    competitionId: number,
    date: string,
    startTime: string,
    endTime: string
  ) {
    if (
      !Number.isInteger(
        competitionId
      ) ||
      competitionId <= 0
    ) {
      throw new Error(
        "Invalid competition ID."
      );
    }

    const params =
      new URLSearchParams({
        date,
        start_time: startTime,
        end_time: endTime,
      });

    const response =
      await authenticatedFetch(
        `${API_URL}/competitions/${competitionId}/court-allocations/available?${params.toString()}`
      );

    return response;
  },

  // ==================================================
  // CREATE ALLOCATION
  // ==================================================

  async create(
    data: {
      competition_id: number;
      competition_division_id:
        | number
        | null;
      court_id: number;
      allocation_date: string;
      start_time: string;
      end_time: string;
      allocation_type:
        | "open_play"
        | "tournament";
    }
  ) {
    const response =
      await authenticatedFetch(
        `${API_URL}/competitions/${data.competition_id}/court-allocations`,
        {
          method: "POST",
          body: JSON.stringify(
            data
          ),
        }
      );

    return response;
  },

  // ==================================================
  // GET ONE
  // ==================================================

  async getOne(
    competitionId: number,
    allocationId: number
  ) {
    const response =
      await authenticatedFetch(
        `${API_URL}/competitions/${competitionId}/court-allocations/${allocationId}`
      );

    return response;
  },

  // ==================================================
  // UPDATE
  // ==================================================

  async update(
    competitionId: number,
    allocationId: number,
    data: {
      start_time?: string;
      end_time?: string;
      status?: string;
    }
  ) {
    const response =
      await authenticatedFetch(
        `${API_URL}/competitions/${competitionId}/court-allocations/${allocationId}`,
        {
          method: "PUT",
          body: JSON.stringify(
            data
          ),
        }
      );

    return response;
  },

  // ==================================================
  // RELEASE
  // ==================================================

  async release(
    competitionId: number,
    allocationId: number
  ) {
    const response =
      await authenticatedFetch(
        `${API_URL}/competitions/${competitionId}/court-allocations/${allocationId}`,
        {
          method: "DELETE",
        }
      );

    return response;
  },
};