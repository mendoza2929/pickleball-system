import { Router } from "express";

import {
  create,
  getByDivision,
  getOne,
  update,
  cancel,
  publicRegister,
  verifyPayment,
} from "./registration.controller";

import {
  uploadPaymentProof,
} from "../../../middleware/upload";

const router = Router();

// =====================================================
// PUBLIC REGISTRATION
// =====================================================

router.post(
  "/divisions/:divisionId/register",
  uploadPaymentProof.single(
    "paymentProof"
  ),
  publicRegister
);

// =====================================================
// ADMIN REGISTRATION
// =====================================================

// GET
// /api/competitions/divisions/:divisionId/registrations

router.get(
  "/divisions/:divisionId/registrations",
  getByDivision
);

// POST
// /api/competitions/divisions/:divisionId/registrations

router.post(
  "/divisions/:divisionId/registrations",
  create
);

// =====================================================
// SINGLE REGISTRATION
// =====================================================

// GET
// /api/competitions/registrations/:id

router.get(
  "/registrations/:id",
  getOne
);

// =====================================================
// UPDATE REGISTRATION
// =====================================================

// PATCH
// /api/competitions/registrations/:id

router.patch(
  "/registrations/:id",
  update
);

// =====================================================
// VERIFY PAYMENT
// =====================================================

// PATCH
// /api/competitions/registrations/:id/payment

router.patch(
  "/registrations/:id/payment",
  verifyPayment
);

// =====================================================
// CANCEL REGISTRATION
// =====================================================

// DELETE
// /api/competitions/registrations/:id

router.delete(
  "/registrations/:id",
  cancel
);

export default router;