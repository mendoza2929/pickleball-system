import {
  Router,
} from "express";


import {
  SettingsController,
} from "./settings.controller";


import {
  authenticate,
} from "../../middleware/authenticate";


import {
  authorizeAdmin,
} from "../../middleware/authorizeAdmin";


const router =
  Router();


const settingsController =
  new SettingsController();


// =====================================================
// GENERAL SETTINGS
// =====================================================

router.get(
  "/general",
  authenticate,
  authorizeAdmin,
  settingsController.getGeneral
);


router.put(
  "/general",
  authenticate,
  authorizeAdmin,
  settingsController.updateGeneral
);


// =====================================================
// BOOKING RULES
// =====================================================

router.get(
  "/booking-rules",
  authenticate,
  authorizeAdmin,
  settingsController.getBookingRules
);


router.put(
  "/booking-rules",
  authenticate,
  authorizeAdmin,
  settingsController.updateBookingRules
);


// =====================================================
// NOTIFICATIONS
// =====================================================

router.get(
  "/notifications",
  authenticate,
  authorizeAdmin,
  settingsController.getNotifications
);


router.put(
  "/notifications",
  authenticate,
  authorizeAdmin,
  settingsController.updateNotifications
);


export default router;