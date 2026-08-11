import { Router } from "express";

import {
  getAll,
  getOne,
  create,
  update,
} from "./competition.controller";

import { authenticate } from "../../middleware/authenticate";
const router = Router();

// ==================================================
// COMPETITIONS
// ==================================================

router.get(
  "/",
  getAll
);

router.get(
  "/:id",
  authenticate,
  getOne
);

router.post(
  "/",
  authenticate,
  create
);

router.patch(
  "/:id",
  authenticate,
  update
);

export default router;