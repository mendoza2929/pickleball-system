import { Router } from "express";

import { UserController } from "./user.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

const userController = new UserController();

router.get(
  "/profile",
  authenticate,
  userController.profile
);

router.put(
    "/profile",
    authenticate,
    userController.updateProfile
);

export default router;