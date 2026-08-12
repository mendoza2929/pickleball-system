import api from "@/lib/api";

// ==================================================
// TYPES
// ==================================================

export type CompetitionType =
  | "open_play"
  | "tournament";

export type CompetitionStatus =
  | "draft"
  | "published"
  | "registration_open"
  | "registration_closed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Competition {
  id: number;

  name: string;

  type: CompetitionType;

  status: CompetitionStatus;

  start_at: string;

  end_at: string | null;

  registration_start_at: string | null;

  registration_end_at: string | null;

  description: string | null;

  created_at: string;

  updated_at: string;
}

export interface CreateCompetitionInput {
  name: string;

  type: CompetitionType;

  startAt: string;

  endAt?: string | null;

  registrationStartAt?: string | null;

  registrationEndAt?: string | null;

  description?: string | null;
}

export interface UpdateCompetitionInput {
  name?: string;

  type?: CompetitionType;

  status?: CompetitionStatus;

  startAt?: string;

  endAt?: string | null;

  registrationStartAt?: string | null;

  registrationEndAt?: string | null;

  description?: string | null;
}

interface ApiResponse<T> {
  success: boolean;

  message?: string;

  data: T;
}

// ==================================================
// DATETIME NORMALIZER
// ==================================================

function normalizeDateTime(
  value: string | null | undefined
): string | null {
  if (!value) {
    return null;
  }

  const input = String(value).trim();

  // ==================================================
  // Already correct:
  // 2026-08-29T16:00
  // ==================================================

  let match = input.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/
  );

  if (match) {
    return `${match[1]}T${match[2]}:${match[3]}`;
  }

  // ==================================================
  // ISO:
  // 2026-08-29T16:00:00
  // 2026-08-29T16:00:00.000Z
  // ==================================================

  match = input.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?$/
  );

  if (match) {
    return `${match[1]}T${match[2]}:${match[3]}`;
  }

  // ==================================================
  // MySQL:
  // 2026-08-29 16:00:00
  // ==================================================

  match = input.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/
  );

  if (match) {
    return `${match[1]}T${match[2]}:${match[3]}`;
  }

  // ==================================================
  // DISPLAY FORMAT:
  //
  // 08/29/2026 04:00 PM
  // 08/29/2026 4:00 PM
  // ==================================================

  match = input.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (match) {
    const month = Number(match[1]);
    const day = Number(match[2]);
    const year = Number(match[3]);

    let hour = Number(match[4]);

    const minute = Number(match[5]);

    const meridiem =
      match[6].toUpperCase();

    // -----------------------------------------------
    // Convert 12-hour to 24-hour
    // -----------------------------------------------

    if (meridiem === "AM") {
      if (hour === 12) {
        hour = 0;
      }
    } else {
      if (hour !== 12) {
        hour += 12;
      }
    }

    return [
      `${year}-${String(month).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`,
      `T${String(hour).padStart(
        2,
        "0"
      )}:${String(minute).padStart(2, "0")}`,
    ].join("");
  }

  return null;
}

// ==================================================
// VALIDATE HOURLY INTERVAL
// ==================================================

function validateHourlyDateTime(
  value: string | null | undefined,
  fieldName: string
): void {
  if (!value) {
    return;
  }

  const normalized =
    normalizeDateTime(value);

  if (!normalized) {
    throw new Error(
      `${fieldName} must be on a 1-hour interval (for example, 6:00 PM, 7:00 PM, or 8:00 PM).`
    );
  }

  // ==================================================
  // IMPORTANT:
  // Validate the STRING itself.
  // Do NOT use new Date().
  // ==================================================

  const match = normalized.match(
    /^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})$/
  );

  if (!match) {
    throw new Error(
      `${fieldName} must be on a 1-hour interval (for example, 6:00 PM, 7:00 PM, or 8:00 PM).`
    );
  }

  const minute = Number(match[2]);

  if (minute !== 0) {
    throw new Error(
      `${fieldName} must be on a 1-hour interval (for example, 6:00 PM, 7:00 PM, or 8:00 PM).`
    );
  }
}

