import { z } from "zod";

// =====================================================
// CREATE ONLINE RESERVATION
// =====================================================

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

  // =====================================================
  // CUSTOMER INFORMATION
  // =====================================================

  // REQUIRED
  guest_name: z
    .string()
    .trim()
    .min(2, "Customer name is required.")
    .max(150),

  // OPTIONAL
  // Empty string is allowed.
  // If provided, it must be a valid email address.
  guest_email: z
    .string()
    .trim()
    .email("Invalid email address.")
    .max(150)
    .optional()
    .or(z.literal("")),

  // REQUIRED
  guest_phone: z
    .string()
    .trim()
    .min(7, "Customer phone is required.")
    .max(30),

  // OPTIONAL
  remarks: z
    .string()
    .trim()
    .max(500)
    .optional(),
});

// =====================================================
// WALK-IN RESERVATION
// =====================================================

export const createWalkInReservationSchema = z.object({
  customer_id: z
    .number()
    .int()
    .positive(),

  court_id: z
    .number()
    .int()
    .positive(),

  reservation_date: z
    .string()
    .min(1, "Reservation date is required."),

  start_time: z
    .string()
    .min(1, "Start time is required."),

  end_time: z
    .string()
    .min(1, "End time is required."),

  guest_name: z
    .string()
    .trim()
    .optional(),

  guest_email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal("")),

  guest_phone: z
    .string()
    .trim()
    .optional(),

  remarks: z
    .string()
    .trim()
    .optional(),
});

// =====================================================
// UPDATE RESERVATION
// =====================================================

export const updateReservationSchema = z.object({
  reservation_status: z.enum([
    "Pending",
    "Confirmed",
    "Cancelled",
    "Completed",
  ]),

  payment_status: z.enum([
    "Unpaid",
    "Partial",
    "Paid",
  ]),
});

// =====================================================
// TYPES
// IMPORTANT: THESE MUST BE EXPORTED
// =====================================================

export type CreateReservationInput =
  z.infer<typeof createReservationSchema>;

export type CreateWalkInReservationInput =
  z.infer<typeof createWalkInReservationSchema>;

export type UpdateReservationInput =
  z.infer<typeof updateReservationSchema>;