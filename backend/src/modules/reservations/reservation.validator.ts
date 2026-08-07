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

  // Guest Information
  guest_name: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .optional(),

  guest_email: z
    .string()
    .email()
    .max(150)
    .optional(),

  guest_phone: z
    .string()
    .min(7)
    .max(30)
    .optional(),

  remarks: z
    .string()
    .max(500)
    .optional(),
});

export const updateReservationSchema =
  createReservationSchema.partial();

export type CreateReservationInput =
  z.infer<typeof createReservationSchema>;

export type UpdateReservationInput =
  z.infer<typeof updateReservationSchema>;