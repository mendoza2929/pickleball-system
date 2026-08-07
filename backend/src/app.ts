import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/error.middleware";
import routes from "./routes";
dotenv.config();

const app = express();

app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "Pickleball API is running."
  });
});



app.use("/api", routes);

app.use(errorHandler);
export default app;