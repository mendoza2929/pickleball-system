import { Response, NextFunction } from "express";

import { AuthRequest } from "./authenticate";

import { ForbiddenError } from "../shared/errors/ForbiddenError";


export function authorizeAdmin(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  // User must already be authenticated
  if (!req.user) {
    return next(
      new ForbiddenError(
        "Authentication required."
      )
    );
  }

  // Only Owner and Admin can access
  const allowedRoles = [
    "Owner",
    "Admin",
  ];

  if (
    !allowedRoles.includes(
      req.user.role_name
    )
  ) {
    return next(
      new ForbiddenError(
        "You do not have permission to access the admin portal."
      )
    );
  }

  next();
}