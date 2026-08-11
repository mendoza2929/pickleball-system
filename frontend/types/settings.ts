// =====================================================
// GENERAL SETTINGS
// =====================================================

export interface GeneralSettings {
  id: number;

  business_name: string;

  contact_number: string | null;

  email: string | null;

  address: string | null;

  created_at?: string;

  updated_at?: string;
}


export interface UpdateGeneralSettingsInput {
  business_name: string;

  contact_number?: string;

  email?: string;

  address?: string;
}


// =====================================================
// BOOKING RULES
// =====================================================

export interface BookingRules {
  min_booking_duration_hours: number;

  max_booking_duration_hours: number;

  booking_interval_minutes: number;

  advance_booking_days: number;

  allow_same_day_booking: boolean;

  allow_cancellation: boolean;

  cancellation_deadline_hours: number;

  created_at?: string;

  updated_at?: string;
}


export interface UpdateBookingRulesInput {
  min_booking_duration_hours: number;

  max_booking_duration_hours: number;

  booking_interval_minutes: number;

  advance_booking_days: number;

  allow_same_day_booking: boolean;

  allow_cancellation: boolean;

  cancellation_deadline_hours: number;
}


// =====================================================
// NOTIFICATION SETTINGS
// =====================================================

export interface NotificationSettings {

  id: number;


  // -------------------------------------------------
  // RESERVATIONS
  // -------------------------------------------------

  reservation_created_admin: boolean;

  reservation_confirmed_customer: boolean;

  reservation_cancelled_customer: boolean;

  reservation_completed_customer: boolean;


  // -------------------------------------------------
  // PAYMENTS
  // -------------------------------------------------

  payment_submitted_admin: boolean;

  payment_approved_customer: boolean;

  payment_rejected_customer: boolean;


  created_at?: string;

  updated_at?: string;
}


export interface UpdateNotificationSettingsInput {

  reservation_created_admin: boolean;

  reservation_confirmed_customer: boolean;

  reservation_cancelled_customer: boolean;

  reservation_completed_customer: boolean;

  payment_submitted_admin: boolean;

  payment_approved_customer: boolean;

  payment_rejected_customer: boolean;
}