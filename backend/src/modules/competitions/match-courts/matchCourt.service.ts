import {
  findCourtById,
  findMatchForAssignment,
  findActiveMatchByCourtId,
  assignCourtToMatch,
  removeCourtFromMatch,
} from "./matchCourt.repository";

import {
  findSessionById,
} from "../sessions/session.repository";

import {
  AvailabilityService,
} from "../../availability/availability.service";

const availabilityService =
  new AvailabilityService();

// ==================================================
// CURRENT DATE
// ==================================================

function getCurrentDate() {
  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ==================================================
// CURRENT TIME
// ==================================================

function getCurrentTime() {
  const now = new Date();

  const hours =
    String(
      now.getHours()
    ).padStart(2, "0");

  const minutes =
    String(
      now.getMinutes()
    ).padStart(2, "0");

  return `${hours}:${minutes}`;
}

// ==================================================
// CHECK COURT ACTIVE MATCH
// ==================================================

async function ensureCourtIsFree(
  courtId: number,
  matchId?: number
) {
  const activeMatch =
    await findActiveMatchByCourtId(
      courtId,
      matchId
    );

  if (activeMatch) {
    throw new Error(
      `Court is already assigned to match #${activeMatch.match_number}`
    );
  }
}

// ==================================================
// AUTO ASSIGN AVAILABLE COURT
// ==================================================

export async function assignAvailableCourt(
  matchId: number
) {
  // -----------------------------------------------
  // 1. Match
  // -----------------------------------------------

  const match =
    await findMatchForAssignment(
      matchId
    );

  if (!match) {
    throw new Error(
      "Match not found"
    );
  }

  // -----------------------------------------------
  // 2. Must be pending
  // -----------------------------------------------

  if (
    match.status !== "pending"
  ) {
    throw new Error(
      `Match cannot be assigned a court while status is "${match.status}"`
    );
  }

  // -----------------------------------------------
  // 3. No existing court
  // -----------------------------------------------

  if (
    match.court_id !== null
  ) {
    throw new Error(
      "A court is already assigned to this match"
    );
  }

  // -----------------------------------------------
  // 4. Session
  // -----------------------------------------------

  const session =
    await findSessionById(
      match.competition_session_id
    );

  if (!session) {
    throw new Error(
      "Open Play session not found"
    );
  }

  // -----------------------------------------------
  // 5. Session live
  // -----------------------------------------------

  if (
    session.status !== "live"
  ) {
    throw new Error(
      "Open Play session is not live"
    );
  }

  // -----------------------------------------------
  // 6. Current date/time
  // -----------------------------------------------

  const reservationDate =
    getCurrentDate();

  const currentTime =
    getCurrentTime();

  // -----------------------------------------------
  // 7. Find available court
  // -----------------------------------------------

  const court =
    await availabilityService
      .findAvailableCourt(
        reservationDate,
        currentTime
      );

  if (!court) {
    throw new Error(
      "No court is currently available for Open Play"
    );
  }

  const courtId =
    Number(court.id);

  // -----------------------------------------------
  // 8. Court exists
  // -----------------------------------------------

  const currentCourt =
    await findCourtById(
      courtId
    );

  if (!currentCourt) {
    throw new Error(
      "Selected court no longer exists"
    );
  }

  if (
    currentCourt.status !==
    "Available"
  ) {
    throw new Error(
      "Selected court is no longer available"
    );
  }

  // -----------------------------------------------
  // 9. Check Open Play match usage
  // -----------------------------------------------

  await ensureCourtIsFree(
    courtId,
    matchId
  );

  // -----------------------------------------------
  // 10. Assign
  // -----------------------------------------------

  const updatedMatch =
    await assignCourtToMatch(
      matchId,
      courtId
    );

  if (!updatedMatch) {
    throw new Error(
      "Failed to assign court"
    );
  }

  return updatedMatch;
}

// ==================================================
// MANUAL COURT ASSIGNMENT
// ==================================================

export async function assignCourt(
  matchId: number,
  courtId: number
) {
  // -----------------------------------------------
  // 1. Match
  // -----------------------------------------------

  const match =
    await findMatchForAssignment(
      matchId
    );

  if (!match) {
    throw new Error(
      "Match not found"
    );
  }

  // -----------------------------------------------
  // 2. Must be pending
  // -----------------------------------------------

  if (
    match.status !== "pending"
  ) {
    throw new Error(
      `Match cannot be assigned a court while status is "${match.status}"`
    );
  }

  // -----------------------------------------------
  // 3. No existing court
  // -----------------------------------------------

  if (
    match.court_id !== null
  ) {
    throw new Error(
      "A court is already assigned to this match"
    );
  }

  // -----------------------------------------------
  // 4. Session
  // -----------------------------------------------

  const session =
    await findSessionById(
      match.competition_session_id
    );

  if (!session) {
    throw new Error(
      "Open Play session not found"
    );
  }

  if (
    session.status !== "live"
  ) {
    throw new Error(
      "Open Play session is not live"
    );
  }

  // -----------------------------------------------
  // 5. Court
  // -----------------------------------------------

  const court =
    await findCourtById(
      courtId
    );

  if (!court) {
    throw new Error(
      "Court not found"
    );
  }

  if (
    court.status !== "Available"
  ) {
    throw new Error(
      "Court is not available"
    );
  }

  // -----------------------------------------------
  // 6. Check Open Play usage
  // -----------------------------------------------

  await ensureCourtIsFree(
    courtId,
    matchId
  );

  // -----------------------------------------------
  // 7. Check reservation availability
  // -----------------------------------------------

  const reservationDate =
    getCurrentDate();

  const currentTime =
    getCurrentTime();

  const availability =
    await availabilityService
      .getAvailability(
        courtId,
        reservationDate
      );

  const currentSlot =
    availability.slots.find(
      (slot: any) =>
        slot.start <=
          currentTime &&
        currentTime <
          slot.end
    );

  if (
    !currentSlot ||
    !currentSlot.available
  ) {
    throw new Error(
      "Selected court is not currently available"
    );
  }

  // -----------------------------------------------
  // 8. Assign
  // -----------------------------------------------

  return assignCourtToMatch(
    matchId,
    courtId
  );
}

// ==================================================
// REMOVE COURT
// ==================================================

export async function unassignCourt(
  matchId: number
) {
  const match =
    await findMatchForAssignment(
      matchId
    );

  if (!match) {
    throw new Error(
      "Match not found"
    );
  }

  // -----------------------------------------------
  // Cannot remove while playing
  // -----------------------------------------------

  if (
    match.status === "playing"
  ) {
    throw new Error(
      "Cannot remove court from a playing match"
    );
  }

  // -----------------------------------------------
  // Completed is historical
  // -----------------------------------------------

  if (
    match.status === "completed"
  ) {
    throw new Error(
      "Completed match cannot be changed"
    );
  }

  // -----------------------------------------------
  // Must have court
  // -----------------------------------------------

  if (
    match.court_id === null
  ) {
    throw new Error(
      "Match does not have a court assigned"
    );
  }

  return removeCourtFromMatch(
    matchId
  );
}