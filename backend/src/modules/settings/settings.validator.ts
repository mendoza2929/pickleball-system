import { z } from "zod";

// =====================================================
// GENERAL SETTINGS
// =====================================================

export const updateGeneralSettingsSchema =
  z.object({
    business_name: z
      .string()
      .trim()
      .min(
        2,
        "Business name is required."
      )
      .max(150),

    contact_number: z
      .string()
      .trim()
      .max(30)
      .optional()
      .or(z.literal("")),

    email: z
      .string()
      .trim()
      .email("Invalid email address.")
      .max(150)
      .optional()
      .or(z.literal("")),

    address: z
      .string()
      .trim()
      .max(255)
      .optional()
      .or(z.literal("")),
  });


// =====================================================
// BOOKING RULES
// =====================================================

export const updateBookingRulesSchema =
  z.object({
    min_booking_duration_hours:
      z.coerce
        .number()
        .positive()
        .max(24),

    max_booking_duration_hours:
      z.coerce
        .number()
        .positive()
        .max(24),

    booking_interval_minutes:
      z.coerce
        .number()
        .int()
        .positive()
        .max(120),

    advance_booking_days:
      z.coerce
        .number()
        .int()
        .nonnegative()
        .max(365),

    allow_same_day_booking:
      z.coerce.boolean(),

    allow_cancellation:
      z.coerce.boolean(),

    cancellation_deadline_hours:
      z.coerce
        .number()
        .nonnegative()
        .max(24),
  })
  .refine(
    (data) =>
      data.max_booking_duration_hours >=
      data.min_booking_duration_hours,
    {
      message:
        "Maximum booking duration must be greater than or equal to minimum duration.",
      path: [
        "max_booking_duration_hours",
      ],
    }
  );


  
// =====================================================
// NOTIFICATION SETTINGS
// =====================================================

export const updateNotificationSettingsSchema =
  z.object({

    // -------------------------------------------------
    // RESERVATIONS
    // -------------------------------------------------

    reservation_created_admin:
      z.boolean(),

    reservation_confirmed_customer:
      z.boolean(),

    reservation_cancelled_customer:
      z.boolean(),

    reservation_completed_customer:
      z.boolean(),


    // -------------------------------------------------
    // PAYMENTS
    // -------------------------------------------------

    payment_submitted_admin:
      z.boolean(),

    payment_approved_customer:
      z.boolean(),

    payment_rejected_customer:
      z.boolean(),

  });


// =====================================================
// TYPES
// =====================================================

export type UpdateGeneralSettingsInput =
  z.infer<
    typeof updateGeneralSettingsSchema
  >;

export type UpdateBookingRulesInput =
  z.infer<
    typeof updateBookingRulesSchema
  >;

export type UpdateNotificationSettingsInput =
  z.infer<
    typeof updateNotificationSettingsSchema
  >;