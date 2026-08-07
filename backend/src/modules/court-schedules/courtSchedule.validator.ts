import { z } from "zod";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const createCourtScheduleSchema = z.object({
  court_id: z.number().int().positive(),

  day_of_week: z.enum(days),

  open_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),

  close_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),

  is_closed: z.boolean().optional().default(false),
});

export const updateCourtScheduleSchema =
  createCourtScheduleSchema.partial();

export type CreateCourtScheduleInput = z.infer<
  typeof createCourtScheduleSchema
>;

export type UpdateCourtScheduleInput = z.infer<
  typeof updateCourtScheduleSchema
>;