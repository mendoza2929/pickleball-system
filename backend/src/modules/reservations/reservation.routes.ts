import { Router } from "express";

import { ReservationController } from "./reservation.controller";

import { authenticate } from "../../middleware/authenticate";
import { optionalAuthenticate } from "../../middleware/optionalAuthenticate";
import { authorizeAdmin } from "../../middleware/authorizeAdmin";


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
// Keep this as normal authentication for now.
// We will update the service next so Admin can
// view any reservation.
// =====================================================

router.get(
  "/:id",
  authenticate,
  reservationController.getById
);


// =====================================================
// CANCEL RESERVATION
// =====================================================
// Reservation owner
// =====================================================

router.patch(
  "/:id/cancel",
  authenticate,
  reservationController.cancel
);


router.patch(
  "/:id/status",
  authenticate,
  authorizeAdmin,
  reservationController.updateStatus
);


export default router;