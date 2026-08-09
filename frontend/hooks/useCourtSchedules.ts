import { useQuery } from "@tanstack/react-query";

import {
  getCourtSchedules,
} from "@/lib/api/courtSchedules";

export function useCourtSchedules(
  courtId: number | null
) {
  return useQuery({
    queryKey: [
      "court-schedules",
      courtId,
    ],

    enabled: !!courtId,

    queryFn: () =>
      getCourtSchedules(courtId!),
  });
}