import { Router } from "express";

import { ReservationController } from "./reservation.controller";
import { authenticate } from "../../middleware/authenticate";
import { optionalAuthenticate } from "../../middleware/optionalAuthenticate";
// import { authorize } from "../../middleware/authorize";

const router = Router();

const reservationController = new ReservationController();

router.post(
  "/",
  optionalAuthenticate,
  reservationController.create
);

router.get(
  "/me",
  authenticate,
  reservationController.getMyReservations
);

router.get(
  "/uuid/:uuid",
  reservationController.getByUuid
);

router.get(
  "/",
  authenticate,
  reservationController.getAll
);

router.get(
  "/:id",
  authenticate,
  reservationController.getById
);

router.patch(
  "/:id/cancel",
  authenticate,
  reservationController.cancel
);
export default router;