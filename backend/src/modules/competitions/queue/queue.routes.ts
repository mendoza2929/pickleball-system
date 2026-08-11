import { Router } from "express";

import {
  create,
  getBySession,
  getOne,
  getWaiting,
  update,
  remove,
} from "./queue.controller";

const router = Router();

// ==================================================
// JOIN QUEUE
// ==================================================

router.post(
  "/sessions/:sessionId/queue",
  create
);

// ==================================================
// GET COMPLETE QUEUE
// ==================================================

router.get(
  "/sessions/:sessionId/queue",
  getBySession
);

// ==================================================
// GET WAITING PLAYERS
// ==================================================

router.get(
  "/sessions/:sessionId/queue/waiting",
  getWaiting
);

// ==================================================
// GET ONE QUEUE ENTRY
// ==================================================

router.get(
  "/queue/:id",
  getOne
);

// ==================================================
// UPDATE QUEUE STATUS
// ==================================================

router.patch(
  "/queue/:id",
  update
);

// ==================================================
// REMOVE FROM QUEUE
// ==================================================

router.patch(
  "/queue/:id/remove",
  remove
);

export default router;