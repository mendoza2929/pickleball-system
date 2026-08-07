import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export function generateAccessToken(payload: object) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "1d",
  });
}