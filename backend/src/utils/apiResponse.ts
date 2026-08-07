import { Response } from "express";

export const successResponse = (
  res: Response,
  message: string,
  data: unknown = null,
  status = 200
) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  status = 500
) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

export class ApiResponse {
  static success(
    res: Response,
    data: unknown,
    message = "Success",
    status = 200
  ) {
    return res.status(status).json({
      success: true,
      message,
      data,
    });
  }
}