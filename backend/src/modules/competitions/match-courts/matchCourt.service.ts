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
  // ------------------------------------------------
  // Get all courts that are generally available
  // ------------------------------------------------

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

  // ------------------------------------------------
  // Check every available court
  // ------------------------------------------------

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
      // ----------------------------------------------
      // Get today's availability
      // ----------------------------------------------

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

      // ----------------------------------------------
      // Find current available slot
      // ----------------------------------------------

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

      // ----------------------------------------------
      // Court is currently available
      // ----------------------------------------------

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
  // ------------------------------------------------
  // 1. Get match
  // ------------------------------------------------

  const match =
    await findMatchForAssignment(
      matchId
    );

  if (!match) {
    throw new Error(
      "Match not found"
    );
  }

  // ------------------------------------------------
  // 2. Match must be pending
  // ------------------------------------------------

  if (
    match.status !== "pending"
  ) {
    throw new Error(
      `Match cannot be assigned a court while status is "${match.status}"`
    );
  }

  // ------------------------------------------------
  // 3. Match must not already have court
  // ------------------------------------------------

  if (
    match.court_id !== null &&
    match.court_id !== undefined
  ) {
    return match;
  }

  // ------------------------------------------------
  // 4. Get Open Play session
  // ------------------------------------------------

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

  // ------------------------------------------------
  // 5. Session must be live
  // ------------------------------------------------

  if (
    session.status !== "live"
  ) {
    throw new Error(
      "Open Play session is not live"
    );
  }

  // ------------------------------------------------
  // 6. Current Philippines date/time
  // ------------------------------------------------

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

  // ------------------------------------------------
  // 7. Find court
  // ------------------------------------------------

  const court =
    await findAvailableCourt(
      reservationDate,
      currentTime
    );

  // ------------------------------------------------
  // 8. No court
  //
  // Match remains pending.
  // ------------------------------------------------

  if (!court) {
    console.log(
      "[Open Play] No available court",
      {
        matchId,
        reservationDate,
        currentTime,
      }
    );

    return findMatchForAssignment(
      matchId
    );
  }

  // ------------------------------------------------
  // 9. Court ID
  // ------------------------------------------------

  const courtId =
    Number(court.id);

  if (
    !Number.isInteger(
      courtId
    ) ||
    courtId <= 0
  ) {
    throw new Error(
      "Invalid court selected"
    );
  }

  // ------------------------------------------------
  // 10. Verify court still exists
  // ------------------------------------------------

  const currentCourt =
    await findCourtById(
      courtId
    );

  if (!currentCourt) {
    throw new Error(
      "Selected court no longer exists"
    );
  }

  // ------------------------------------------------
  // 11. Verify court status
  // ------------------------------------------------

  if (
    currentCourt.status !==
    "Available"
  ) {
    console.log(
      "[Open Play] Court became unavailable",
      {
        courtId,
        matchId,
      }
    );

    return findMatchForAssignment(
      matchId
    );
  }

  // ------------------------------------------------
  // 12. Check active Open Play match
  // ------------------------------------------------

  await ensureCourtIsFree(
    courtId,
    matchId
  );

  // ------------------------------------------------
  // 13. Verify availability one more time
  // ------------------------------------------------

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
    throw new Error(
      "Unable to verify court availability"
    );
  }

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
    console.log(
      "[Open Play] Court is no longer available",
      {
        courtId,
        matchId,
      }
    );

    return findMatchForAssignment(
      matchId
    );
  }

  // ------------------------------------------------
  // 14. Assign court
  // ------------------------------------------------

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
  const match =
    await findMatchForAssignment(
      matchId
    );

  if (!match) {
    throw new Error(
      "Match not found"
    );
  }

  if (
    match.status !== "pending"
  ) {
    throw new Error(
      `Match cannot be assigned a court while status is "${match.status}"`
    );
  }

  if (
    match.court_id !== null &&
    match.court_id !== undefined
  ) {
    throw new Error(
      "A court is already assigned to this match"
    );
  }

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

  if (
    session.status !== "live"
  ) {
    throw new Error(
      "Open Play session is not live"
    );
  }

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

  await ensureCourtIsFree(
    courtId,
    matchId
  );

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

  if (
    !availability ||
    !Array.isArray(
      availability.slots
    )
  ) {
    throw new Error(
      "Unable to verify court availability"
    );
  }

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
      "Selected court is not currently available"
    );
  }

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

  if (
    match.status === "playing"
  ) {
    throw new Error(
      "Cannot remove court from a playing match"
    );
  }

  if (
    match.status === "completed"
  ) {
    throw new Error(
      "Completed match cannot be changed"
    );
  }

  if (
    match.court_id === null ||
    match.court_id === undefined
  ) {
    throw new Error(
      "Match does not have a court assigned"
    );
  }

  return removeCourtFromMatch(
    matchId
  );
}