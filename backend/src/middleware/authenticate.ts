import {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt from "jsonwebtoken";

import { env } from "../config/env";

import {
  UnauthorizedError,
} from "../shared/errors/UnauthorizedError";


export interface AuthRequest
  extends Request {

  user?: {
    id: number;

    uuid: string;

    email: string;

    role_id: number;

    role_name: string;
  };
}


export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {

  // =====================================================
  // GET AUTHORIZATION HEADER
  // =====================================================

  const authHeader =
    req.headers.authorization;


  if (!authHeader) {
    return next(
      new UnauthorizedError(
        "Access token is required."
      )
    );
  }


  // =====================================================
  // GET TOKEN
  // =====================================================

  const [
    type,
    token,
  ] = authHeader.split(" ");


  if (
    type !== "Bearer" ||
    !token
  ) {
    return next(
      new UnauthorizedError(
        "Invalid authorization header."
      )
    );
  }


  // =====================================================
  // VERIFY TOKEN
  // =====================================================

  try {

    const decoded =
      jwt.verify(
        token,
        env.JWT_SECRET
      ) as {
        id: number;

        uuid: string;

        email: string;

        role_id: number;

        role_name: string;
      };


    // ===================================================
    // SET AUTHENTICATED USER
    // ===================================================

    req.user = {
      id: decoded.id,

      uuid: decoded.uuid,

      email: decoded.email,

      role_id: decoded.role_id,

      role_name: decoded.role_name,
    };


    next();

  } catch {

    next(
      new UnauthorizedError(
        "Invalid or expired token."
      )
    );

  }
}