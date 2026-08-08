import { Response, NextFunction } from "express";
import { AuthRequest } from "./authenticate";
import { ForbiddenError } from "../shared/errors/ForbiddenError";

export function authorizeAdmin(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return next(
      new ForbiddenError(
        "You must be authenticated to access the admin portal."
      )
    );
  }

  const role = req.user.role_name;

  if (role !== "Owner" && role !== "Admin") {
    return next(
      new ForbiddenError(
        "You do not have permission to access the admin portal."
      )
    );
  }

  next();
}