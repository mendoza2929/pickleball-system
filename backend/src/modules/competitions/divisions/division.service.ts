import {
  findDivisionsByCompetitionId,
  findDivisionById,
  createDivision,
  updateDivision,
} from "./division.repository";

import {
  findCompetitionById,
} from "../competition.repository";

import {
  CreateDivisionInput,
  UpdateDivisionInput,
} from "./division.types";

// ==================================================
// GET ALL DIVISIONS
// ==================================================

export async function getDivisionsByCompetition(
  competitionId: number
) {
  const competition =
    await findCompetitionById(
      competitionId
    );

  if (!competition) {
    throw new Error(
      "Competition not found"
    );
  }

  return findDivisionsByCompetitionId(
    competitionId
  );
}

// ==================================================
// GET ONE DIVISION
// ==================================================

export async function getDivision(
  id: number
) {
  const division =
    await findDivisionById(id);

  if (!division) {
    throw new Error(
      "Competition division not found"
    );
  }

  return division;
}

// ==================================================
// CREATE DIVISION
// ==================================================

export async function createNewDivision(
  data: CreateDivisionInput
) {
  // ----------------------------------------------
  // Competition
  // ----------------------------------------------

  const competition =
    await findCompetitionById(
      data.competitionId
    );

  if (!competition) {
    throw new Error(
      "Competition not found"
    );
  }

  // ----------------------------------------------
  // Name
  // ----------------------------------------------

  if (!data.name?.trim()) {
    throw new Error(
      "Division name is required"
    );
  }

  // ----------------------------------------------
  // Skill level
  // ----------------------------------------------

  if (
    ![
      "beginner",
      "novice",
      "intermediate",
    ].includes(
      data.skillLevel
    )
  ) {
    throw new Error(
      "Invalid skill level"
    );
  }

  // ----------------------------------------------
  // Format
  // ----------------------------------------------

  if (
    ![
      "singles",
      "doubles",
    ].includes(
      data.format
    )
  ) {
    throw new Error(
      "Invalid division format"
    );
  }

  // ----------------------------------------------
  // Max players
  // ----------------------------------------------

  if (
    data.maxPlayers !==
      undefined &&
    data.maxPlayers !== null
  ) {
    if (
      !Number.isInteger(
        data.maxPlayers
      ) ||
      data.maxPlayers <= 0
    ) {
      throw new Error(
        "Max players must be a positive number"
      );
    }
  }

  // ----------------------------------------------
  // Entry fee
  // ----------------------------------------------

  if (
    data.entryFee !==
      undefined &&
    data.entryFee < 0
  ) {
    throw new Error(
      "Entry fee cannot be negative"
    );
  }

  // ----------------------------------------------
  // Status
  // ----------------------------------------------

  if (
    data.status &&
    ![
      "open",
      "closed",
      "in_progress",
      "completed",
    ].includes(
      data.status
    )
  ) {
    throw new Error(
      "Invalid division status"
    );
  }

  return createDivision(data);
}

// ==================================================
// UPDATE DIVISION
// ==================================================

export async function editDivision(
  id: number,
  data: UpdateDivisionInput
) {
  const division =
    await findDivisionById(id);

  if (!division) {
    throw new Error(
      "Competition division not found"
    );
  }

  // ----------------------------------------------
  // Name
  // ----------------------------------------------

  if (
    data.name !== undefined &&
    !data.name.trim()
  ) {
    throw new Error(
      "Division name cannot be empty"
    );
  }

  // ----------------------------------------------
  // Skill
  // ----------------------------------------------

  if (
    data.skillLevel &&
    ![
      "beginner",
      "novice",
      "intermediate",
    ].includes(
      data.skillLevel
    )
  ) {
    throw new Error(
      "Invalid skill level"
    );
  }

  // ----------------------------------------------
  // Format
  // ----------------------------------------------

  if (
    data.format &&
    ![
      "singles",
      "doubles",
    ].includes(
      data.format
    )
  ) {
    throw new Error(
      "Invalid division format"
    );
  }

  // ----------------------------------------------
  // Max players
  // ----------------------------------------------

  if (
    data.maxPlayers !==
      undefined &&
    data.maxPlayers !== null
  ) {
    if (
      !Number.isInteger(
        data.maxPlayers
      ) ||
      data.maxPlayers <= 0
    ) {
      throw new Error(
        "Max players must be a positive number"
      );
    }
  }

  // ----------------------------------------------
  // Entry fee
  // ----------------------------------------------

  if (
    data.entryFee !== undefined &&
    data.entryFee < 0
  ) {
    throw new Error(
      "Entry fee cannot be negative"
    );
  }

  // ----------------------------------------------
  // Status
  // ----------------------------------------------

  if (
    data.status &&
    ![
      "open",
      "closed",
      "in_progress",
      "completed",
    ].includes(
      data.status
    )
  ) {
    throw new Error(
      "Invalid division status"
    );
  }

  return updateDivision(
    id,
    data
  );
}