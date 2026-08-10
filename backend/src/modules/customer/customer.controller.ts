import { Request, Response } from "express";

import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";

import {
  createCustomerSchema,
  updateCustomerSchema,
  customerListSchema,
} from "./customer.validator";

import { CustomerService } from "./customer.service";

export class CustomerController {
  private customerService = new CustomerService();

  // =====================================================
  // GET /api/customers
  // =====================================================

  getAll = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const query =
        customerListSchema.parse(req.query);

      const result =
        await this.customerService.findAll({
          search: query.search,
          status: query.status,
          page: query.page,
          limit: query.limit,
        });

      return ApiResponse.success(
        res,
        result,
        "Customers retrieved successfully."
      );
    }
  );

  // =====================================================
  // GET /api/customers/:id
  // =====================================================

  getById = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const customerId = Number(
        req.params.id
      );

      if (
        !Number.isInteger(customerId) ||
        customerId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer ID.",
        });
      }

      const customer =
        await this.customerService.findById(
          customerId
        );

      return ApiResponse.success(
        res,
        customer,
        "Customer retrieved successfully."
      );
    }
  );

  // =====================================================
  // GET /api/customers/uuid/:uuid
  // =====================================================

  getByUuid = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const uuid =
        String(req.params.uuid);

      const customer =
        await this.customerService.findByUuid(
          uuid
        );

      return ApiResponse.success(
        res,
        customer,
        "Customer retrieved successfully."
      );
    }
  );

  // =====================================================
  // POST /api/customers
  // =====================================================

  create = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const data =
        createCustomerSchema.parse(
          req.body
        );

      const customer =
        await this.customerService.create(
          data
        );

      return ApiResponse.success(
        res,
        customer,
        "Customer created successfully.",
        201
      );
    }
  );

  // =====================================================
  // PUT /api/customers/:id
  // =====================================================

  update = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const customerId = Number(
        req.params.id
      );

      if (
        !Number.isInteger(customerId) ||
        customerId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer ID.",
        });
      }

      const data =
        updateCustomerSchema.parse(
          req.body
        );

      const customer =
        await this.customerService.update(
          customerId,
          data
        );

      return ApiResponse.success(
        res,
        customer,
        "Customer updated successfully."
      );
    }
  );

  // =====================================================
  // DELETE /api/customers/:id
  // =====================================================

  delete = asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const customerId = Number(
        req.params.id
      );

      if (
        !Number.isInteger(customerId) ||
        customerId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer ID.",
        });
      }

      await this.customerService.delete(
        customerId
      );

      return ApiResponse.success(
        res,
        null,
        "Customer deleted successfully."
      );
    }
  );
}