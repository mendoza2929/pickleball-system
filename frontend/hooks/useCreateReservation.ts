import { useMutation } from "@tanstack/react-query";

import {
  reservationService,
  CreateReservationRequest,
} from "@/services/reservation.service";

export function useCreateReservation() {
  return useMutation({
    mutationFn: (
      data: CreateReservationRequest
    ) =>
      reservationService.createReservation(
        data
      ),
  });
}