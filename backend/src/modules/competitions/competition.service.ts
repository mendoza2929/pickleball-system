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
  if (!data.name?.trim()) {
    throw new Error(
      "Competition name is required"
    );
  }

  if (
    !["open_play", "tournament"].includes(
      data.type
    )
  ) {
    throw new Error(
      "Invalid competition type"
    );
  }

  if (!data.startAt) {
    throw new Error(
      "Competition start date is required"
    );
  }

  if (
    !Number.isInteger(data.createdBy) ||
    data.createdBy <= 0
  ) {
    throw new Error(
      "Valid createdBy is required"
    );
  }

  if (
    data.endAt &&
    new Date(data.endAt) <
      new Date(data.startAt)
  ) {
    throw new Error(
      "End date cannot be before start date"
    );
  }

  if (
    data.registrationStartAt &&
    data.registrationEndAt &&
    new Date(data.registrationEndAt) <
      new Date(data.registrationStartAt)
  ) {
    throw new Error(
      "Registration end date cannot be before registration start date"
    );
  }

  return createCompetition(data);
}

// ==================================================
// UPDATE
// ==================================================

export async function editCompetition(
  id: number,
  data: UpdateCompetitionInput
) {
  const competition =
    await findCompetitionById(id);

  if (!competition) {
    throw new Error(
      "Competition not found"
    );
  }

  if (
    data.type &&
    !["open_play", "tournament"].includes(
      data.type
    )
  ) {
    throw new Error(
      "Invalid competition type"
    );
  }

  if (
    data.status &&
    ![
      "draft",
      "published",
      "registration_open",
      "registration_closed",
      "in_progress",
      "completed",
      "cancelled",
    ].includes(data.status)
  ) {
    throw new Error(
      "Invalid competition status"
    );
  }

  return updateCompetition(
    id,
    data
  );
}