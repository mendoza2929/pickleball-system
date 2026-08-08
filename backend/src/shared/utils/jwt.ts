import jwt from "jsonwebtoken";

interface AccessTokenPayload {
  id: number;
  uuid: string;
  email: string;
  role_id: number;
  role_name: string;
}

export function generateAccessToken(
  payload: AccessTokenPayload
) {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    {
      expiresIn: "1d",
    }
  );
}