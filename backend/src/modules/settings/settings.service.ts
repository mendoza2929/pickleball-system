import {
  SettingsRepository,
} from "./settings.repository";

import {
  UpdateGeneralSettingsInput,
  UpdateBookingRulesInput,
  UpdateNotificationSettingsInput,
} from "./settings.validator";

import {
  NotFoundError,
} from "../../shared/errors/NotFoundError";

import {
  BadRequestError,
} from "../../shared/errors/BadRequestError";


export class SettingsService {

  private settingsRepository =
    new SettingsRepository();


  // =====================================================
  // GENERAL
  // =====================================================

  async getGeneral() {

    const settings =
      await this.settingsRepository
        .getGeneral();


    if (!settings) {

      throw new NotFoundError(
        "General settings not found."
      );

    }


    return settings;
  }


  // =====================================================
  // UPDATE GENERAL
  // =====================================================

  async updateGeneral(
    data: UpdateGeneralSettingsInput
  ) {

    const settings =
      await this.settingsRepository
        .updateGeneral(data);


    if (!settings) {

      throw new NotFoundError(
        "General settings not found."
      );

    }


    return settings;
  }


  // =====================================================
  // BOOKING RULES
  // =====================================================

  async getBookingRules() {

    const rules =
      await this.settingsRepository
        .getBookingRules();


    if (!rules) {

      throw new NotFoundError(
        "Booking rules not found."
      );

    }


    return rules;
  }


  // =====================================================
  // UPDATE BOOKING RULES
  // =====================================================

  async updateBookingRules(
    data: UpdateBookingRulesInput
  ) {

    if (
      data.max_booking_duration_hours <
      data.min_booking_duration_hours
    ) {

      throw new BadRequestError(
        "Maximum booking duration must be greater than or equal to minimum booking duration."
      );

    }


    const rules =
      await this.settingsRepository
        .updateBookingRules(data);


    if (!rules) {

      throw new NotFoundError(
        "Booking rules not found."
      );

    }


    return rules;
  }


  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  async getNotificationSettings() {

    const settings =
      await this.settingsRepository
        .getNotificationSettings();


    if (!settings) {

      throw new NotFoundError(
        "Notification settings not found."
      );

    }


    return settings;
  }


  // =====================================================
  // UPDATE NOTIFICATIONS
  // =====================================================

  async updateNotificationSettings(
    data: UpdateNotificationSettingsInput
  ) {

    const settings =
      await this.settingsRepository
        .updateNotificationSettings(
          data
        );


    if (!settings) {

      throw new NotFoundError(
        "Notification settings not found."
      );

    }


    return settings;
  }

}