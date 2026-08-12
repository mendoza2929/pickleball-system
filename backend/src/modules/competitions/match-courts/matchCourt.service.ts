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

import {
  timeToMinutes,
} from "../../../shared/utils/time";


// ==================================================
// AVAILABILITY SERVICE
// ==================================================

const availabilityService =
  new AvailabilityService();


// ==================================================
// APPLICATION TIMEZONE
// ==================================================

const APP_TIMEZONE =
  process.env.APP_TIMEZONE ||
  "Asia/Manila";


// ==================================================
// CURRENT DATE
// ==================================================

function getCurrentDate(): string {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          APP_TIMEZONE,

        year: "numeric",

        month: "2-digit",

        day: "2-digit",
      }
    );

  return formatter.format(
    new Date()
  );
}


// ==================================================
// CURRENT TIME
// ==================================================

function getCurrentTime(): string {
  const formatter =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone:
          APP_TIMEZONE,

        hour: "2-digit",

        minute: "2-digit",

        hour12: false,
      }
    );

  return formatter.format(
    new Date()
  );
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
// FIND AVAILABLE COURT
// ==================================================

export async function findAvailableCourt(
  reservationDate: string,
  startTime: string
) {
  // -----------------------------------------------
  // Get all available courts
  // -----------------------------------------------

  const courts =
    await availabilityService
      .getAvailableCourts();

  if (
    !courts ||
    courts.length === 0
  ) {
    console.log(
      "[Open Play] No courts with Available status"
    );

    return null;
  }

  // -----------------------------------------------
  // Convert current time to minutes
  // -----------------------------------------------

  const currentMinutes =
    timeToMinutes(
      startTime
    );

  console.log(
    "[Open Play] Searching courts",
    {
      reservationDate,
      startTime,
      currentMinutes,
      timezone:
        APP_TIMEZONE,
      courtCount:
        courts.length,
    }
  );

  // -----------------------------------------------
  // Check each court
  // -----------------------------------------------

  for (
    const court of courts
  ) {
    const courtId =
      Number(court.id);

    if (
      !Number.isInteger(
        courtId
      ) ||
      courtId <= 0
    ) {
      continue;
    }

    try {
      // -------------------------------------------
      // Get complete availability
      // -------------------------------------------

      const availability =
        await availabilityService
          .getAvailability(
            courtId,
            reservationDate
          );

      if (
        !availability ||
        !Array.isArray(
          availability.slots
        )
      ) {
        continue;
      }

      // -------------------------------------------
      // Find slot containing current time
      //
      // Example:
      //
      // current = 10:38
      // slot    = 10:00 - 11:00
      //
      // 10:00 <= 10:38 < 11:00
      // -------------------------------------------

      const currentSlot =
        availability.slots.find(
          (slot: any) => {
            if (
              !slot ||
              !slot.start ||
              !slot.end
            ) {
              return false;
            }

            const slotStart =
              timeToMinutes(
                slot.start
              );

            const slotEnd =
              timeToMinutes(
                slot.end
              );

            return (
              slotStart <=
                currentMinutes &&
              currentMinutes <
                slotEnd &&
              slot.available === true
            );
          }
        );

      console.log(
        `[Open Play] Court ${courtId}`,
        {
          name: court.name,
          currentTime:
            startTime,
          currentSlot,
        }
      );

      // -------------------------------------------
      // Court found
      // -------------------------------------------

      if (currentSlot) {
        return court;
      }

    } catch (error) {
      console.error(
        `[Open Play] Failed checking court ${courtId}`,
        error
      );

      continue;
    }
  }

  console.log(
    "[Open Play] No court available for current time"
  );

  return null;
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
    match.court_id !== null &&
    match.court_id !== undefined
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
      Number(
        match.competition_session_id
      )
    );

  if (!session) {
    throw new Error(
      "Open Play session not found"
    );
  }

  // -----------------------------------------------
  // 5. Session must be live
  // -----------------------------------------------

  if (
    session.status !== "live"
  ) {
    throw new Error(
      "Open Play session is not live"
    );
  }

  // -----------------------------------------------
  // 6. Current Philippines date/time
  // -----------------------------------------------

  const reservationDate =
    getCurrentDate();

  const currentTime =
    getCurrentTime();

  console.log(
    "[Open Play] Assign court",
    {
      matchId,
      reservationDate,
      currentTime,
      timezone:
        APP_TIMEZONE,
    }
  );

  // -----------------------------------------------
  // 7. Find available court
  // -----------------------------------------------

  const court =
    await findAvailableCourt(
      reservationDate,
      currentTime
    );

  // -----------------------------------------------
  // 8. No court
  // -----------------------------------------------

  if (!court) {
    console.log(
      "[Open Play] No available court",
      {
        matchId,
        reservationDate,
        currentTime,
      }
    );

    // Keep match pending.
    return findMatchForAssignment(
      matchId
    );
  }

  // -----------------------------------------------
  // 9. Court ID
  // -----------------------------------------------

  const courtId =
    Number(court.id);

  // -----------------------------------------------
  // 10. Verify court exists
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

  // -----------------------------------------------
  // 11. Verify status
  // -----------------------------------------------

  if (
    currentCourt.status !==
    "Available"
  ) {
    throw new Error(
      "Selected court is no longer available"
    );
  }

  // -----------------------------------------------
  // 12. Check Open Play usage
  // -----------------------------------------------

  await ensureCourtIsFree(
    courtId,
    matchId
  );

  // -----------------------------------------------
  // 13. Verify availability again
  // -----------------------------------------------

  const availability =
    await availabilityService
      .getAvailability(
        courtId,
        reservationDate
      );

  const currentMinutes =
    timeToMinutes(
      currentTime
    );

  const currentSlot =
    availability.slots.find(
      (slot: any) => {
        if (
          !slot ||
          !slot.start ||
          !slot.end
        ) {
          return false;
        }

        const slotStart =
          timeToMinutes(
            slot.start
          );

        const slotEnd =
          timeToMinutes(
            slot.end
          );

        return (
          slotStart <=
            currentMinutes &&
          currentMinutes <
            slotEnd &&
          slot.available === true
        );
      }
    );

  if (!currentSlot) {
    throw new Error(
      "Selected court is no longer available"
    );
  }

  // -----------------------------------------------
  // 14. Assign
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

  console.log(
    "[Open Play] Court assigned successfully",
    {
      matchId,
      courtId,
      courtName:
        currentCourt.name,
      reservationDate,
      currentTime,
    }
  );

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
    match.court_id !== null &&
    match.court_id !== undefined
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
      Number(
        match.competition_session_id
      )
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
  // 6. Court
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
    court.status !==
    "Available"
  ) {
    throw new Error(
      "Court is not available"
    );
  }

  // -----------------------------------------------
  // 7. Check Open Play usage
  // -----------------------------------------------

  await ensureCourtIsFree(
    courtId,
    matchId
  );

  // -----------------------------------------------
  // 8. Current date/time
  // -----------------------------------------------

  const reservationDate =
    getCurrentDate();

  const currentTime =
    getCurrentTime();

  const currentMinutes =
    timeToMinutes(
      currentTime
    );

  // -----------------------------------------------
  // 9. Check availability
  // -----------------------------------------------

  const availability =
    await availabilityService
      .getAvailability(
        courtId,
        reservationDate
      );

  const currentSlot =
    availability.slots.find(
      (slot: any) => {
        if (
          !slot ||
          !slot.start ||
          !slot.end
        ) {
          return false;
        }

        const slotStart =
          timeToMinutes(
            slot.start
          );

        const slotEnd =
          timeToMinutes(
            slot.end
          );

        return (
          slotStart <=
            currentMinutes &&
          currentMinutes <
            slotEnd &&
          slot.available === true
        );
      }
    );

  if (!currentSlot) {
    throw new Error(
      "Selected court is not currently available"
    );
  }

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
// REMOVE COURT
// ==================================================

export async function unassignCourt(
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
  // 2. Cannot remove while playing
  // -----------------------------------------------

  if (
    match.status === "playing"
  ) {
    throw new Error(
      "Cannot remove court from a playing match"
    );
  }

  // -----------------------------------------------
  // 3. Completed is historical
  // -----------------------------------------------

  if (
    match.status === "completed"
  ) {
    throw new Error(
      "Completed match cannot be changed"
    );
  }

  // -----------------------------------------------
  // 4. Must have court
  // -----------------------------------------------

  if (
    match.court_id === null ||
    match.court_id === undefined
  ) {
    throw new Error(
      "Match does not have a court assigned"
    );
  }

  // -----------------------------------------------
  // 5. Remove
  // -----------------------------------------------

  return removeCourtFromMatch(
    matchId
  );
}