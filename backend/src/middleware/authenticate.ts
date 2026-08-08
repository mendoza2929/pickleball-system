import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthorizedError } from "../shared/errors/UnauthorizedError";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    uuid: string;
    email: string;
    role_id?: number;
    role_name?: string;
  };
}

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(
      new UnauthorizedError("Access token is required.")
    );
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return next(
      new UnauthorizedError(
        "Invalid authorization header."
      )
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    ) as {
      id: number;
      uuid: string;
      email: string;
      role_id?: number;
      role_name?: string;
    };

    req.user = decoded;

    next();
  } catch {
    next(
      new UnauthorizedError(
        "Invalid or expired token."
      )
    );
  }
}