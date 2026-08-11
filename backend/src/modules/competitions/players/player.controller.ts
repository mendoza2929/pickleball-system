// player.controller.ts

import { Request, Response } from "express";

import {
  editCompetitionPlayer,
  getCompetitionPlayer,
  getCompetitionPlayers,
  registerCompetitionPlayer,
} from "./player.service";

export async function getPlayers(
  req: Request,
  res: Response
) {
  try {
    const players = await getCompetitionPlayers();

    return res.status(200).json({
      success: true,
      data: players,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch competition players",
    });
  }
}

export async function getPlayer(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    const player = await getCompetitionPlayer(id);

    return res.status(200).json({
      success: true,
      data: player,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export async function createPlayer(
  req: Request,
  res: Response
) {
  try {
    const { customerId, skillLevel } = req.body;

    if (!customerId || !skillLevel) {
      return res.status(400).json({
        success: false,
        message: "customerId and skillLevel are required",
      });
    }

    const player = await registerCompetitionPlayer({
      customerId: Number(customerId),
      skillLevel,
    });

    return res.status(201).json({
      success: true,
      message: "Competition player registered successfully",
      data: player,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updatePlayer(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    const player = await editCompetitionPlayer(
      id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Competition player updated successfully",
      data: player,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}