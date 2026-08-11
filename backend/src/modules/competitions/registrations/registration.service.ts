import db from "../../../config/database";

import {
  countActiveRegistrations,
  createRegistration,
  findRegistration,
  findRegistrationById,
  findRegistrationsByDivisionId,
  updateRegistrationStatus,
  updatePaymentStatus,
} from "./registration.repository";

import {
  findDivisionById,
} from "../divisions/division.repository";

import {
  findCompetitionById,
} from "../competition.repository";

import {
  createCompetitionPlayer,
  findByCustomerId,
  findCompetitionPlayerById,
} from "../players/player.repository";

import {
  RegistrationStatus,
  UpdateRegistrationInput,
  PaymentStatus,
} from "./registration.types";

// ==================================================
// VALID STATUSES
// ==================================================

const VALID_STATUSES: RegistrationStatus[] = [
  "pending",
  "confirmed",
  "waitlisted",
  "cancelled",
];

// ==================================================
// VALID SKILL LEVELS
// ==================================================

const VALID_SKILL_LEVELS = [
  "beginner",
  "novice",
  "intermediate",
] as const;

// ==================================================
// REGISTER PLAYER
// ADMIN / EXISTING PLAYER
// ==================================================

export async function registerPlayer(
  competitionDivisionId: number,
  competitionPlayerId: number
) {
  // ----------------------------------------------
  // 1. Check division
  // ----------------------------------------------

  const division =
    await findDivisionById(
      competitionDivisionId
    );

  if (!division) {
    throw new Error(
      "Competition division not found"
    );
  }

  // ----------------------------------------------
  // 2. Check competition
  // ----------------------------------------------

  const competition =
    await findCompetitionById(
      division.competition_id
    );

  if (!competition) {
    throw new Error(
      "Competition not found"
    );
  }

  // ----------------------------------------------
  // 3. Competition status
  // ----------------------------------------------

  if (
    competition.status !==
    "registration_open"
  ) {
    throw new Error(
      "Competition registration is currently closed"
    );
  }

  // ----------------------------------------------
  // 4. Check player
  // ----------------------------------------------

  const player =
    await findCompetitionPlayerById(
      competitionPlayerId
    );

  if (!player) {
    throw new Error(
      "Competition player not found"
    );
  }

  // ----------------------------------------------
  // 5. Player active
  // ----------------------------------------------

  if (
    player.status !== "active"
  ) {
    throw new Error(
      "Competition player is inactive"
    );
  }

  // ----------------------------------------------
  // 6. Skill level
  // ----------------------------------------------

  if (
    player.skill_level !==
    division.skill_level
  ) {
    throw new Error(
      `Player skill level (${player.skill_level}) does not match division skill level (${division.skill_level})`
    );
  }

  // ----------------------------------------------
  // 7. Division open
  // ----------------------------------------------

  if (
    division.status !== "open"
  ) {
    throw new Error(
      "This division is not open for registration"
    );
  }

  // ----------------------------------------------
  // 8. Duplicate registration
  // ----------------------------------------------

  const existing =
    await findRegistration(
      competitionDivisionId,
      competitionPlayerId
    );

  if (existing) {
    if (
      existing.status === "cancelled"
    ) {
      throw new Error(
        "Player already has a cancelled registration for this division"
      );
    }

    throw new Error(
      "Player is already registered in this division"
    );
  }

  // ----------------------------------------------
  // 9. Capacity
  // ----------------------------------------------

  if (
    division.max_players !== null &&
    division.max_players !== undefined
  ) {
    const registeredCount =
      await countActiveRegistrations(
        competitionDivisionId
      );

    if (
      registeredCount >=
      Number(division.max_players)
    ) {
      throw new Error(
        "This division is already full"
      );
    }
  }

  // ----------------------------------------------
  // 10. Create
  // ----------------------------------------------

  return createRegistration(
    competitionDivisionId,
    competitionPlayerId
  );
}

