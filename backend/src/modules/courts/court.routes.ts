import { Router } from "express";

import { CourtController } from "./court.controller";
import { authenticate } from "../../middleware/authenticate";
// import { authorize } from "../../middleware/authorize";

const router = Router();

const courtController = new CourtController();

/*
|--------------------------------------------------------------------------
| Court Routes
|--------------------------------------------------------------------------
*/

// Create Court
router.post(
  "/",
  authenticate,
  // authorize("ADMIN"),
  courtController.create
);

// Get All Courts
router.get(
  "/",
  authenticate,
  courtController.getAll
);

// Get Court by ID
router.get(
  "/:id",
  authenticate,
  courtController.getById
);

// Update Court
router.put(
  "/:id",
  authenticate,
  // authorize("ADMIN"),
  courtController.update
);

// Delete Court
router.delete(
  "/:id",
  authenticate,
  // authorize("ADMIN"),
  courtController.delete
);

export default router;