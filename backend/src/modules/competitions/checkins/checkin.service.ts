import {
  createCheckin,
  findCheckinById,
  findCheckinByRegistrationId,
  findCheckinsByDivisionId,
  updateCheckinStatus,
} from "./checkin.repository";

import {
  findRegistrationById,
} from "../registrations/registration.repository";

import {
  findDivisionById,
} from "../divisions/division.repository";

import {
  CheckinStatus,
  UpdateCheckinInput,
} from "./checkin.types";

const VALID_STATUSES: CheckinStatus[] = [
  "checked_in",
  "no_show",
  "cancelled",
];

// --------------------------------------------------
// CHECK IN PLAYER
// --------------------------------------------------

export async function checkInPlayer(
  competitionRegistrationId: number
) {
  // -----------------------------------------------
  // 1. Find registration
  // -----------------------------------------------

  const registration =
    await findRegistrationById(
      competitionRegistrationId
    );

  if (!registration) {
    throw new Error(
      "Competition registration not found"
    );
  }

  // -----------------------------------------------
  // 2. Registration must be confirmed
  // -----------------------------------------------

  if (
    registration.status !== "confirmed"
  ) {
    throw new Error(
      "Only confirmed registrations can check in"
    );
  }

  // -----------------------------------------------
  // 3. Check existing check-in
  // -----------------------------------------------

  const existing =
    await findCheckinByRegistrationId(
      competitionRegistrationId
    );

  if (existing) {
    if (
      existing.status === "checked_in"
    ) {
      throw new Error(
        "Player is already checked in"
      );
    }

    throw new Error(
      "A check-in record already exists for this registration"
    );
  }

  // -----------------------------------------------
  // 4. Check division
  // -----------------------------------------------

  const division =
    await findDivisionById(
      registration.competition_division_id
    );

  if (!division) {
    throw new Error(
      "Competition division not found"
    );
  }

  // -----------------------------------------------
  // 5. Division must be open/in progress
  // -----------------------------------------------

  if (
    division.status !== "open" &&
    division.status !== "in_progress"
  ) {
    throw new Error(
      "This division is not available for check-in"
    );
  }

  // -----------------------------------------------
  // 6. Create check-in
  // -----------------------------------------------

  return createCheckin(
    competitionRegistrationId
  );
}

// --------------------------------------------------
// GET ONE
// --------------------------------------------------

export async function getCheckin(
  id: number
) {
  const checkin =
    await findCheckinById(id);

  if (!checkin) {
    throw new Error(
      "Check-in not found"
    );
  }

  return checkin;
}

// --------------------------------------------------
// GET CHECK-INS BY DIVISION
// --------------------------------------------------

export async function getDivisionCheckins(
  competitionDivisionId: number
) {
  const division =
    await findDivisionById(
      competitionDivisionId
    );

  if (!division) {
    throw new Error(
      "Competition division not found"
    );
  }

  return findCheckinsByDivisionId(
    competitionDivisionId
  );
}

// --------------------------------------------------
// UPDATE CHECK-IN
// --------------------------------------------------

export async function updateCheckin(
  id: number,
  data: UpdateCheckinInput
) {
  const checkin =
    await findCheckinById(id);

  if (!checkin) {
    throw new Error(
      "Check-in not found"
    );
  }

  // -----------------------------------------------
  // Validate status
  // -----------------------------------------------

  if (
    !VALID_STATUSES.includes(
      data.status
    )
  ) {
    throw new Error(
      "Invalid check-in status"
    );
  }

  // -----------------------------------------------
  // Same status
  // -----------------------------------------------

  if (
    checkin.status === data.status
  ) {
    return checkin;
  }

  // -----------------------------------------------
  // Update
  // -----------------------------------------------

  return updateCheckinStatus(
    id,
    data.status
  );
}

// --------------------------------------------------
// MARK NO SHOW
// --------------------------------------------------

export async function markNoShow(
  id: number
) {
  return updateCheckin(
    id,
    {
      status: "no_show",
    }
  );
}

// --------------------------------------------------
// CANCEL CHECK-IN
// --------------------------------------------------

export async function cancelCheckin(
  id: number
) {
  return updateCheckin(
    id,
    {
      status: "cancelled",
    }
  );
}