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

app.use(cors());

app.use(helmet());

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
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (_, res) => {
  res.json({
    success: true,
    message:
      "Pickleball API is running.",
  });
});

// =====================================================
// API ROUTES
// =====================================================

app.use(
  "/api",
  routes
);

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(errorHandler);

export default app;