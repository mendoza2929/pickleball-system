import { Router } from "express";

import {
  CourtAllocationController,
} from "./courtAllocation.controller";

import {
  authenticate,
} from "../../../middleware/authenticate";

const router = Router({
  mergeParams: true,
});

const controller =
  new CourtAllocationController();

// ==================================================
// AVAILABLE COURTS
// ==================================================
//
// GET
// /api/competitions/:competitionId/court-allocations/available
//
// Example:
// ?date=2026-08-29
// &start_time=16:00
// &end_time=22:00
//
// ==================================================

router.get(
  "/available",
  authenticate,
  controller.getAvailableCourts
);

// ==================================================
// GET ALL ALLOCATIONS
// ==================================================

router.get(
  "/",
  authenticate,
  controller.getAllocations
);

// ==================================================
// CREATE ALLOCATION
// ==================================================

router.post(
  "/",
  authenticate,
  controller.create
);

// ==================================================
// GET ALLOCATION BY ID
// ==================================================

router.get(
  "/:id",
  authenticate,
  controller.getAllocation
);

// ==================================================
// UPDATE ALLOCATION
// ==================================================

router.put(
  "/:id",
  authenticate,
  controller.update
);

// ==================================================
// RELEASE ALLOCATION
// ==================================================

router.delete(
  "/:id",
  authenticate,
  controller.release
);

export default router;