// ==================================================
// PREPARE PAYLOAD
// ==================================================

function preparePayload<
  T extends
    | CreateCompetitionInput
    | UpdateCompetitionInput
>(data: T): T {
  const payload: any = {
    ...data,
  };

  // ==================================================
  // START
  // ==================================================

  if (data.startAt !== undefined) {
    const value =
      normalizeDateTime(
        data.startAt
      );

    if (!value) {
      throw new Error(
        "Competition start time must be on a 1-hour interval (for example, 6:00 PM, 7:00 PM, or 8:00 PM)."
      );
    }

    validateHourlyDateTime(
      value,
      "Competition start time"
    );

    payload.startAt = value;
  }

  // ==================================================
  // END
  // ==================================================

  if (data.endAt !== undefined) {
    if (data.endAt === null) {
      payload.endAt = null;
    } else {
      const value =
        normalizeDateTime(
          data.endAt
        );

      if (!value) {
        throw new Error(
          "Competition end time must be on a 1-hour interval (for example, 6:00 PM, 7:00 PM, or 8:00 PM)."
        );
      }

      validateHourlyDateTime(
        value,
        "Competition end time"
      );

      payload.endAt = value;
    }
  }

  // ==================================================
  // REGISTRATION START
  // ==================================================

  if (
    data.registrationStartAt !==
    undefined
  ) {
    if (
      data.registrationStartAt ===
      null
    ) {
      payload.registrationStartAt =
        null;
    } else {
      const value =
        normalizeDateTime(
          data.registrationStartAt
        );

      if (!value) {
        throw new Error(
          "Registration opening time must be on a 1-hour interval (for example, 6:00 PM, 7:00 PM, or 8:00 PM)."
        );
      }

      validateHourlyDateTime(
        value,
        "Registration opening time"
      );

      payload.registrationStartAt =
        value;
    }
  }

  // ==================================================
  // REGISTRATION END
  // ==================================================

  if (
    data.registrationEndAt !==
    undefined
  ) {
    if (
      data.registrationEndAt ===
      null
    ) {
      payload.registrationEndAt =
        null;
    } else {
      const value =
        normalizeDateTime(
          data.registrationEndAt
        );

      if (!value) {
        throw new Error(
          "Registration closing time must be on a 1-hour interval (for example, 6:00 PM, 7:00 PM, or 8:00 PM)."
        );
      }

      validateHourlyDateTime(
        value,
        "Registration closing time"
      );

      payload.registrationEndAt =
        value;
    }
  }

  return payload as T;
}

// ==================================================
// SERVICE
// ==================================================

export const competitionService = {
  // ==================================================
  // GET ALL
  // ==================================================

  async getAll(): Promise<
    Competition[]
  > {
    const response =
      await api.get<
        ApiResponse<Competition[]>
      >("/competitions");

    return response.data.data;
  },

  // ==================================================
  // GET ONE
  // ==================================================

  async getById(
    id: number
  ): Promise<Competition> {
    const response =
      await api.get<
        ApiResponse<Competition>
      >(
        `/competitions/${id}`
      );

    return response.data.data;
  },

  // ==================================================
  // CREATE
  // ==================================================

  async create(
    data: CreateCompetitionInput
  ): Promise<Competition> {
    const payload =
      preparePayload(data);

    const response =
      await api.post<
        ApiResponse<Competition>
      >(
        "/competitions",
        payload
      );

    return response.data.data;
  },

  // ==================================================
  // UPDATE
  // ==================================================

  async update(
    id: number,
    data: UpdateCompetitionInput
  ): Promise<Competition> {
    const payload =
      preparePayload(data);

    console.log(
      "[Competition Update] payload:",
      payload
    );

    const response =
      await api.patch<
        ApiResponse<Competition>
      >(
        `/competitions/${id}`,
        payload
      );

    return response.data.data;
  },

  // ==================================================
  // DELETE
  // ==================================================

  async delete(
    id: number
  ): Promise<void> {
    await api.delete(
      `/competitions/${id}`
    );
  },
};