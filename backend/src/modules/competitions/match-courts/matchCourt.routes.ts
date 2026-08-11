import { Router } from "express";

import {
  autoAssign,
  assign,
  remove,
} from "./matchCourt.controller";

const router = Router();

// ==================================================
// AUTOMATIC COURT ASSIGNMENT
// ==================================================

router.post(
  "/matches/:matchId/assign-court",
  autoAssign
);

// ==================================================
// MANUAL COURT ASSIGNMENT
// ==================================================

router.patch(
  "/matches/:matchId/court",
  assign
);

// ==================================================
// REMOVE COURT
// ==================================================

router.delete(
  "/matches/:matchId/court",
  remove
);

export default router;