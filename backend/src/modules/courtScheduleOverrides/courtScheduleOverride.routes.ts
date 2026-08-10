import { Router } from "express";

import {
  CourtScheduleOverrideController,
} from "./courtScheduleOverride.controller";

import { authenticate } from "../../middleware/authenticate";
import { authorizeAdmin } from "../../middleware/authorizeAdmin";

const router = Router();

const controller =
  new CourtScheduleOverrideController();

// =====================================================
// HOLIDAYS
// =====================================================

// GET /api/court-schedule-overrides/holidays
router.get(
  "/holidays",
  controller.getHolidays
);

// POST /api/court-schedule-overrides/holidays
router.post(
  "/holidays",
  authenticate,
  authorizeAdmin,
  controller.createHoliday
);

// DELETE /api/court-schedule-overrides/holidays/:id
router.delete(
  "/holidays/:id",
  authenticate,
  authorizeAdmin,
  controller.deleteHoliday
);

// =====================================================
// PUBLIC OVERRIDES
// =====================================================

// GET /api/court-schedule-overrides/court/:courtId
router.get(
  "/court/:courtId",
  controller.getByCourt
);

// GET /api/court-schedule-overrides/court/:courtId/date/:date
router.get(
  "/court/:courtId/date/:date",
  controller.getByCourtAndDate
);

// =====================================================
// GET BY ID
// =====================================================

// THIS MUST COME AFTER /holidays
router.get(
  "/:id",
  controller.getById
);

// =====================================================
// ADMIN OVERRIDES
// =====================================================

router.post(
  "/",
  authenticate,
  authorizeAdmin,
  controller.create
);

router.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  controller.update
);

router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  controller.delete
);

export default router;