import { z } from "zod";

// ==================================================
// CREATE
// ==================================================

export const createCourtAllocationSchema =
  z.object({
    competition_id: z
      .number()
      .int()
      .positive(),

    competition_division_id:
      z
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),

    court_id: z
      .number()
      .int()
      .positive(),

    allocation_date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Allocation date must be YYYY-MM-DD."
      ),

    start_time: z
      .string()
      .regex(
        /^\d{2}:\d{2}$/,
        "Start time must be HH:mm."
      ),

    end_time: z
      .string()
      .regex(
        /^\d{2}:\d{2}$/,
        "End time must be HH:mm."
      ),

    allocation_type: z
      .enum([
        "open_play",
        "tournament",
      ]),
  });

// ==================================================
// UPDATE
// ==================================================

export const updateCourtAllocationSchema =
  z.object({
    start_time: z
      .string()
      .regex(
        /^\d{2}:\d{2}$/,
        "Start time must be HH:mm."
      )
      .optional(),

    end_time: z
      .string()
      .regex(
        /^\d{2}:\d{2}$/,
        "End time must be HH:mm."
      )
      .optional(),

    status: z
      .enum([
        "reserved",
        "released",
      ])
      .optional(),
  });

// ==================================================
// TYPES
// ==================================================

export type CreateCourtAllocationInput =
  z.infer<
    typeof createCourtAllocationSchema
  >;

export type UpdateCourtAllocationInput =
  z.infer<
    typeof updateCourtAllocationSchema
  >;