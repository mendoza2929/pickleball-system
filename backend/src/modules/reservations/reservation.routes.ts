import { Router } from "express";

import { ReservationController } from "./reservation.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

const reservationController = new ReservationController();

/**
 * Reservation Routes
 */

// Create Reservation
router.post(
  "/",
  authenticate,
  reservationController.create
);

// Get My Reservations
router.get(
  "/me",
  authenticate,
  reservationController.getMyReservations
);

// Get All Reservations
router.get(
  "/",
  authenticate,
  reservationController.getAll
);

// Get Reservation by ID
router.get(
  "/:id",
  authenticate,
  reservationController.getById
);

// Cancel Reservation
router.patch(
  "/:id/cancel",
  authenticate,
  reservationController.cancel
);

export default router;