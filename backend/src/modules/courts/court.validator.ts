import { z } from "zod";

// ============================================================
// COURT STATUS
// ============================================================

export const courtStatusSchema = z.enum([
  "Available",
  "Maintenance",
  "Inactive",
]);

// ============================================================
// CREATE COURT
// ============================================================

export const createCourtSchema = z.object({
  court_number: z
    .number()
    .int()
    .positive(
      "Court number must be greater than 0."
    ),

  name: z
    .string()
    .trim()
    .min(2, "Court name is required.")
    .max(100),

  description: z
    .string()
    .trim()
    .optional(),

  surface_type: z.enum([
    "Indoor",
    "Outdoor",
    "Synthetic",
    "Concrete",
  ]),

  hourly_rate: z
    .number()
    .min(
      0,
      "Hourly rate cannot be negative."
    ),
});

// ============================================================
// UPDATE COURT
// ============================================================

export const updateCourtSchema =
  createCourtSchema.partial().extend({
    status: courtStatusSchema.optional(),
  });

// ============================================================
// TYPES
// ============================================================

export type CreateCourtInput =
  z.infer<typeof createCourtSchema>;

export type UpdateCourtInput =
  z.infer<typeof updateCourtSchema>;