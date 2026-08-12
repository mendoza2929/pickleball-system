import {
  createCompetition,
  findAllCompetitions,
  findCompetitionById,
  updateCompetition,
} from "./competition.repository";

import {
  CreateCompetitionInput,
  UpdateCompetitionInput,
} from "./competition.types";

// ==================================================
// CONSTANTS
// ==================================================

const COMPETITION_TYPES = [
  "open_play",
  "tournament",
] as const;

const COMPETITION_STATUSES = [
  "draft",
  "published",
  "registration_open",
  "registration_closed",
  "in_progress",
  "completed",
  "cancelled",
] as const;

// ==================================================
// DATETIME HELPERS
// ==================================================

function normalizeHourlyDateTime(
  value: string | null | undefined
): string | null {
  if (!value) {
    return null;
  }

  const input = String(value).trim();

  // -----------------------------------------------
  // YYYY-MM-DDTHH:MM
  // -----------------------------------------------

  let match = input.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/
  );

  if (match) {
    const [, date, hour, minute] =
      match;

    return `${date}T${hour}:${minute}`;
  }

  // -----------------------------------------------
  // ISO
  // -----------------------------------------------

  match = input.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?$/
  );

  if (match) {
    const [, date, hour, minute] =
      match;

    return `${date}T${hour}:${minute}`;
  }

  // -----------------------------------------------
  // MYSQL
  // -----------------------------------------------

  match = input.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/
  );

  if (match) {
    const [, date, hour, minute] =
      match;

    return `${date}T${hour}:${minute}`;
  }

  return null;
}

// ==================================================
// VALIDATE HOURLY TIME
// ==================================================

