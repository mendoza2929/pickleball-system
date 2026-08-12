import {
  Router,
} from "express";

import {
  getByCompetition,
  getOne,
  create,
  update,
} from "./division.controller";

import {
  authenticate,
} from "../../../middleware/authenticate";

const router = Router();

// ==================================================
// GET DIVISIONS BY COMPETITION
// ==================================================
//
// GET
// /api/competitions/:competitionId/divisions
//

router.get(
  "/:competitionId/divisions",
  getByCompetition
);

// ==================================================
// GET ONE
// ==================================================
//
// GET
// /api/competitions/divisions/:id
//

router.get(
  "/divisions/:id",
  authenticate,
  getOne
);

// ==================================================
// CREATE
// ==================================================
//
// POST
// /api/competitions/:competitionId/divisions
//

router.post(
  "/:competitionId/divisions",
  authenticate,
  create
);

// ==================================================
// UPDATE
// ==================================================
//
// PATCH
// /api/competitions/divisions/:id
//

router.patch(
  "/divisions/:id",
  authenticate,
  update
);

export default router;