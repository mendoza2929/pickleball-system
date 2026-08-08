import { Router } from "express";

import { PaymentController } from "./payment.controller";

import { optionalAuthenticate } from "../../middleware/optionalAuthenticate";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

const paymentController =
  new PaymentController();

/**
 * POST /api/payments
 *
 * Create GCash payment
 *
 * Guest reservations are allowed,
 * so authentication is optional.
 */
router.post(
  "/",
  optionalAuthenticate,
  paymentController.create
);

/**
 * GET /api/payments/uuid/:uuid
 *
 * Public payment lookup
 */
router.get(
  "/uuid/:uuid",
  paymentController.getByUuid
);

/**
 * GET /api/payments/reservation/:reservationId
 *
 * Authenticated user's payment
 */
router.get(
  "/reservation/:reservationId",
  authenticate,
  paymentController.getByReservation
);

export default router;