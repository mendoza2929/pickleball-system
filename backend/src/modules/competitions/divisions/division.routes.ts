import { Router } from "express";

import {
  getByCompetition,
  getOne,
  create,
  update,
} from "./division.controller";

import { authenticate } from "../../../middleware/authenticate";

const router = Router();

// ==================================================
// COMPETITION DIVISIONS
// ==================================================

// GET
// /api/competitions/:competitionId/divisions

router.get(
  "/:competitionId/divisions",
  getByCompetition
);

// GET
// /api/competitions/divisions/:id

router.get(
  "/divisions/:id",
  authenticate,
  getOne
);

// POST
// /api/competitions/:competitionId/divisions

router.post(
  "/:competitionId/divisions",
  authenticate,
  create
);

// PATCH
// /api/competitions/divisions/:id

router.patch(
  "/divisions/:id",
  authenticate,
  update
);

export default router;