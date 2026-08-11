import { z } from "zod";

export const reportOverviewSchema = z.object({
  date_from: z
    .string()
    .date()
    .optional(),

  date_to: z
    .string()
    .date()
    .optional(),
});

export type ReportOverviewInput =
  z.infer<typeof reportOverviewSchema>;