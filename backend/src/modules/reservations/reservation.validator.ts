import { z } from "zod";

export const createReservationSchema = z.object({
  court_id: z.coerce
    .number()
    .int()
    .positive(),

  reservation_date: z.string().date(),

  start_time: z.string().regex(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
    "Invalid time format. Use HH:mm"
  ),

  end_time: z.string().regex(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
    "Invalid time format. Use HH:mm"
  ),

  remarks: z.string().optional(),
});

export const updateReservationSchema = createReservationSchema.partial();

export type CreateReservationInput =
  z.infer<typeof createReservationSchema>;

export type UpdateReservationInput =
  z.infer<typeof updateReservationSchema>;