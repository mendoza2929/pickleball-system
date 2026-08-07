import { Router } from "express";

import { CourtScheduleController } from "./courtSchedule.controller";
import { authenticate } from "../../middleware/authenticate";
// import { authorize } from "../../middleware/authorize";

const router = Router();

const controller = new CourtScheduleController();

/**
 * Court Schedule Routes
 */

// Create
router.post(
  "/",
  authenticate,
  // authorize("ADMIN"),
  controller.create
);

// Get All
router.get(
  "/",
  authenticate,
  controller.getAll
);

// Get By Court
router.get(
  "/court/:courtId",
  authenticate,
  controller.getByCourt
);

// Update
router.put(
  "/:id",
  authenticate,
  // authorize("ADMIN"),
  controller.update
);

// Delete
router.delete(
  "/:id",
  authenticate,
  // authorize("ADMIN"),
  controller.delete
);

export default router;