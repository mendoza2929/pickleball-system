import { z } from "zod";

export const PAYMENT_METHOD = {
  GCASH: "GCASH",
} as const;

export const createPaymentSchema =
  z.object({
    reservation_id:
      z.number().int().positive(),

    payment_method:
      z.enum([
        PAYMENT_METHOD.GCASH,
      ]),
  });

export type CreatePaymentInput =
  z.infer<
    typeof createPaymentSchema
  >;