export type CompetitionType =
  | "open_play"
  | "tournament";

export type CompetitionStatus =
  | "draft"
  | "published"
  | "registration_open"
  | "registration_closed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface CreateCompetitionInput {
  name: string;
  type: CompetitionType;

  startAt: string;

  endAt?: string | null;

  registrationStartAt?: string | null;

  registrationEndAt?: string | null;

  description?: string | null;

  createdBy: number;
}

export interface UpdateCompetitionInput {
  name?: string;

  type?: CompetitionType;

  status?: CompetitionStatus;

  startAt?: string;

  endAt?: string | null;

  registrationStartAt?: string | null;

  registrationEndAt?: string | null;

  description?: string | null;
}