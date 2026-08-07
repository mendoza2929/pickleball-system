import { z } from "zod";

export const createPaymentSchema = z.object({
    reservation_id: z.number().int().positive(),

    payment_method: z.enum([
        "Cash",
        "GCash",
        "Maya",
        "Credit Card",
    ]),
});

export type CreatePaymentInput =
    z.infer<typeof createPaymentSchema>;