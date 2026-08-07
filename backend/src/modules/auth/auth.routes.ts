import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticate } from "../../middleware/authenticate";
const router = Router();
const authController = new AuthController();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get(
    "/me",
    authenticate,
    authController.me
);
export default router;