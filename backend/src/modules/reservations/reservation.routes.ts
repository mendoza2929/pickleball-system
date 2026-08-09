import { Router } from "express";

import { ReservationController } from "./reservation.controller";

import { authenticate } from "../../middleware/authenticate";
import { optionalAuthenticate } from "../../middleware/optionalAuthenticate";
import { authorizeAdmin } from "../../middleware/authorizeAdmin";

import availabilityRoutes from "./availability/routes";

const router = Router();

const reservationController =
  new ReservationController();

// =====================================================
// CREATE RESERVATION
// =====================================================

router.post(
  "/",
  optionalAuthenticate,
  reservationController.create
);

// =====================================================
// MY RESERVATIONS
// =====================================================

router.get(
  "/me",
  authenticate,
  reservationController.getMyReservations
);

// =====================================================
// PUBLIC RESERVATION LOOKUP
// =====================================================

router.get(
  "/uuid/:uuid",
  reservationController.getByUuid
);

// =====================================================
// ALL RESERVATIONS
// =====================================================

router.get(
  "/",
  authenticate,
  authorizeAdmin,
  reservationController.getAll
);

// =====================================================
// AVAILABILITY
// IMPORTANT:
// This MUST come BEFORE /:id
// =====================================================

router.use(
  "/availability",
  availabilityRoutes
);

// =====================================================
// RESERVATION DETAILS
// =====================================================

router.get(
  "/:id",
  authenticate,
  reservationController.getById
);

// =====================================================
// CANCEL RESERVATION
// =====================================================

router.patch(
  "/:id/cancel",
  authenticate,
  reservationController.cancel
);

// =====================================================
// UPDATE RESERVATION STATUS
// =====================================================

router.patch(
  "/:id/status",
  authenticate,
  authorizeAdmin,
  reservationController.updateStatus
);

// =====================================================
// WALK-IN RESERVATION
// =====================================================

router.post(
  "/walk-in",
  authenticate,
  authorizeAdmin,
  reservationController.createWalkIn
);

export default router;