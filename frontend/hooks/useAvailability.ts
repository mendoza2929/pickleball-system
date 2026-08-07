import { useQuery } from "@tanstack/react-query";

import { availabilityService } from "@/services/availability.service";

export function useAvailability(
  courtId: number | null,
  date: string | null
) {
  return useQuery({
    queryKey: [
      "availability",
      courtId,
      date,
    ],

    enabled:
      !!courtId &&
      !!date,

    queryFn: () =>
      availabilityService.getAvailability(
        courtId!,
        date!
      ),
  });
}