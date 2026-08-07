import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { AuthRepository } from "./auth.repository";
import { RegisterInput } from "./auth.validator";
import { LoginInput } from "./auth.validator";
import { ROLES } from "../../constants/roles";
import { ConflictError } from "../../shared/errors/ConflictError";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError";
import { generateAccessToken } from "../../shared/utils/jwt";

export class AuthService {
  private authRepository = new AuthRepository();

  async register(data: RegisterInput) {
    // 1. Check email
    const emailExists = await this.authRepository.findByEmail(data.email);

    if (emailExists) {
      throw new ConflictError("Email already exists.");
    }

    // 2. Check username
    const usernameExists = await this.authRepository.findByUsername(data.username);

    if (usernameExists) {
      throw new Error("Username already exists.");
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // 4. Generate UUID
    const uuid = randomUUID();

    // 5. Save user
    const userId = await this.authRepository.createUser({
      ...data,
      uuid,
      passwordHash,
    });

    // 6. Assign Player role
    await this.authRepository.assignRole(userId, ROLES.PLAYER);

    return {
      id: userId,
      uuid,
      message: "User registered successfully.",
    };
  }

    async login(data: LoginInput) {
      const user = await this.authRepository.findByEmail(data.email);

      if (!user) {
          throw new UnauthorizedError("Invalid email or password.");
      }

      const validPassword = await bcrypt.compare(
          data.password,
          user.password_hash
      );

      if (!validPassword) {
          throw new UnauthorizedError("Invalid email or password.");
      }

      const accessToken = generateAccessToken({
          id: user.id,
          uuid: user.uuid,
          email: user.email,
      });

      await this.authRepository.updateLastLogin(user.id);

      return {
          accessToken,
          user: {
              id: user.id,
              uuid: user.uuid,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
          },
      };
  }
}