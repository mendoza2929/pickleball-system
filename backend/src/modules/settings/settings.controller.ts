import {
  Request,
  Response,
} from "express";


import {
  AuthRequest,
} from "../../middleware/authenticate";


import {
  asyncHandler,
} from "../../shared/utils/asyncHandler";


import {
  ApiResponse,
} from "../../utils/apiResponse";


import {
  SettingsService,
} from "./settings.service";


import {
  updateGeneralSettingsSchema,
  updateBookingRulesSchema,
  updateNotificationSettingsSchema,
} from "./settings.validator";


export class SettingsController {

  private settingsService =
    new SettingsService();


  // =====================================================
  // GET GENERAL SETTINGS
  // =====================================================

  getGeneral = asyncHandler(
    async (
      _req: Request,
      res: Response
    ) => {

      const settings =
        await this.settingsService
          .getGeneral();


      return ApiResponse.success(
        res,
        settings,
        "General settings retrieved successfully."
      );

    }
  );


  // =====================================================
  // UPDATE GENERAL SETTINGS
  // =====================================================

  updateGeneral = asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {

      const data =
        updateGeneralSettingsSchema.parse(
          req.body
        );


      const settings =
        await this.settingsService
          .updateGeneral(data);


      return ApiResponse.success(
        res,
        settings,
        "General settings updated successfully."
      );

    }
  );


  // =====================================================
  // GET BOOKING RULES
  // =====================================================

  getBookingRules = asyncHandler(
    async (
      _req: Request,
      res: Response
    ) => {

      const rules =
        await this.settingsService
          .getBookingRules();


      return ApiResponse.success(
        res,
        rules,
        "Booking rules retrieved successfully."
      );

    }
  );


  // =====================================================
  // UPDATE BOOKING RULES
  // =====================================================

  updateBookingRules = asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {

      const data =
        updateBookingRulesSchema.parse(
          req.body
        );


      const rules =
        await this.settingsService
          .updateBookingRules(data);


      return ApiResponse.success(
        res,
        rules,
        "Booking rules updated successfully."
      );

    }
  );


  // =====================================================
  // GET NOTIFICATION SETTINGS
  // =====================================================

  getNotifications = asyncHandler(
    async (
      _req: Request,
      res: Response
    ) => {

      const settings =
        await this.settingsService
          .getNotificationSettings();


      return ApiResponse.success(
        res,
        settings,
        "Notification settings retrieved successfully."
      );

    }
  );


  // =====================================================
  // UPDATE NOTIFICATION SETTINGS
  // =====================================================

  updateNotifications = asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {

      const data =
        updateNotificationSettingsSchema.parse(
          req.body
        );


      const settings =
        await this.settingsService
          .updateNotificationSettings(
            data
          );


      return ApiResponse.success(
        res,
        settings,
        "Notification settings updated successfully."
      );

    }
  );

}