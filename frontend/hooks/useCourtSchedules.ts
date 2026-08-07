import { useQuery } from "@tanstack/react-query";
import { courtScheduleService } from "../services/courtSchedule.service";

export function useCourtSchedules(
    courtId: number | null
) {
    return useQuery({
        queryKey: ["court-schedules", courtId],

        enabled: !!courtId,

        queryFn: () =>
            courtScheduleService.getByCourt(
                courtId!
            ),
    });
}