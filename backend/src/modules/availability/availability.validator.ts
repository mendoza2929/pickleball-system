import { z } from "zod";

// =====================================================
// AVAILABILITY QUERY
// =====================================================

export const availabilityQuerySchema = z.object({
  courtId: z.coerce
    .number()
    .int()
    .positive(
      "Court ID must be a positive number."
    ),

  date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Date must be in YYYY-MM-DD format."
    ),
});

// =====================================================
// TYPE
// =====================================================

export type AvailabilityQueryInput =
  z.infer<typeof availabilityQuerySchema>;