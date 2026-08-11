import {
  Router,
} from "express";

import {
  ReportController,
} from "./report.controller";

import {
  authenticate,
} from "../../middleware/authenticate";

import {
  authorizeAdmin,
} from "../../middleware/authorizeAdmin";


const router =
  Router();


const reportController =
  new ReportController();


// =====================================================
// REPORT OVERVIEW
// ADMIN ONLY
// =====================================================

router.get(
  "/overview",
  authenticate,
  authorizeAdmin,
  reportController.getOverview
);


export default router;