import pool from "../../config/database";
import { UpdateProfileInput } from "./user.validator";
export class UserRepository {

  async findById(userId: number) {
    const [rows]: any = await pool.query(
      `
      SELECT
          id,
          uuid,
          first_name,
          last_name,
          username,
          email,
          phone,
          avatar,
          status,
          last_login,
          created_at,
          updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId]
    );

    return rows[0];
  }

  async updateProfile(
        userId: number,
        data: UpdateProfileInput
    ) {
        await pool.query(
            `
            UPDATE users
            SET
                first_name = ?,
                last_name = ?,
                phone = ?
            WHERE id = ?
            `,
            [
                data.first_name,
                data.last_name,
                data.phone,
                userId,
            ]
        );

        return this.findById(userId);
    }

}