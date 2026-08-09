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
// Guest + authenticated users
// =====================================================

router.post(
  "/",
  optionalAuthenticate,
  reservationController.create
);

// =====================================================
// RESERVATION AVAILABILITY
// =====================================================
// IMPORTANT:
// This MUST come before /:id
// =====================================================

router.use(
  "/availability",
  availabilityRoutes
);

// =====================================================
// MY RESERVATIONS
// =====================================================
// Authenticated users
// =====================================================

router.get(
  "/me",
  authenticate,
  reservationController.getMyReservations
);

// =====================================================
// PUBLIC RESERVATION LOOKUP
// =====================================================
// Guest can lookup reservation by UUID
// =====================================================

router.get(
  "/uuid/:uuid",
  reservationController.getByUuid
);

// =====================================================
// ALL RESERVATIONS
// =====================================================
// OWNER + ADMIN ONLY
// =====================================================

router.get(
  "/",
  authenticate,
  authorizeAdmin,
  reservationController.getAll
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