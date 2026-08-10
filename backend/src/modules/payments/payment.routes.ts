import { Router } from "express";

import { PaymentController } from "./payment.controller";

import { optionalAuthenticate } from "../../middleware/optionalAuthenticate";
import { authenticate } from "../../middleware/authenticate";

import { uploadPaymentProof } from "../../middleware/uploadPaymentProof";

const router = Router();

const paymentController =
  new PaymentController();

/**
 * POST /api/payments
 *
 * Create GCash payment
 *
 * multipart/form-data:
 *
 * reservation_id
 * payment_method
 * proof
 *
 * Guest reservations are allowed.
 */
router.post(
  "/",
  optionalAuthenticate,
  uploadPaymentProof.single("proof"),
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
 * Authenticated payment lookup
 */
router.get(
  "/reservation/:reservationId",
  authenticate,
  paymentController.getByReservation
);

export default router;