// ==================================================
// PUBLIC PLAYER REGISTRATION
// ==================================================

export async function registerPublicPlayer(
  data: {
    divisionId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    skillLevel: string;

    paymentMethod: "GCASH";
    paymentProofUrl: string;
  }
) {
  // ----------------------------------------------
  // 1. Validate skill level
  // ----------------------------------------------

  if (
    !VALID_SKILL_LEVELS.includes(
      data.skillLevel as any
    )
  ) {
    throw new Error(
      "Invalid skill level"
    );
  }

  // ----------------------------------------------
  // 2. Validate payment method
  // ----------------------------------------------

  if (
    data.paymentMethod !== "GCASH"
  ) {
    throw new Error(
      "Only GCash payment is supported"
    );
  }

  // ----------------------------------------------
  // 3. Validate payment proof
  // ----------------------------------------------

  if (
    !data.paymentProofUrl ||
    !data.paymentProofUrl.trim()
  ) {
    throw new Error(
      "GCash payment proof is required"
    );
  }

  // ----------------------------------------------
  // 4. Find division
  // ----------------------------------------------

  const division =
    await findDivisionById(
      data.divisionId
    );

  if (!division) {
    throw new Error(
      "Competition division not found"
    );
  }

  // ----------------------------------------------
  // 5. Find competition
  // ----------------------------------------------

  const competition =
    await findCompetitionById(
      division.competition_id
    );

  if (!competition) {
    throw new Error(
      "Competition not found"
    );
  }

  // ----------------------------------------------
  // 6. Competition must be open
  // ----------------------------------------------

  if (
    competition.status !==
    "registration_open"
  ) {
    throw new Error(
      "Competition registration is currently closed"
    );
  }

  // ----------------------------------------------
  // 7. Division must be open
  // ----------------------------------------------

  if (
    division.status !== "open"
  ) {
    throw new Error(
      "This division is not open for registration"
    );
  }

  // ----------------------------------------------
  // 8. Skill level must match
  // ----------------------------------------------

  if (
    data.skillLevel !==
    division.skill_level
  ) {
    throw new Error(
      `Player skill level (${data.skillLevel}) does not match division skill level (${division.skill_level})`
    );
  }

  // ----------------------------------------------
  // 9. Check division capacity
  // ----------------------------------------------

  if (
    division.max_players !== null &&
    division.max_players !== undefined
  ) {
    const registeredCount =
      await countActiveRegistrations(
        data.divisionId
      );

    if (
      registeredCount >=
      Number(division.max_players)
    ) {
      throw new Error(
        "This division is already full"
      );
    }
  }

  // ----------------------------------------------
  // 10. Normalize email
  // ----------------------------------------------

  const email =
    data.email
      .trim()
      .toLowerCase();

  // ----------------------------------------------
  // 11. Find existing customer
  // ----------------------------------------------

  const [customerRows] =
    await db.execute(
      `
      SELECT
        id,
        uuid,
        customer_no,
        first_name,
        last_name,
        email,
        phone,
        status

      FROM customers

      WHERE LOWER(email) = ?

      LIMIT 1
      `,
      [email]
    );

  let customer =
    (customerRows as any[])[0] ??
    null;

  // ----------------------------------------------
  // 12. Create customer if needed
  // ----------------------------------------------

  if (!customer) {
    const customerUuid =
      crypto.randomUUID();

    const customerNo =
      `CUS-${Date.now()}`;

    const [result]: any =
      await db.execute(
        `
        INSERT INTO customers (
          uuid,
          customer_no,
          first_name,
          last_name,
          email,
          phone,
          status
        )

        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          'Active'
        )
        `,
        [
          customerUuid,
          customerNo,
          data.firstName.trim(),
          data.lastName.trim(),
          email,
          data.phone ?? null,
        ]
      );

    const [newCustomerRows] =
      await db.execute(
        `
        SELECT
          id,
          uuid,
          customer_no,
          first_name,
          last_name,
          email,
          phone,
          status

        FROM customers

        WHERE id = ?

        LIMIT 1
        `,
        [result.insertId]
      );

    customer =
      (newCustomerRows as any[])[0] ??
      null;
  }

  if (!customer) {
    throw new Error(
      "Failed to create customer"
    );
  }

  // ----------------------------------------------
  // 13. Find competition player
  // ----------------------------------------------

  let competitionPlayer =
    await findByCustomerId(
      Number(customer.id)
    );

  // ----------------------------------------------
  // 14. Create competition player
  // ----------------------------------------------

  if (!competitionPlayer) {
    competitionPlayer =
      await createCompetitionPlayer({
        customerId:
          Number(customer.id),

        skillLevel:
          data.skillLevel as
            | "beginner"
            | "novice"
            | "intermediate",
      });
  }

  if (!competitionPlayer) {
    throw new Error(
      "Failed to create competition player"
    );
  }

  // ----------------------------------------------
  // 15. Player must be active
  // ----------------------------------------------

  if (
    competitionPlayer.status !==
    "active"
  ) {
    throw new Error(
      "Competition player is inactive"
    );
  }

  // ----------------------------------------------
  // 16. Skill must match
  // ----------------------------------------------

  if (
    competitionPlayer.skill_level !==
    division.skill_level
  ) {
    throw new Error(
      `Player skill level (${competitionPlayer.skill_level}) does not match division skill level (${division.skill_level})`
    );
  }

  // ----------------------------------------------
  // 17. Check duplicate registration
  // ----------------------------------------------

  const existing =
    await findRegistration(
      data.divisionId,
      Number(competitionPlayer.id)
    );

  if (existing) {
    if (
      existing.status === "cancelled"
    ) {
      throw new Error(
        "You already registered for this division before and cancelled that registration"
      );
    }

    throw new Error(
      "You are already registered in this division"
    );
  }

  // ----------------------------------------------
  // 18. Create registration
  // ----------------------------------------------

  const registration =
    await createRegistration(
      data.divisionId,
      Number(competitionPlayer.id),

      data.paymentMethod,

      Number(
        division.entry_fee
      ),

      data.paymentProofUrl
    );

  // ----------------------------------------------
  // 19. Return
  // ----------------------------------------------

  return {
    registration,

    player: {
      id: competitionPlayer.id,

      customerId:
        customer.id,

      firstName:
        customer.first_name,

      lastName:
        customer.last_name,

      email:
        customer.email,

      phone:
        customer.phone,

      skillLevel:
        competitionPlayer.skill_level,
    },

    competition: {
      id: competition.id,
      name: competition.name,
    },

    division: {
      id: division.id,

      name: division.name,

      skillLevel:
        division.skill_level,

      format:
        division.format,

      entryFee:
        Number(
          division.entry_fee
        ),
    },

    payment: {
      method: data.paymentMethod,

      amount:
        Number(
          division.entry_fee
        ),

      status: "pending",

      proofUrl:
        data.paymentProofUrl,
    },
  };
}

