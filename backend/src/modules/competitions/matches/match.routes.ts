import { Router } from "express";

import {
  create,
  getOne,
  getBySession,
  update,
  start,
  complete,
} from "./match.controller";

const router = Router();

// ==================================================
// OPEN PLAY MATCHES
// ==================================================

// --------------------------------------------------
// Create match from waiting queue
// --------------------------------------------------

router.post(
  "/sessions/:sessionId/matches",
  create
);

// --------------------------------------------------
// Get all matches for session
// --------------------------------------------------

router.get(
  "/sessions/:sessionId/matches",
  getBySession
);

// --------------------------------------------------
// Get one match
// --------------------------------------------------

router.get(
  "/matches/:id",
  getOne
);

// --------------------------------------------------
// General status update
// --------------------------------------------------

router.patch(
  "/matches/:id",
  update
);

// --------------------------------------------------
// Start match
// --------------------------------------------------

router.patch(
  "/matches/:id/start",
  start
);

// --------------------------------------------------
// Complete match with score
// --------------------------------------------------

router.patch(
  "/matches/:id/complete",
  complete
);

export default router;