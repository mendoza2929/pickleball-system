import { Router } from "express";

import { AvailabilityController } from "./availability.controller";

const router = Router();

const controller =
  new AvailabilityController();

/**
 * Public
 *
 * GET
 * /api/availability
 *
 * ?courtId=1
 * &date=2026-08-15
 */
router.get(
  "/",
  controller.getAvailability
);

export default router;