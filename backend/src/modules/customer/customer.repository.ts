import { randomUUID } from "crypto";
import pool from "../../config/database";

// =====================================================
// CUSTOMER TYPE
// =====================================================

export interface Customer {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  status: "Active" | "Inactive";
  created_at: Date;
  updated_at: Date;
}

// =====================================================
// CUSTOMER REPOSITORY
// =====================================================

export class CustomerRepository {

  // =====================================================
  // FIND ALL CUSTOMERS
  // =====================================================

  async findAll(params: {
    search?: string;
    status?: "Active" | "Inactive";
    page: number;
    limit: number;
  }) {

    const {
      search,
      status,
      page,
      limit,
    } = params;

    const offset =
      (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];

    // =====================================================
    // SEARCH
    // =====================================================

    if (search?.trim()) {

      conditions.push(`
        (
          first_name LIKE ?
          OR last_name LIKE ?
          OR CONCAT(first_name, ' ', last_name) LIKE ?
          OR email LIKE ?
          OR phone LIKE ?
        )
      `);

      const searchValue =
        `%${search.trim()}%`;

      values.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );
    }

    // =====================================================
    // STATUS
    // =====================================================

    if (status) {

      conditions.push(
        "status = ?"
      );

      values.push(status);
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // =====================================================
    // COUNT
    // =====================================================

    const [countRows]: any =
      await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM customers
        ${whereClause}
        `,
        values
      );

    const total =
      Number(
        countRows[0]?.total ?? 0
      );

    // =====================================================
    // DATA
    // =====================================================

    const [rows]: any =
      await pool.query(
        `
        SELECT
          id,
          uuid,
          first_name,
          last_name,
          email,
          phone,
          status,
          created_at,
          updated_at
        FROM customers
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        `,
        [
          ...values,
          limit,
          offset,
        ]
      );

    return {
      customers:
        rows as Customer[],

      pagination: {
        page,
        limit,
        total,
        totalPages:
          total === 0
            ? 0
            : Math.ceil(
                total / limit
              ),
      },
    };
  }

  // =====================================================
  // FIND BY ID
  // =====================================================

  async findById(
    id: number
  ): Promise<Customer | null> {

    const [rows]: any =
      await pool.query(
        `
        SELECT
          id,
          uuid,
          first_name,
          last_name,
          email,
          phone,
          status,
          created_at,
          updated_at
        FROM customers
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    return (
      rows[0] as
        | Customer
        | undefined
    ) ?? null;
  }

  // =====================================================
  // FIND BY UUID
  // =====================================================

  async findByUuid(
    uuid: string
  ): Promise<Customer | null> {

    const [rows]: any =
      await pool.query(
        `
        SELECT
          id,
          uuid,
          first_name,
          last_name,
          email,
          phone,
          status,
          created_at,
          updated_at
        FROM customers
        WHERE uuid = ?
        LIMIT 1
        `,
        [uuid]
      );

    return (
      rows[0] as
        | Customer
        | undefined
    ) ?? null;
  }

  // =====================================================
  // FIND BY EMAIL
  //
  // USED BY ONLINE RESERVATIONS
  // =====================================================

  async findByEmail(
    email: string
  ): Promise<Customer | null> {

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      return null;
    }

    const [rows]: any =
      await pool.query(
        `
        SELECT
          id,
          uuid,
          first_name,
          last_name,
          email,
          phone,
          status,
          created_at,
          updated_at
        FROM customers
        WHERE LOWER(email) = ?
        LIMIT 1
        `,
        [normalizedEmail]
      );

    return (
      rows[0] as
        | Customer
        | undefined
    ) ?? null;
  }

  // =====================================================
  // FIND BY PHONE
  //
  // USED BY ONLINE RESERVATIONS
  // =====================================================

  async findByPhone(
    phone: string
  ): Promise<Customer | null> {

    const normalizedPhone =
      phone.trim();

    if (!normalizedPhone) {
      return null;
    }

    const [rows]: any =
      await pool.query(
        `
        SELECT
          id,
          uuid,
          first_name,
          last_name,
          email,
          phone,
          status,
          created_at,
          updated_at
        FROM customers
        WHERE phone = ?
        LIMIT 1
        `,
        [normalizedPhone]
      );

    return (
      rows[0] as
        | Customer
        | undefined
    ) ?? null;
  }

async create(data: {
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  status?: "Active" | "Inactive";
  notes?: string | null;
}) {
  const uuid = randomUUID();

  const customerNo = `CUS-${Date.now()}`;

  const [result]: any = await pool.query(
    `
      INSERT INTO customers (
        uuid,
        customer_no,
        first_name,
        last_name,
        email,
        phone,
        status,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      uuid,
      customerNo,
      data.first_name.trim(),
      data.last_name.trim(),
      data.email?.trim() || null,
      data.phone?.trim() || null,
      data.status || "Active",
      data.notes?.trim() || null,
    ]
  );

  return this.findById(result.insertId);
}

  // =====================================================
  // UPDATE CUSTOMER
  // =====================================================

  async update(
    id: number,
    data: {
      first_name?: string;
      last_name?: string;
      email?: string | null;
      phone?: string | null;
      status?: "Active" | "Inactive";
    }
  ): Promise<Customer | null> {

    const fields: string[] = [];
    const values: any[] = [];

    if (
      data.first_name !==
      undefined
    ) {

      fields.push(
        "first_name = ?"
      );

      values.push(
        data.first_name.trim()
      );
    }

    if (
      data.last_name !==
      undefined
    ) {

      fields.push(
        "last_name = ?"
      );

      values.push(
        data.last_name.trim()
      );
    }

    if (
      data.email !==
      undefined
    ) {

      fields.push(
        "email = ?"
      );

      values.push(
        data.email
          ? data.email
              .trim()
              .toLowerCase()
          : null
      );
    }

    if (
      data.phone !==
      undefined
    ) {

      fields.push(
        "phone = ?"
      );

      values.push(
        data.phone
          ? data.phone.trim()
          : null
      );
    }

    if (
      data.status !==
      undefined
    ) {

      fields.push(
        "status = ?"
      );

      values.push(
        data.status
      );
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    await pool.query(
      `
      UPDATE customers
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      values
    );

    return this.findById(id);
  }

  // =====================================================
  // DELETE CUSTOMER
  // =====================================================

  async delete(
    id: number
  ): Promise<void> {

    await pool.query(
      `
      DELETE FROM customers
      WHERE id = ?
      `,
      [id]
    );
  }
}