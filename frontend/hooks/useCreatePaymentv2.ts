import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

export interface CreatePaymentRequest {
  reservation_id: number;
  payment_method: "GCASH" | "PAY_LATER";
}

export interface CreatePaymentResponse {
  success: boolean;
  message: string;
  data?: {
    uuid: string;
    reservation_uuid: string;
    reservation_id: number;
    payment_method: string;
    gateway: string;
    amount: number;
    currency: string;
    status: string;
    checkout_url?: string | null;
    paid_at?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}

export function useCreatePayment() {
  return useMutation({
    mutationFn: async (
      data: CreatePaymentRequest
    ): Promise<CreatePaymentResponse> => {
      const response =
        await api.post<CreatePaymentResponse>(
          "/payments",
          data
        );

      return response.data;
    },
  });
}