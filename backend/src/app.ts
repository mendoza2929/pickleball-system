import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";

import { errorHandler } from "./middleware/error.middleware";
import routes from "./routes";

dotenv.config();

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  helmet({
    // Allow frontend (localhost:3000)
    // to display resources from backend (localhost:5000)
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },

    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "http://localhost:5000",
        ],

        scriptSrc: ["'self'"],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
        ],

        connectSrc: [
          "'self'",
          "http://localhost:3000",
          "http://localhost:5000",
        ],
      },
    },
  })
);

app.use(morgan("dev"));

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

// =====================================================
// STATIC UPLOADS
// =====================================================

app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "Pickleball API is running.",
  });
});

// =====================================================
// API ROUTES
// =====================================================

app.use("/api", routes);

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(errorHandler);

export default app;