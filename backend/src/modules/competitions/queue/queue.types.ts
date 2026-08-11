// ==================================================
// QUEUE TYPES
// ==================================================

export type QueueStatus =
  | "waiting"
  | "matched"
  | "called"
  | "playing"
  | "completed"
  | "removed";

// ==================================================
// JOIN QUEUE
// ==================================================

export interface JoinQueueInput {
  competitionSessionId: number;
  competitionCheckinId: number;
}

// ==================================================
// UPDATE QUEUE STATUS
// ==================================================

export interface UpdateQueueStatusInput {
  status: QueueStatus;
}