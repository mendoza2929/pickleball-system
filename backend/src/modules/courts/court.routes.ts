import { Router } from "express";
import { CourtController } from "./court.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();
const controller = new CourtController();

// ---------- Public Routes ----------
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

// ---------- Protected Routes ----------
router.post("/", authenticate, controller.create);
router.put("/:id", authenticate, controller.update);
router.delete("/:id", authenticate, controller.delete);

export default router;