// ==================================================
// GET ONE REGISTRATION
// ==================================================

export async function getRegistration(
  id: number
) {
  const registration =
    await findRegistrationById(id);

  if (!registration) {
    throw new Error(
      "Registration not found"
    );
  }

  return registration;
}

// ==================================================
// GET REGISTRATIONS BY DIVISION
// ==================================================

export async function getDivisionRegistrations(
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

  return findRegistrationsByDivisionId(
    competitionDivisionId
  );
}

// ==================================================
// UPDATE REGISTRATION STATUS
// ==================================================

export async function updateRegistration(
  id: number,
  data: UpdateRegistrationInput
) {
  const registration =
    await findRegistrationById(id);

  if (!registration) {
    throw new Error(
      "Registration not found"
    );
  }

  // ----------------------------------------------
  // Validate status
  // ----------------------------------------------

  if (
    !VALID_STATUSES.includes(
      data.status
    )
  ) {
    throw new Error(
      "Invalid registration status"
    );
  }

  // ----------------------------------------------
  // Same status
  // ----------------------------------------------

  if (
    registration.status ===
    data.status
  ) {
    return registration;
  }

  // ----------------------------------------------
  // Cancelled cannot reactivate
  // ----------------------------------------------

  if (
    registration.status ===
      "cancelled" &&
    data.status !== "cancelled"
  ) {
    throw new Error(
      "Cancelled registration cannot be reactivated"
    );
  }

  // ----------------------------------------------
  // Confirm registration
  // ----------------------------------------------

 // ----------------------------------------------
// Confirm registration
// ----------------------------------------------

if (
  data.status === "confirmed"
) {
  // --------------------------------------------
  // Payment proof required
  // --------------------------------------------

  if (
    !registration.payment_proof_url
  ) {
    throw new Error(
      "Cannot confirm registration without payment proof"
    );
  }

  // --------------------------------------------
  // Payment must be verified
  // --------------------------------------------

  if (
    registration.payment_status !==
    "confirmed"
  ) {
    throw new Error(
      "Payment must be verified before confirming registration"
    );
  }

  // --------------------------------------------
  // Division
  // --------------------------------------------

  const division =
    await findDivisionById(
      registration.competition_division_id
    );

  if (!division) {
    throw new Error(
      "Competition division not found"
    );
  }

  // --------------------------------------------
  // Division must be open
  // --------------------------------------------

  if (
    division.status !== "open"
  ) {
    throw new Error(
      "This division is not open"
    );
  }

  // --------------------------------------------
  // Capacity
  // --------------------------------------------

  if (
    division.max_players !== null &&
    division.max_players !== undefined
  ) {
    const total =
      await countActiveRegistrations(
        registration.competition_division_id
      );

    if (
      registration.status !==
        "confirmed" &&
      total >=
        Number(division.max_players)
    ) {
      throw new Error(
        "This division is already full"
      );
    }
  }
}

  // ----------------------------------------------
  // Update
  // ----------------------------------------------

  return updateRegistrationStatus(
    id,
    data.status
  );
}

