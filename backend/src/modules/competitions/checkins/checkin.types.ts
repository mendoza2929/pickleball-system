export type CheckinStatus =
  | "checked_in"
  | "no_show"
  | "cancelled";

export interface CreateCheckinInput {
  competitionRegistrationId: number;
}

export interface UpdateCheckinInput {
  status: CheckinStatus;
}