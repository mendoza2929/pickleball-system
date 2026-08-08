import pool from "../../database/db";
import { RegisterInput } from "./auth.validator";

export class AuthRepository {
  async findByEmail(email: string) {
    const [rows]: any = await pool.query(
      `
      SELECT
        u.*,
        r.id AS role_id,
        r.name AS role_name
      FROM users u
      LEFT JOIN user_roles ur
        ON ur.user_id = u.id
      LEFT JOIN roles r
        ON r.id = ur.role_id
      WHERE u.email = ?
      LIMIT 1
      `,
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