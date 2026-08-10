export interface CourtScheduleOverride {
  id: number;
  uuid: string;

  /**
   * Specific court.
   *
   * null = applies to all courts.
   */
  court_id: number | null;

  schedule_date: string;

  open_time: string | null;
  close_time: string | null;

  is_closed: boolean;

  reason: string | null;

  created_at: Date;
  updated_at: Date;
}

export interface CreateCourtScheduleOverrideInput {
  /**
   * null = applies to all courts.
   */
  court_id: number | null;

  schedule_date: string;

  open_time?: string | null;
  close_time?: string | null;

  is_closed: boolean;

  reason?: string | null;
}

export interface UpdateCourtScheduleOverrideInput {
  court_id?: number | null;

  schedule_date?: string;

  open_time?: string | null;
  close_time?: string | null;

  is_closed?: boolean;

  reason?: string | null;
}