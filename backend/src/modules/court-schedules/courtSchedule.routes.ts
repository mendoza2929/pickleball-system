import { Router } from "express";

import { CourtScheduleController } from "./courtSchedule.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

const controller = new CourtScheduleController();

/**
 * Court Schedule Routes
 */

// Create (Admin)
router.post(
  "/",
  authenticate,
  controller.create
);

// Get All (Public)
router.get(
  "/",
  controller.getAll
);

// Get By Court (Public)
router.get(
  "/court/:courtId",
  controller.getByCourt
);

// Update (Admin)
router.put(
  "/:id",
  authenticate,
  controller.update
);

// Delete (Admin)
router.delete(
  "/:id",
  authenticate,
  controller.delete
);

export default router;