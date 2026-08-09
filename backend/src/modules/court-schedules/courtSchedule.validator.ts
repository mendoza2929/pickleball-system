import { z } from "zod";

// =====================================================
// DAYS
// =====================================================

const dayOfWeekSchema = z.enum([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

// =====================================================
// TIME
// =====================================================

const timeSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
    "Time must be in HH:mm format."
  );

// =====================================================
// UPDATE COURT SCHEDULE
// =====================================================

export const updateCourtScheduleSchema =
  z.object({
    day_of_week:
      dayOfWeekSchema,

    open_time:
      timeSchema.nullable(),

    close_time:
      timeSchema.nullable(),

    is_closed:
      z.boolean(),
  });

// =====================================================
// TYPE
// =====================================================

export type UpdateCourtScheduleInput =
  z.infer<
    typeof updateCourtScheduleSchema
  >;