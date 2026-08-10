import { Router } from "express";

import { CustomerController } from "./customer.controller";

import { authenticate } from "../../middleware/authenticate";

const router = Router();

const customerController = new CustomerController();

// =====================================================
// GET /api/customers
// =====================================================

router.get(
  "/",
  authenticate,
  customerController.getAll
);

// =====================================================
// GET /api/customers/uuid/:uuid
// =====================================================

router.get(
  "/uuid/:uuid",
  authenticate,
  customerController.getByUuid
);

// =====================================================
// GET /api/customers/:id
// =====================================================

router.get(
  "/:id",
  authenticate,
  customerController.getById
);

// =====================================================
// POST /api/customers
// =====================================================

router.post(
  "/",
  authenticate,
  customerController.create
);

// =====================================================
// PUT /api/customers/:id
// =====================================================

router.put(
  "/:id",
  authenticate,
  customerController.update
);

// =====================================================
// DELETE /api/customers/:id
// =====================================================

router.delete(
  "/:id",
  authenticate,
  customerController.delete
);

export default router;