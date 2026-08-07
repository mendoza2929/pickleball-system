import { Router } from "express";

import { PaymentController } from "./payment.controller";

import { authenticate } from "../../middleware/authenticate";
// import { authorize } from "../../middleware/authorize";

const router = Router();

const paymentController = new PaymentController();

/**
 * Payment Routes
 */

// Create Payment
router.post(
  "/",
  authenticate,
  paymentController.create
);

// Get All Payments
router.get(
  "/",
  authenticate,
  paymentController.getAll
);

// Mark Payment as Paid
router.patch(
  "/:id/pay",
  authenticate,
  // authorize("ADMIN"),
  paymentController.markPaid
);

export default router;