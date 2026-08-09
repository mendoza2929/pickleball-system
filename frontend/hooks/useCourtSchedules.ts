"use client";

import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getCourtSchedules,
  updateCourtSchedule,
  UpdateCourtSchedulePayload,
} from "@/lib/api/courtSchedules";

export function useCourtSchedules(
  courtId: number | null
) {
  const queryClient =
    useQueryClient();

  const query = useQuery({
    queryKey: [
      "court-schedules",
      courtId,
    ],

    enabled: !!courtId,

    queryFn: () =>
      getCourtSchedules(courtId!),
  });

  const updateSchedule = async (
    id: number,
    payload: UpdateCourtSchedulePayload
  ) => {
    const result =
      await updateCourtSchedule(
        id,
        payload
      );

    await queryClient.invalidateQueries({
      queryKey: [
        "court-schedules",
        courtId,
      ],
    });

    return result;
  };

  return {
    ...query,
    updateSchedule,
  };
}