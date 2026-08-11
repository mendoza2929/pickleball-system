import { Router } from "express";

import {
  create,
  getOne,
  getByDivision,
  update,
} from "./session.controller";

const router = Router();

// ==================================================
// OPEN PLAY SESSIONS
// ==================================================

// Create session
router.post(
  "/divisions/:divisionId/session",
  create
);

// Get session by division
router.get(
  "/divisions/:divisionId/session",
  getByDivision
);

// Get session by ID
router.get(
  "/sessions/:id",
  getOne
);

// Update session
router.patch(
  "/sessions/:id",
  update
);

export default router;