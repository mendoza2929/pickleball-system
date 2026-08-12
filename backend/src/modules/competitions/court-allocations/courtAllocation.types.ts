// ==================================================
// COURT ALLOCATION TYPES
// ==================================================

export type CourtAllocationType =
  | "open_play"
  | "tournament";

export type CourtAllocationStatus =
  | "reserved"
  | "released"
  | "cancelled";

// ==================================================
// COURT ALLOCATION
// ==================================================

export interface CourtAllocation {
  id: number;

  competition_id: number;

  competition_division_id: number | null;

  court_id: number;

  allocation_date: string;

  start_time: string;

  end_time: string;

  allocation_type: CourtAllocationType;

  status: CourtAllocationStatus;

  created_at: Date;

  updated_at: Date;
}

// ==================================================
// CREATE
// ==================================================

export interface CreateCourtAllocationInput {
  competition_id: number;

  competition_division_id?: number | null;

  court_id: number;

  allocation_date: string;

  start_time: string;

  end_time: string;

  allocation_type: CourtAllocationType;
}

// ==================================================
// UPDATE
// ==================================================

export interface UpdateCourtAllocationInput {
  start_time?: string;

  end_time?: string;

  status?: CourtAllocationStatus;
}