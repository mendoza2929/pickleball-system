import { Router } from "express";

import {
  getAll,
  getOne,
  create,
  update,
} from "./competition.controller";

import {
  authenticate,
} from "../../middleware/authenticate";

import courtAllocationRoutes from "./court-allocations/courtAllocation.routes";

const router = Router();

// ==================================================
// COMPETITIONS
// ==================================================

router.get(
  "/",
  getAll
);

router.get(
  "/:id",
  authenticate,
  getOne
);

router.post(
  "/",
  authenticate,
  create
);

router.patch(
  "/:id",
  authenticate,
  update
);

// ==================================================
// COURT ALLOCATIONS
// ==================================================

router.use(
  "/:competitionId/court-allocations",
  authenticate,
  courtAllocationRoutes
);

export default router;