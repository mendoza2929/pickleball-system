import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";
import courtRoutes from "../modules/courts/court.routes";
import reservationRoutes from "../modules/reservations/reservation.routes";
import courtScheduleRoutes from "../modules/court-schedules/courtSchedule.routes";
import paymentRoutes from "../modules/payments/payment.routes";
import availabilityRoutes from "../modules/availability/availability.routes";
const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/courts", courtRoutes);
router.use("/reservations", reservationRoutes);
router.use("/court-schedules", courtScheduleRoutes);
router.use("/payments", paymentRoutes);
router.use("/availability", availabilityRoutes);
export default router;