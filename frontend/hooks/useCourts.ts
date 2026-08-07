import { useQuery } from "@tanstack/react-query";
import { courtService } from "@/services/court.service";

export function useCourts() {
  return useQuery({
    queryKey: ["courts"],
    queryFn: courtService.getAll,
  });
}