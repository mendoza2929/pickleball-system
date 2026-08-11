export type DivisionSkillLevel =
  | "beginner"
  | "novice"
  | "intermediate";

export type DivisionFormat =
  | "singles"
  | "doubles";

export type DivisionStatus =
  | "open"
  | "closed"
  | "in_progress"
  | "completed";

export interface CreateDivisionInput {
  competitionId: number;

  name: string;

  skillLevel: DivisionSkillLevel;

  format: DivisionFormat;

  maxPlayers?: number | null;

  entryFee?: number;

  status?: DivisionStatus;
}

export interface UpdateDivisionInput {
  name?: string;

  skillLevel?: DivisionSkillLevel;

  format?: DivisionFormat;

  maxPlayers?: number | null;

  entryFee?: number;

  status?: DivisionStatus;
}