function validateHourlyDateTime(
  value: string | null | undefined,
  fieldName: string
): void {
  if (!value) {
    return;
  }

  const normalized =
    normalizeHourlyDateTime(value);

  if (!normalized) {
    throw new Error(
      `${fieldName} must be on a 1-hour interval (for example, 6:00 PM, 7:00 PM, or 8:00 PM).`
    );
  }

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
// VALIDATE DATE ORDER
// ==================================================

function validateDateOrder(
  startAt: string | null | undefined,
  endAt: string | null | undefined
): void {
  if (
    startAt &&
    endAt &&
    new Date(endAt).getTime() <
      new Date(startAt).getTime()
  ) {
    throw new Error(
      "End date cannot be before start date"
    );
  }
}

// ==================================================
// VALIDATE REGISTRATION ORDER
// ==================================================

function validateRegistrationOrder(
  registrationStartAt:
    | string
    | null
    | undefined,
  registrationEndAt:
    | string
    | null
    | undefined
): void {
  if (
    registrationStartAt &&
    registrationEndAt &&
    new Date(
      registrationEndAt
    ).getTime() <
      new Date(
        registrationStartAt
      ).getTime()
  ) {
    throw new Error(
      "Registration end date cannot be before registration start date"
    );
  }
}

// ==================================================
// GET ALL
// ==================================================

export async function getCompetitions() {
  return findAllCompetitions();
}

// ==================================================
// GET ONE
// ==================================================

export async function getCompetition(
  id: number
) {
  const competition =
    await findCompetitionById(id);

  if (!competition) {
    throw new Error(
      "Competition not found"
    );
  }

  return competition;
}

// ==================================================
// CREATE
// ==================================================

export async function createNewCompetition(
  data: CreateCompetitionInput
) {
  // -----------------------------------------------
  // Name
  // -----------------------------------------------

  if (!data.name?.trim()) {
    throw new Error(
      "Competition name is required"
    );
  }

  // -----------------------------------------------
  // Type
  // -----------------------------------------------

  if (
    !COMPETITION_TYPES.includes(
      data.type as any
    )
  ) {
    throw new Error(
      "Invalid competition type"
    );
  }

  // -----------------------------------------------
  // Start
  // -----------------------------------------------

  if (!data.startAt) {
    throw new Error(
      "Competition start date is required"
    );
  }

  // -----------------------------------------------
  // Created By
  // -----------------------------------------------

  if (
    !Number.isInteger(
      data.createdBy
    ) ||
    data.createdBy <= 0
  ) {
    throw new Error(
      "Valid createdBy is required"
    );
  }

  // -----------------------------------------------
  // Normalize
  // -----------------------------------------------

  const startAt =
    normalizeHourlyDateTime(
      data.startAt
    );

  const endAt =
    normalizeHourlyDateTime(
      data.endAt
    );

  const registrationStartAt =
    normalizeHourlyDateTime(
      data.registrationStartAt
    );

  const registrationEndAt =
    normalizeHourlyDateTime(
      data.registrationEndAt
    );

  // -----------------------------------------------
  // Validate hourly intervals
  // -----------------------------------------------

  validateHourlyDateTime(
    startAt,
    "Competition start time"
  );

  validateHourlyDateTime(
    endAt,
    "Competition end time"
  );

  validateHourlyDateTime(
    registrationStartAt,
    "Registration opening time"
  );

  validateHourlyDateTime(
    registrationEndAt,
    "Registration closing time"
  );

  // -----------------------------------------------
  // Validate date order
  // -----------------------------------------------

  validateDateOrder(
    startAt,
    endAt
  );

  // -----------------------------------------------
  // Validate registration
  // -----------------------------------------------

  validateRegistrationOrder(
    registrationStartAt,
    registrationEndAt
  );

  // -----------------------------------------------
  // Create
  // -----------------------------------------------

  return createCompetition({
    ...data,

    startAt:
      startAt as string,

    endAt,

    registrationStartAt,

    registrationEndAt,
  });
}

// ==================================================
// UPDATE
// ==================================================

export async function editCompetition(
  id: number,
  data: UpdateCompetitionInput
) {
  // -----------------------------------------------
  // Find competition
  // -----------------------------------------------

  const competition =
    await findCompetitionById(id);

  if (!competition) {
    throw new Error(
      "Competition not found"
    );
  }

  // -----------------------------------------------
  // Type
  // -----------------------------------------------

  if (
    data.type &&
    !COMPETITION_TYPES.includes(
      data.type as any
    )
  ) {
    throw new Error(
      "Invalid competition type"
    );
  }

  // -----------------------------------------------
  // Status
  // -----------------------------------------------

  if (
    data.status &&
    !COMPETITION_STATUSES.includes(
      data.status as any
    )
  ) {
    throw new Error(
      "Invalid competition status"
    );
  }

  // -----------------------------------------------
  // Build values using EXISTING values
  // -----------------------------------------------
  //
  // This is the important part for EDIT.
  //
  // If the user only changes the name,
  // we still validate the existing
  // competition dates.
  //
  // -----------------------------------------------

  const startAt =
    data.startAt !== undefined
      ? normalizeHourlyDateTime(
          data.startAt
        )
      : normalizeHourlyDateTime(
          competition.start_at
        );

  const endAt =
    data.endAt !== undefined
      ? normalizeHourlyDateTime(
          data.endAt
        )
      : normalizeHourlyDateTime(
          competition.end_at
        );

  const registrationStartAt =
    data.registrationStartAt !==
    undefined
      ? normalizeHourlyDateTime(
          data.registrationStartAt
        )
      : normalizeHourlyDateTime(
          competition.registration_start_at
        );

  const registrationEndAt =
    data.registrationEndAt !==
    undefined
      ? normalizeHourlyDateTime(
          data.registrationEndAt
        )
      : normalizeHourlyDateTime(
          competition.registration_end_at
        );

  // -----------------------------------------------
  // Validate start
  // -----------------------------------------------

  validateHourlyDateTime(
    startAt,
    "Competition start time"
  );

  // -----------------------------------------------
  // Validate end
  // -----------------------------------------------

  validateHourlyDateTime(
    endAt,
    "Competition end time"
  );

  // -----------------------------------------------
  // Validate registration start
  // -----------------------------------------------

  validateHourlyDateTime(
    registrationStartAt,
    "Registration opening time"
  );

  // -----------------------------------------------
  // Validate registration end
  // -----------------------------------------------

  validateHourlyDateTime(
    registrationEndAt,
    "Registration closing time"
  );

  // -----------------------------------------------
  // Validate competition dates
  // -----------------------------------------------

  validateDateOrder(
    startAt,
    endAt
  );

  // -----------------------------------------------
  // Validate registration dates
  // -----------------------------------------------

  validateRegistrationOrder(
    registrationStartAt,
    registrationEndAt
  );

  // -----------------------------------------------
  // Update
  // -----------------------------------------------

  return updateCompetition(
    id,
    {
      ...data,

      ...(data.startAt !==
        undefined && {
        startAt:
          startAt as string,
      }),

      ...(data.endAt !==
        undefined && {
        endAt,
      }),

      ...(data.registrationStartAt !==
        undefined && {
        registrationStartAt,
      }),

      ...(data.registrationEndAt !==
        undefined && {
        registrationEndAt,
      }),
    }
  );
}