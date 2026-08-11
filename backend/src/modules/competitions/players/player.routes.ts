// player.routes.ts

import { Router } from "express";

import {
  createPlayer,
  getPlayer,
  getPlayers,
  updatePlayer,
} from "./player.controller";

const router = Router();

router.get("/", getPlayers);

router.get("/:id", getPlayer);

router.post("/", createPlayer);

router.put("/:id", updatePlayer);

export default router;