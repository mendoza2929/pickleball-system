import { z } from "zod";

export const updateProfileSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters."),

  last_name: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters."),

  phone: z
    .string()
    .trim()
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;