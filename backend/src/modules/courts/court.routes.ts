import { Router } from "express";

import {
  CourtController,
} from "./court.controller";

import {
  authenticate,
} from "../../middleware/authenticate";

const router = Router();

const controller =
  new CourtController();

// ==================================================
// PUBLIC
// ==================================================

router.get(
  "/",
  controller.getAll
);

// IMPORTANT:
// This must be BEFORE /:id
router.get(
  "/available",
  controller.getAvailable
);

router.get(
  "/:id",
  controller.getById
);

// ==================================================
// PROTECTED
// ==================================================

router.post(
  "/",
  authenticate,
  controller.create
);

router.put(
  "/:id",
  authenticate,
  controller.update
);

router.delete(
  "/:id",
  authenticate,
  controller.delete
);

export default router;