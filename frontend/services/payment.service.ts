import api from "@/lib/api";

export interface CreatePaymentRequest {
  reservation_id: number;
  payment_method: string;
}

export const paymentService = {
  async createPayment(
    data: CreatePaymentRequest
  ) {
    const response =
      await api.post(
        "/payments",
        data
      );

    return response.data;
  },

  async getByUuid(
    uuid: string
  ) {
    const response =
      await api.get(
        `/payments/uuid/${uuid}`
      );

    return response.data.data;
  },
};