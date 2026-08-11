// player.service.ts

import {
  createCompetitionPlayer,
  findAllCompetitionPlayers,
  findByCustomerId,
  findCompetitionPlayerById,
  updateCompetitionPlayer,
} from "./player.repository";

import {
  CreateCompetitionPlayerInput,
  UpdateCompetitionPlayerInput,
} from "./player.types";

export async function getCompetitionPlayers() {
  return findAllCompetitionPlayers();
}

export async function getCompetitionPlayer(id: number) {
  const player = await findCompetitionPlayerById(id);

  if (!player) {
    throw new Error("Competition player not found");
  }

  return player;
}

export async function registerCompetitionPlayer(
  data: CreateCompetitionPlayerInput
) {
  const existing = await findByCustomerId(data.customerId);

  if (existing) {
    throw new Error(
      "This customer is already registered as a competition player"
    );
  }

  return createCompetitionPlayer(data);
}

export async function editCompetitionPlayer(
  id: number,
  data: UpdateCompetitionPlayerInput
) {
  const existing = await findCompetitionPlayerById(id);

  if (!existing) {
    throw new Error("Competition player not found");
  }

  return updateCompetitionPlayer(id, data);
}