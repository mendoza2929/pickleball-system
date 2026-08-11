import { Router } from "express";

// ==================================================
// GENERAL MODULES
// ==================================================

import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";

import courtRoutes from "../modules/courts/court.routes";

import reservationRoutes from "../modules/reservations/reservation.routes";

import courtScheduleRoutes from "../modules/court-schedules/courtSchedule.routes";

import paymentRoutes from "../modules/payments/payment.routes";

import availabilityRoutes from "../modules/availability/availability.routes";

import courtScheduleOverrideRoutes from "../modules/courtScheduleOverrides/courtScheduleOverride.routes";

import dashboardRoutes from "../modules/dashboard/dashboard.routes";

import customerRoutes from "../modules/customer/customer.routes";

import reportRoutes from "../modules/reports/report.routes";

import settingsRoutes from "../modules/settings/settings.routes";

// ==================================================
// COMPETITIONS
// ==================================================

import competitionRoutes from "../modules/competitions/competition.routes";

import competitionPlayerRoutes from "../modules/competitions/players/player.routes";

import competitionDivisionRoutes from "../modules/competitions/divisions/division.routes";

import competitionCheckinRoutes from "../modules/competitions/checkins/checkin.routes";

import competitionQueueRoutes from "../modules/competitions/queue/queue.routes";

import competitionSessionRoutes from "../modules/competitions/sessions/session.routes";

import competitionMatchRoutes from "../modules/competitions/matches/match.routes";

import competitionMatchCourtRoutes from "../modules/competitions/match-courts/matchCourt.routes";

import openPlayRoutes from "../modules/competitions/open-play/open-play.routes";
import competitionRegistrationRoutes
  from "../modules/competitions/registrations/registration.routes";
const router = Router();

// ==================================================
// AUTH
// ==================================================

router.use(
  "/auth",
  authRoutes
);

// ==================================================
// USERS
// ==================================================

router.use(
  "/users",
  userRoutes
);

// ==================================================
// COURTS
// ==================================================

router.use(
  "/courts",
  courtRoutes
);

// ==================================================
// RESERVATIONS
// ==================================================

router.use(
  "/reservations",
  reservationRoutes
);

// ==================================================
// COURT SCHEDULES
// ==================================================

router.use(
  "/court-schedules",
  courtScheduleRoutes
);

// ==================================================
// COURT SCHEDULE OVERRIDES
// ==================================================

router.use(
  "/court-schedule-overrides",
  courtScheduleOverrideRoutes
);

// ==================================================
// PAYMENTS
// ==================================================

router.use(
  "/payments",
  paymentRoutes
);

// ==================================================
// AVAILABILITY
// ==================================================

router.use(
  "/availability",
  availabilityRoutes
);

// ==================================================
// DASHBOARD
// ==================================================

router.use(
  "/dashboard",
  dashboardRoutes
);

// ==================================================
// CUSTOMERS
// ==================================================

router.use(
  "/customers",
  customerRoutes
);

// ==================================================
// REPORTS
// ==================================================

router.use(
  "/reports",
  reportRoutes
);

// ==================================================
// SETTINGS
// ==================================================

router.use(
  "/settings",
  settingsRoutes
);

// ==================================================
// COMPETITIONS
// ==================================================

// Competition CRUD
//
// GET    /api/competitions
// GET    /api/competitions/:id
// POST   /api/competitions
// PATCH  /api/competitions/:id

router.use(
  "/competitions",
  competitionRoutes
);

// ==================================================
// COMPETITION DIVISIONS
// ==================================================

// GET    /api/competitions/:competitionId/divisions
// GET    /api/competitions/divisions/:id
// POST   /api/competitions/:competitionId/divisions
// PATCH  /api/competitions/divisions/:id

router.use(
  "/competitions",
  competitionDivisionRoutes
);

// ==================================================
// COMPETITION PLAYERS
// ==================================================

router.use(
  "/competitions",
  competitionPlayerRoutes
);

// ==================================================
// COMPETITION CHECK-INS
// ==================================================

// POST   /api/competitions/registrations/:registrationId/check-in
// GET    /api/competitions/check-ins/:id
// GET    /api/competitions/divisions/:divisionId/check-ins
// PATCH  /api/competitions/check-ins/:id/no-show
// PATCH  /api/competitions/check-ins/:id/cancel


router.use(
  "/competitions",
  competitionRegistrationRoutes
);


router.use(
  "/competitions",
  competitionCheckinRoutes
);

// ==================================================
// OPEN PLAY SESSIONS
// ==================================================

// POST   /api/competitions/divisions/:divisionId/session
// GET    /api/competitions/divisions/:divisionId/session
// GET    /api/competitions/sessions/:id
// PATCH  /api/competitions/sessions/:id

router.use(
  "/competitions",
  competitionSessionRoutes
);

// ==================================================
// OPEN PLAY QUEUE
// ==================================================

// POST   /api/competitions/sessions/:sessionId/queue
// GET    /api/competitions/sessions/:sessionId/queue
// GET    /api/competitions/sessions/:sessionId/queue/waiting
// GET    /api/competitions/queue/:id
// PATCH  /api/competitions/queue/:id
// PATCH  /api/competitions/queue/:id/remove

router.use(
  "/competitions",
  competitionQueueRoutes
);

// ==================================================
// OPEN PLAY MATCHES
// ==================================================

// POST   /api/competitions/sessions/:sessionId/matches
// GET    /api/competitions/sessions/:sessionId/matches
// GET    /api/competitions/matches/:id
// PATCH  /api/competitions/matches/:id
// PATCH  /api/competitions/matches/:id/start
// PATCH  /api/competitions/matches/:id/complete

router.use(
  "/competitions",
  competitionMatchRoutes
);

// ==================================================
// MATCH COURT ASSIGNMENT
// ==================================================

// POST   /api/competitions/matches/:matchId/assign-court
// PATCH  /api/competitions/matches/:matchId/court
// DELETE  /api/competitions/matches/:matchId/court

router.use(
  "/competitions",
  competitionMatchCourtRoutes
);

// ==================================================
// OPEN PLAY
// ==================================================

router.use(
  "/competitions/open-play",
  openPlayRoutes
);




export default router;