// ==================================================
// CANCEL REGISTRATION
// ==================================================

export async function cancelRegistration(
  id: number
) {
  return updateRegistration(
    id,
    {
      status: "cancelled",
    }
  );
}

// ==================================================
// VERIFY PAYMENT
// ==================================================

export async function verifyRegistrationPayment(
  id: number,
  paymentStatus: PaymentStatus
) {
  // ----------------------------------------------
  // 1. Find registration
  // ----------------------------------------------

  const registration =
    await findRegistrationById(id);

  if (!registration) {
    throw new Error(
      "Registration not found"
    );
  }

  // ----------------------------------------------
  // 2. Validate payment status
  // ----------------------------------------------

  if (
    ![
      "pending",
      "confirmed",
      "rejected",
    ].includes(paymentStatus)
  ) {
    throw new Error(
      "Invalid payment status"
    );
  }

  // ----------------------------------------------
  // 3. Payment proof is required
  // ----------------------------------------------

  if (
    !registration.payment_proof_url
  ) {
    throw new Error(
      "Cannot verify payment because payment proof is missing"
    );
  }

  // ----------------------------------------------
  // 4. Prevent changing confirmed payment
  // ----------------------------------------------

  if (
    registration.payment_status ===
      "confirmed" &&
    paymentStatus !== "confirmed"
  ) {
    throw new Error(
      "Confirmed payment cannot be changed"
    );
  }

  // ----------------------------------------------
  // 5. Update payment
  // ----------------------------------------------

  return updatePaymentStatus(
    id,
    paymentStatus
  );
}