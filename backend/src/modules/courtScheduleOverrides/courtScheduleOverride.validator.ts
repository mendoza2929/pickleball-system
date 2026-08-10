import { z } from "zod";

// ============================================================
// DATE
// ============================================================

const dateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Date must be in YYYY-MM-DD format."
  );

// ============================================================
// TIME
// ============================================================

const timeSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
    "Time must be in HH:mm format."
  );

// ============================================================
// CREATE
// ============================================================

export const createCourtScheduleOverrideSchema =
  z
    .object({
      /**
       * null = applies to all courts
       */
      court_id: z
        .number()
        .int()
        .positive()
        .nullable(),

      schedule_date: dateSchema,

      open_time: timeSchema.nullable().optional(),

      close_time: timeSchema.nullable().optional(),

      is_closed: z.boolean(),

      reason: z
        .string()
        .trim()
        .max(255)
        .nullable()
        .optional(),
    })
    .superRefine((data, ctx) => {
      // ======================================================
      // CLOSED
      // ======================================================

      if (data.is_closed) {
        return;
      }

      // ======================================================
      // OPEN
      // ======================================================

      if (!data.open_time) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["open_time"],
          message:
            "Open time is required when the court is open.",
        });
      }

      if (!data.close_time) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["close_time"],
          message:
            "Close time is required when the court is open.",
        });
      }

      // ======================================================
      // TIME ORDER
      // ======================================================

      if (
        data.open_time &&
        data.close_time &&
        data.open_time >= data.close_time
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["close_time"],
          message:
            "Close time must be later than open time.",
        });
      }
    });

// ============================================================
// UPDATE
// ============================================================

export const updateCourtScheduleOverrideSchema =
  z
    .object({
      court_id: z
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),

      schedule_date: dateSchema.optional(),

      open_time: timeSchema.nullable().optional(),

      close_time: timeSchema.nullable().optional(),

      is_closed: z.boolean().optional(),

      reason: z
        .string()
        .trim()
        .max(255)
        .nullable()
        .optional(),
    })
    .superRefine((data, ctx) => {
      /**
       * We only validate the time relationship
       * when both values are provided.
       *
       * The service/repository will handle
       * the final state during update.
       */

      if (
        data.open_time &&
        data.close_time &&
        data.open_time >= data.close_time
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["close_time"],
          message:
            "Close time must be later than open time.",
        });
      }

      /**
       * If explicitly marked as open,
       * both times must be provided.
       */
      if (data.is_closed === false) {
        if (!data.open_time) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["open_time"],
            message:
              "Open time is required when the override is open.",
          });
        }

        if (!data.close_time) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["close_time"],
            message:
              "Close time is required when the override is open.",
          });
        }
      }
    });

// ============================================================
// TYPES
// ============================================================


export const createHolidaySchema =
  z.object({
    schedule_date: dateSchema,

    reason: z
      .string()
      .trim()
      .min(
        1,
        "Holiday reason is required."
      )
      .max(255),
  });

export type CreateHolidayInput =
  z.infer<
    typeof createHolidaySchema
  >;

export type CreateCourtScheduleOverrideInput =
  z.infer<
    typeof createCourtScheduleOverrideSchema
  >;

export type UpdateCourtScheduleOverrideInput =
  z.infer<
    typeof updateCourtScheduleOverrideSchema
  >;