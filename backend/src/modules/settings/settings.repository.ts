import pool from "../../config/database";

export class SettingsRepository {

  // =====================================================
  // GENERAL
  // =====================================================

  async getGeneral() {

    const [rows]: any =
      await pool.query(
        `
        SELECT
          id,
          business_name,
          contact_number,
          email,
          address,
          created_at,
          updated_at
        FROM business_settings
        WHERE id = 1
        LIMIT 1
        `
      );

    return rows[0] ?? null;
  }


  async updateGeneral(data: {
    business_name: string;
    contact_number?: string;
    email?: string;
    address?: string;
  }) {

    await pool.query(
      `
      UPDATE business_settings
      SET
        business_name = ?,
        contact_number = ?,
        email = ?,
        address = ?
      WHERE id = 1
      `,
      [
        data.business_name,
        data.contact_number || null,
        data.email || null,
        data.address || null,
      ]
    );

    return this.getGeneral();
  }


  // =====================================================
  // BOOKING RULES
  // =====================================================

  async getBookingRules() {

    const [rows]: any =
      await pool.query(
        `
        SELECT
          min_booking_duration_hours,
          max_booking_duration_hours,
          booking_interval_minutes,
          advance_booking_days,
          allow_same_day_booking,
          allow_cancellation,
          cancellation_deadline_hours
        FROM business_settings
        WHERE id = 1
        LIMIT 1
        `
      );

    return rows[0] ?? null;
  }


  async updateBookingRules(data: {
    min_booking_duration_hours: number;
    max_booking_duration_hours: number;
    booking_interval_minutes: number;
    advance_booking_days: number;
    allow_same_day_booking: boolean;
    allow_cancellation: boolean;
    cancellation_deadline_hours: number;
  }) {

    await pool.query(
      `
      UPDATE business_settings
      SET
        min_booking_duration_hours = ?,
        max_booking_duration_hours = ?,
        booking_interval_minutes = ?,
        advance_booking_days = ?,
        allow_same_day_booking = ?,
        allow_cancellation = ?,
        cancellation_deadline_hours = ?
      WHERE id = 1
      `,
      [
        data.min_booking_duration_hours,
        data.max_booking_duration_hours,
        data.booking_interval_minutes,
        data.advance_booking_days,
        data.allow_same_day_booking,
        data.allow_cancellation,
        data.cancellation_deadline_hours,
      ]
    );

    return this.getBookingRules();
  }


  // =====================================================
  // NOTIFICATION SETTINGS
  // =====================================================

  async getNotificationSettings() {

    const [rows]: any =
      await pool.query(
        `
        SELECT
          id,

          reservation_created_admin,
          reservation_confirmed_customer,
          reservation_cancelled_customer,
          reservation_completed_customer,

          payment_submitted_admin,
          payment_approved_customer,
          payment_rejected_customer,

          created_at,
          updated_at

        FROM notification_settings

        WHERE id = 1

        LIMIT 1
        `
      );

    const settings = rows[0];

    if (!settings) {
      return null;
    }

    // MySQL BOOLEAN/TINYINT(1) -> JavaScript boolean

    return {
      id: settings.id,

      reservation_created_admin:
        Boolean(settings.reservation_created_admin),

      reservation_confirmed_customer:
        Boolean(settings.reservation_confirmed_customer),

      reservation_cancelled_customer:
        Boolean(settings.reservation_cancelled_customer),

      reservation_completed_customer:
        Boolean(settings.reservation_completed_customer),

      payment_submitted_admin:
        Boolean(settings.payment_submitted_admin),

      payment_approved_customer:
        Boolean(settings.payment_approved_customer),

      payment_rejected_customer:
        Boolean(settings.payment_rejected_customer),

      created_at:
        settings.created_at,

      updated_at:
        settings.updated_at,
    };
  }


  // =====================================================
  // UPDATE NOTIFICATION SETTINGS
  // =====================================================

  async updateNotificationSettings(
    data: {
      reservation_created_admin: boolean;
      reservation_confirmed_customer: boolean;
      reservation_cancelled_customer: boolean;
      reservation_completed_customer: boolean;

      payment_submitted_admin: boolean;
      payment_approved_customer: boolean;
      payment_rejected_customer: boolean;
    }
  ) {

    await pool.query(
      `
      UPDATE notification_settings
      SET
        reservation_created_admin = ?,
        reservation_confirmed_customer = ?,
        reservation_cancelled_customer = ?,
        reservation_completed_customer = ?,

        payment_submitted_admin = ?,
        payment_approved_customer = ?,
        payment_rejected_customer = ?

      WHERE id = 1
      `,
      [
        data.reservation_created_admin
          ? 1
          : 0,

        data.reservation_confirmed_customer
          ? 1
          : 0,

        data.reservation_cancelled_customer
          ? 1
          : 0,

        data.reservation_completed_customer
          ? 1
          : 0,

        data.payment_submitted_admin
          ? 1
          : 0,

        data.payment_approved_customer
          ? 1
          : 0,

        data.payment_rejected_customer
          ? 1
          : 0,
      ]
    );

    return this.getNotificationSettings();
  }

}