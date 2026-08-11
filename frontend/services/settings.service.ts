import api from "@/lib/api";

import {
  GeneralSettings,
  UpdateGeneralSettingsInput,

  BookingRules,
  UpdateBookingRulesInput,

  NotificationSettings,
  UpdateNotificationSettingsInput,
} from "@/types/settings";


// =====================================================
// GENERAL
// =====================================================

export const getGeneralSettings =
  async (): Promise<GeneralSettings> => {

    const response =
      await api.get(
        "/settings/general"
      );

    return response.data.data;
  };


export const updateGeneralSettings =
  async (
    data: UpdateGeneralSettingsInput
  ): Promise<GeneralSettings> => {

    const response =
      await api.put(
        "/settings/general",
        data
      );

    return response.data.data;
  };


// =====================================================
// BOOKING RULES
// =====================================================

export const getBookingRules =
  async (): Promise<BookingRules> => {

    const response =
      await api.get(
        "/settings/booking-rules"
      );

    return response.data.data;
  };


export const updateBookingRules =
  async (
    data: UpdateBookingRulesInput
  ): Promise<BookingRules> => {

    const response =
      await api.put(
        "/settings/booking-rules",
        data
      );

    return response.data.data;
  };


// =====================================================
// NOTIFICATIONS
// =====================================================

export const getNotificationSettings =
  async (): Promise<NotificationSettings> => {

    const response =
      await api.get(
        "/settings/notifications"
      );

    return response.data.data;
  };


export const updateNotificationSettings =
  async (
    data: UpdateNotificationSettingsInput
  ): Promise<NotificationSettings> => {

    const response =
      await api.put(
        "/settings/notifications",
        data
      );

    return response.data.data;
  };