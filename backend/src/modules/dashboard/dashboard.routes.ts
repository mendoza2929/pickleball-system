import { Router } from "express";

import { DashboardController } from "./dashboard.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

const dashboardController =
  new DashboardController();

/**
 * GET /api/dashboard
 *
 * Dashboard overview
 */
router.get(
  "/",
  authenticate,
  dashboardController.getDashboard
);

export default router;