import { Router } from "express";

import {
  create,
  getOne,
  getByDivision,
  noShow,
  cancel,
} from "./checkin.controller";

const router = Router();

// --------------------------------------------------
// CHECK-IN
// --------------------------------------------------

// Check in a registered player
router.post(
  "/registrations/:registrationId/check-in",
  create
);

// Get check-in by ID
router.get(
  "/check-ins/:id",
  getOne
);

// Get all check-ins for a division
router.get(
  "/divisions/:divisionId/check-ins",
  getByDivision
);

// Mark no-show
router.patch(
  "/check-ins/:id/no-show",
  noShow
);

// Cancel check-in
router.patch(
  "/check-ins/:id/cancel",
  cancel
);

export default router;