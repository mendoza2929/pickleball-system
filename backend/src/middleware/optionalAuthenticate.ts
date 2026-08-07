import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { AuthRequest } from "./authenticate";

export function optionalAuthenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  // Guest reservation
  if (!authHeader) {
    req.user = undefined;
    return next();
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    req.user = undefined;
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    ) as {
      id: number;
      uuid: string;
      email: string;
    };

    req.user = decoded;
  } catch {
    req.user = undefined;
  }

  next();
}