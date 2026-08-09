import { Router } from "express";

import {
  ReservationAvailabilityController,
} from "./controller";

const router = Router();

const controller =
  new ReservationAvailabilityController();

router.get(
  "/",
  controller.getAvailability
);

export default router;