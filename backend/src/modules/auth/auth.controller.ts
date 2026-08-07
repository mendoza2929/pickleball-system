import { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.validator";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { AuthRequest } from "../../middleware/authenticate"
export class AuthController {
  private authService = new AuthService();

  register = asyncHandler(async (req: Request, res: Response) => {
    const data = registerSchema.parse(req.body);

    const result = await this.authService.register(data);

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const data = loginSchema.parse(req.body);

    const result = await this.authService.login(data);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  });

    me = asyncHandler(async (req: AuthRequest, res) => {

      return res.json({
          success: true,
          data: req.user,
      });

  });
}