import bcrypt from "bcrypt";

import {
  UserRepository,
} from "./user.repository";

import {
  UpdateProfileInput,
  ChangePasswordInput,
} from "./user.validator";

import {
  NotFoundError,
} from "../../shared/errors/NotFoundError";

import {
  BadRequestError,
} from "../../shared/errors/BadRequestError";


export class UserService {

  private userRepository =
    new UserRepository();


  // =====================================================
  // GET PROFILE
  // =====================================================

  async getProfile(
    userId: number
  ) {

    const user =
      await this.userRepository
        .findById(userId);

    if (!user) {

      throw new NotFoundError(
        "User not found."
      );

    }

    return user;
  }


  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  async updateProfile(
    userId: number,
    data: UpdateProfileInput
  ) {

    const user =
      await this.userRepository
        .findById(userId);

    if (!user) {

      throw new NotFoundError(
        "User not found."
      );

    }

    return this.userRepository
      .updateProfile(
        userId,
        data
      );
  }


  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  async changePassword(
    userId: number,
    data: ChangePasswordInput
  ) {

    // -------------------------------------------------
    // Get current password hash
    // -------------------------------------------------

    const user =
      await this.userRepository
        .findPasswordById(
          userId
        );


    if (!user) {

      throw new NotFoundError(
        "User not found."
      );

    }


    // -------------------------------------------------
    // Make sure password hash exists
    // -------------------------------------------------

    if (
      !user.password_hash ||
      typeof user.password_hash !== "string"
    ) {

      throw new BadRequestError(
        "This account does not have a valid password."
      );

    }


    // -------------------------------------------------
    // Validate current password
    // -------------------------------------------------

    const passwordMatches =
      await bcrypt.compare(
        data.current_password,
        user.password_hash
      );


    if (!passwordMatches) {

      throw new BadRequestError(
        "Current password is incorrect."
      );

    }


    // -------------------------------------------------
    // Prevent using the same password
    // -------------------------------------------------

    const samePassword =
      await bcrypt.compare(
        data.new_password,
        user.password_hash
      );


    if (samePassword) {

      throw new BadRequestError(
        "New password must be different from your current password."
      );

    }


    // -------------------------------------------------
    // Hash new password
    // -------------------------------------------------

    const newPasswordHash =
      await bcrypt.hash(
        data.new_password,
        10
      );


    // -------------------------------------------------
    // Save new password
    // -------------------------------------------------

    await this.userRepository
      .updatePassword(
        userId,
        newPasswordHash
      );


    return true;
  }

}