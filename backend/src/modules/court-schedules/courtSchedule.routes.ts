import { Router } from "express";

import { CourtScheduleController } from "./courtSchedule.controller";

import { authenticate } from "../../middleware/authenticate";
import { authorizeAdmin } from "../../middleware/authorizeAdmin";

const router = Router();

const controller =
  new CourtScheduleController();

// =====================================================
// PUBLIC
// =====================================================

// Get all schedules for a court
//
// GET /api/court-schedules/court/:courtId
//
router.get(
  "/court/:courtId",
  controller.getCourtSchedules
);

// Get schedule for a specific court + day
//
// GET /api/court-schedules/court/:courtId/:day
//
// Example:
// /api/court-schedules/court/7/Friday
//
router.get(
  "/court/:courtId/:day",
  controller.getByCourtAndDay
);

// Get schedule by ID
//
// GET /api/court-schedules/:id
//
router.get(
  "/:id",
  controller.getById
);

// =====================================================
// ADMIN / PROTECTED
// =====================================================

// Update schedule
//
// PUT /api/court-schedules/:id
//
router.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  controller.update
);

export default router;