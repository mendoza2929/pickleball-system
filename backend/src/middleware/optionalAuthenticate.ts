import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface OptionalAuthRequest extends Request {
  user?: {
    id: number;
    uuid: string;
    email: string;
    role_id?: number;
    role_name?: string;
  };
}

export function optionalAuthenticate(
  req: OptionalAuthRequest,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  // No token is okay because this middleware is optional
  if (!authHeader) {
    return next();
  }

  const [type, token] = authHeader.split(" ");

  // Invalid/malformed token → treat as unauthenticated
  if (type !== "Bearer" || !token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: number;
      uuid: string;
      email: string;
      role_id?: number;
      role_name?: string;
    };

    req.user = decoded;

    next();
  } catch {
    // Optional authentication should not block guest reservations
    next();
  }
}