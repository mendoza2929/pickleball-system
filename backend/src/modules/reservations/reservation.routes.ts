import { Router } from "express";

import {
  ReservationController,
} from "./reservation.controller";

import {
  authenticate,
} from "../../middleware/authenticate";

import {
  optionalAuthenticate,
} from "../../middleware/optionalAuthenticate";

import {
  authorizeAdmin,
} from "../../middleware/authorizeAdmin";

import availabilityRoutes
  from "./availability/routes";


const router = Router();

const reservationController =
  new ReservationController();


// =====================================================
// CREATE ONLINE RESERVATION
// PUBLIC
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
// PUBLIC UUID LOOKUP
// =====================================================

router.get(
  "/uuid/:uuid",
  reservationController.getByUuid
);


// =====================================================
// AVAILABILITY
// =====================================================

router.use(
  "/availability",
  availabilityRoutes
);


// =====================================================
// ALL RESERVATIONS
// ADMIN
// =====================================================

router.get(
  "/",
  authenticate,
  authorizeAdmin,
  reservationController.getAll
);


// =====================================================
// WALK-IN RESERVATION
// ADMIN
// =====================================================

router.post(
  "/walk-in",
  authenticate,
  authorizeAdmin,
  reservationController.createWalkIn
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
// CANCEL
// =====================================================

router.patch(
  "/:id/cancel",
  authenticate,
  reservationController.cancel
);


// =====================================================
// UPDATE STATUS
// ADMIN
// =====================================================

router.patch(
  "/:id/status",
  authenticate,
  authorizeAdmin,
  reservationController.updateStatus
);


export default router;