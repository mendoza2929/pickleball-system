import { rateLimit } from "express-rate-limit";

export const reservationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 10,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many reservation attempts. Please try again later.",
  },
});