import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

import { AuthRepository } from "./auth.repository";

import {
  RegisterInput,
  LoginInput,
} from "./auth.validator";

import { ROLES } from "../../constants/roles";

import { ConflictError } from "../../shared/errors/ConflictError";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError";
import { ForbiddenError } from "../../shared/errors/ForbiddenError";

import { generateAccessToken } from "../../shared/utils/jwt";


export class AuthService {
  private authRepository = new AuthRepository();


  // =========================================================
  // REGISTER
  // =========================================================

  async register(data: RegisterInput) {

    // -------------------------------------------------------
    // 1. Check Email
    // -------------------------------------------------------

    const emailExists =
      await this.authRepository.findByEmail(
        data.email
      );

    if (emailExists) {
      throw new ConflictError(
        "Email already exists."
      );
    }


    // -------------------------------------------------------
    // 2. Check Username
    // -------------------------------------------------------

    const usernameExists =
      await this.authRepository.findByUsername(
        data.username
      );

    if (usernameExists) {
      throw new ConflictError(
        "Username already exists."
      );
    }


    // -------------------------------------------------------
    // 3. Hash Password
    // -------------------------------------------------------

    const passwordHash =
      await bcrypt.hash(
        data.password,
        10
      );


    // -------------------------------------------------------
    // 4. Generate UUID
    // -------------------------------------------------------

    const uuid =
      randomUUID();


    // -------------------------------------------------------
    // 5. Create User
    // -------------------------------------------------------

    const userId =
      await this.authRepository.createUser({
        ...data,
        uuid,
        passwordHash,
      });


    // -------------------------------------------------------
    // 6. Assign Player Role
    // -------------------------------------------------------

    await this.authRepository.assignRole(
      userId,
      ROLES.PLAYER
    );


    return {
      id: userId,

      uuid,

      message:
        "User registered successfully.",
    };
  }


  // =========================================================
  // LOGIN
  // =========================================================

  async login(data: LoginInput) {

    // -------------------------------------------------------
    // 1. Find User
    // -------------------------------------------------------

    const user =
      await this.authRepository.findByEmail(
        data.email
      );


    // -------------------------------------------------------
    // 2. Check User
    // -------------------------------------------------------

    if (!user) {
      throw new UnauthorizedError(
        "Invalid email or password."
      );
    }


    // -------------------------------------------------------
    // 3. Check Password
    // -------------------------------------------------------

    const validPassword =
      await bcrypt.compare(
        data.password,
        user.password_hash
      );


    if (!validPassword) {
      throw new UnauthorizedError(
        "Invalid email or password."
      );
    }


    // =======================================================
    // 4. ADMIN PORTAL ROLE CHECK
    // =======================================================

    const allowedRoles = [
      "Owner",
      "Admin",
    ];


    if (
      !allowedRoles.includes(
        user.role_name
      )
    ) {
      throw new ForbiddenError(
        "You do not have permission to access the admin portal."
      );
    }


    // =======================================================
    // 5. GENERATE ACCESS TOKEN
    // =======================================================

    const accessToken =
      generateAccessToken({
        id: user.id,

        uuid: user.uuid,

        email: user.email,

        role_id:
          user.role_id,

        role_name:
          user.role_name,
      });


    // -------------------------------------------------------
    // 6. Update Last Login
    // -------------------------------------------------------

    await this.authRepository.updateLastLogin(
      user.id
    );


    // =======================================================
    // 7. RETURN LOGIN RESPONSE
    // =======================================================

    return {
      accessToken,

      user: {
        id: user.id,

        uuid:
          user.uuid,

        first_name:
          user.first_name,

        last_name:
          user.last_name,

        username:
          user.username,

        email:
          user.email,

        role_id:
          user.role_id,

        role_name:
          user.role_name,
      },
    };
  }
}