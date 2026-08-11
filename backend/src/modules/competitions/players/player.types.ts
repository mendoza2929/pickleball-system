// player.types.ts

export type CompetitionSkillLevel =
  | "beginner"
  | "novice"
  | "intermediate";

export type CompetitionPlayerStatus =
  | "active"
  | "inactive";

export interface CreateCompetitionPlayerInput {
  customerId: number;
  skillLevel: CompetitionSkillLevel;
}

export interface UpdateCompetitionPlayerInput {
  skillLevel?: CompetitionSkillLevel;
  status?: CompetitionPlayerStatus;
}