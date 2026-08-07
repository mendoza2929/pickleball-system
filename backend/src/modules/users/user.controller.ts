import { Response } from "express";

import { UserService } from "./user.service";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { AuthRequest } from "../../middleware/authenticate";
import { updateProfileSchema } from "./user.validator";
export class UserController {

  private userService = new UserService();

  profile = asyncHandler(async (req: AuthRequest, res: Response) => {

    const profile = await this.userService.getProfile(req.user!.id);

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully.",
      data: profile,
    });

  });

  updateProfile = asyncHandler(async (req: AuthRequest, res) => {

        const data = updateProfileSchema.parse(req.body);

        const user = await this.userService.updateProfile(
            req.user!.id,
            data
        );

        return res.json({
            success: true,
            message: "Profile updated successfully.",
            data: user,
        });

    });

}