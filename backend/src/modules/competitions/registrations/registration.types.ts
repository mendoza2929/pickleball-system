export type RegistrationStatus =
  | "pending"
  | "confirmed"
  | "waitlisted"
  | "cancelled";

export type PaymentMethod =
  | "GCASH";

export type PaymentStatus =
  | "pending"
  | "confirmed"
  | "rejected";

export interface CreateRegistrationInput {
  competitionDivisionId: number;
  competitionPlayerId: number;

  paymentMethod?: PaymentMethod;
  paymentAmount?: number;
  paymentProofUrl?: string | null;
  paymentReference?: string | null;
  paymentPaidAt?: Date | null;
}

export interface UpdateRegistrationInput {
  status: RegistrationStatus;
}

export interface UpdatePaymentInput {
  paymentStatus: PaymentStatus;
  paymentReference?: string | null;
}