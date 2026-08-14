import { z } from "zod";

// ==================================================
// COURT ALLOCATION TYPES
// ==================================================

export type CourtAllocationType =
  | "open_play"
  | "tournament";

export type CourtAllocationStatus =
  | "reserved"
  | "released"
  | "cancelled";

// ==================================================
// CREATE VALIDATION
// ==================================================

export const createCourtAllocationSchema =
  z.object({
    competition_division_id: z.coerce
      .number()
      .int()
      .positive(
        "Competition division is required."
      ),

    court_id: z.coerce
      .number()
      .int()
      .positive(
        "Court is required."
      ),

    allocation_date: z
      .string()
      .min(
        1,
        "Allocation date is required."
      ),

    start_time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Invalid start time. Use HH:mm."
      ),

    end_time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Invalid end time. Use HH:mm."
      ),

    allocation_type: z.enum([
      "open_play",
      "tournament",
    ]),
  });

// ==================================================
// UPDATE VALIDATION
// ==================================================

export const updateCourtAllocationSchema =
  z.object({
    start_time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Invalid start time. Use HH:mm."
      )
      .optional(),

    end_time: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Invalid end time. Use HH:mm."
      )
      .optional(),

    status: z
      .enum([
        "reserved",
        "released",
        "cancelled",
      ])
      .optional(),
  });

// ==================================================
// DATABASE / SERVICE INPUT
// ==================================================
//
// competition_id is NOT accepted from req.body.
// The controller gets it from req.params.competitionId.
//
// Therefore:
// 1. Zod validates the body.
// 2. Controller adds competition_id.
// 3. Service/repository receives the complete object.
//

export type CreateCourtAllocationInput =
  z.infer<
    typeof createCourtAllocationSchema
  > & {
    competition_id: number;
  };

export type UpdateCourtAllocationInput =
  z.infer<
    typeof updateCourtAllocationSchema
  >;

// ==================================================
// COURT ALLOCATION RESPONSE
// ==================================================

export interface CourtAllocation {
  id: number;

  competition_id: number;

  competition_division_id: number;

  court_id: number;

  allocation_date: string;

  start_time: string;

  end_time: string;

  allocation_type: CourtAllocationType;

  status: CourtAllocationStatus;

  created_at: Date;

  updated_at: Date;
}