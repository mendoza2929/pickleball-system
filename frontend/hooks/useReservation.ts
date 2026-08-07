
import { useQuery } from "@tanstack/react-query";
import { reservationService } from "@/services/reservation.service";

export function useReservation(uuid: string) {
  return useQuery({
    queryKey: ["reservation", uuid],
    queryFn: () => reservationService.getByUuid(uuid),
    enabled: !!uuid,
  });
}