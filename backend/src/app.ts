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
// CORS
// =====================================================

const allowedOrigins = [
  "http://localhost:3000",
  "https://pickleball-system-indol.vercel.app",
];

app.use(
  cors({
    origin: (
      origin,
      callback
    ) => {
      // Allow requests without Origin
      // such as Postman/server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `CORS blocked origin: ${origin}`
        )
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// =====================================================
// HELMET
// =====================================================

app.use(
  helmet({
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
          "https://pickleball-system-production.up.railway.app",
          "http://localhost:5000",
        ],

        scriptSrc: [
          "'self'",
        ],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
        ],

        connectSrc: [
          "'self'",
          "http://localhost:3000",
          "http://localhost:5000",
          "https://pickleball-system-indol.vercel.app",
          "https://pickleball-system-production.up.railway.app",
        ],
      },
    },
  })
);

// =====================================================
// GENERAL MIDDLEWARE
// =====================================================

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

app.use("/api", routes);

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(errorHandler);

export default app;