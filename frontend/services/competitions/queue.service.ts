import api from "@/lib/api";

// ==================================================
// TYPES
// ==================================================

export type QueueStatus =
  | "waiting"
  | "matched"
  | "called"
  | "playing"
  | "completed"
  | "removed";

export interface QueuePlayer {
  id: number;

  competition_session_id: number;

  competition_checkin_id: number;

  queue_position: number;

  status: QueueStatus;

  joined_at: string;

  called_at: string | null;

  removed_at: string | null;

  competition_player_id?: number;

  customer_id?: number;

  customer_no?: string;

  first_name?: string;

  last_name?: string;

  email?: string;

  phone?: string;

  player_skill_level?: string;
}

export interface JoinQueueInput {
  competitionCheckinId: number;
}

export interface UpdateQueueStatusInput {
  status: QueueStatus;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ==================================================
// QUEUE SERVICE
// ==================================================

export const queueService = {
  // ==================================================
  // JOIN QUEUE
  // ==================================================

  async join(
    sessionId: number,
    competitionCheckinId: number
  ): Promise<QueuePlayer> {
    const response =
      await api.post<
        ApiResponse<QueuePlayer>
      >(
        `/competitions/sessions/${sessionId}/queue`,
        {
          competitionCheckinId,
        }
      );

    return response.data.data;
  },

  // ==================================================
  // GET COMPLETE QUEUE
  // ==================================================

  async getBySession(
    sessionId: number
  ): Promise<QueuePlayer[]> {
    const response =
      await api.get<
        ApiResponse<QueuePlayer[]>
      >(
        `/competitions/sessions/${sessionId}/queue`
      );

    return response.data.data;
  },

  // ==================================================
  // GET WAITING
  // ==================================================

  async getWaiting(
    sessionId: number,
    limit = 4
  ): Promise<QueuePlayer[]> {
    const response =
      await api.get<
        ApiResponse<QueuePlayer[]>
      >(
        `/competitions/sessions/${sessionId}/queue/waiting`,
        {
          params: {
            limit,
          },
        }
      );

    return response.data.data;
  },

  // ==================================================
  // GET ONE
  // ==================================================

  async getById(
    queueId: number
  ): Promise<QueuePlayer> {
    const response =
      await api.get<
        ApiResponse<QueuePlayer>
      >(
        `/competitions/queue/${queueId}`
      );

    return response.data.data;
  },

  // ==================================================
  // UPDATE STATUS
  // ==================================================

  async updateStatus(
    queueId: number,
    status: QueueStatus
  ): Promise<QueuePlayer> {
    const response =
      await api.patch<
        ApiResponse<QueuePlayer>
      >(
        `/competitions/queue/${queueId}`,
        {
          status,
        }
      );

    return response.data.data;
  },

  // ==================================================
  // REMOVE
  // ==================================================

  async remove(
    queueId: number
  ): Promise<QueuePlayer> {
    const response =
      await api.patch<
        ApiResponse<QueuePlayer>
      >(
        `/competitions/queue/${queueId}/remove`
      );

    return response.data.data;
  },
};