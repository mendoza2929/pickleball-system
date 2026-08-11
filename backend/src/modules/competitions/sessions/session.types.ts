export type SessionStatus =
  | "scheduled"
  | "live"
  | "paused"
  | "completed"
  | "cancelled";

export interface CreateSessionInput {
  competitionDivisionId: number;
}

export interface UpdateSessionInput {
  status: SessionStatus;
}