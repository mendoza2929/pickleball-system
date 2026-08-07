import pool from "../../database/db";
import { RegisterInput } from "./auth.validator";

export class AuthRepository {
  async findByEmail(email: string) {
    const [rows]: any = await pool.query(
      `SELECT * FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    return rows[0];
  }

  async findByUsername(username: string) {
    const [rows]: any = await pool.query(
      `SELECT * FROM users WHERE username = ? LIMIT 1`,
      [username]
    );

    return rows[0];
  }

  async createUser(user: RegisterInput & { uuid: string; passwordHash: string }) {
    const [result]: any = await pool.query(
      `
      INSERT INTO users (
        uuid,
        first_name,
        last_name,
        username,
        email,
        password_hash,
        phone
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user.uuid,
        user.first_name,
        user.last_name,
        user.username,
        user.email,
        user.passwordHash,
        user.phone ?? null,
      ]
    );

    return result.insertId;
  }

  async assignRole(userId: number, roleId: number) {
    await pool.query(
      `
      INSERT INTO user_roles (user_id, role_id)
      VALUES (?, ?)
      `,
      [userId, roleId]
    );
  }

  async updateLastLogin(userId: number) {
      await pool.query(
          `
          UPDATE users
          SET last_login = NOW()
          WHERE id = ?
          `,
          [userId]
      );
  }
}