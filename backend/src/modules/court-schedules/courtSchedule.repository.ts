
import { randomUUID } from "crypto";
import pool from "../../config/database";
import {
  CreateCourtScheduleInput,
  UpdateCourtScheduleInput,
} from "./courtSchedule.validator";

export class CourtScheduleRepository {
  async create(data: CreateCourtScheduleInput) {
    const uuid = randomUUID();

    const [result]: any = await pool.query(
        `
        INSERT INTO court_schedules (
            uuid,
            court_id,
            day_of_week,
            open_time,
            close_time,
            is_closed
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
        uuid,
        data.court_id,
        data.day_of_week,
        data.open_time,
        data.close_time,
        data.is_closed ?? false,
        ]
    );

    return {
        id: result.insertId,
        uuid,
        ...data,
    };
}

  async findAll() {
  const [rows]: any = await pool.query(`
    SELECT
      cs.id,
      cs.uuid,
      cs.court_id,
      c.name AS court_name,
      cs.day_of_week,
      cs.open_time,
      cs.close_time,
      cs.is_closed,
      cs.created_at,
      cs.updated_at
    FROM court_schedules cs
    INNER JOIN courts c
      ON c.id = cs.court_id
    ORDER BY
      cs.court_id,
      FIELD(
        cs.day_of_week,
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      );
  `);

  return rows;
}

 async findByCourt(courtId: number) {
  const [rows]: any = await pool.query(
    `
      SELECT *
      FROM court_schedules
      WHERE court_id = ?
      ORDER BY
        FIELD(
          day_of_week,
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        );
    `,
    [courtId]
  );

  return rows;
}

 async findByCourtAndDay(
  courtId: number,
  day: string
) {
  const [rows]: any = await pool.query(
    `
      SELECT *
      FROM court_schedules
      WHERE court_id = ?
        AND day_of_week = ?
      LIMIT 1
    `,
    [courtId, day]
  );

  return rows[0];
}

async findById(id: number) {
  const [rows]: any = await pool.query(
    `
      SELECT *
      FROM court_schedules
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0];
}

 async update(
  id: number,
  data: UpdateCourtScheduleInput
) {
  await pool.query(
    `
      UPDATE court_schedules
      SET
        day_of_week = ?,
        open_time = ?,
        close_time = ?,
        is_closed = ?
      WHERE id = ?
    `,
    [
      data.day_of_week,
      data.open_time,
      data.close_time,
      data.is_closed,
      id,
    ]
  );

  return this.findById(id);
}

 async delete(id: number) {
  await pool.query(
    `
      DELETE FROM court_schedules
      WHERE id = ?
    `,
    [id]
  );
}


}