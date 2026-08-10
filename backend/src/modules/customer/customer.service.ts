import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "./customer.validator";

import { CustomerRepository } from "./customer.repository";

import { NotFoundError } from "../../shared/errors/NotFoundError";

export class CustomerService {

  private customerRepository =
    new CustomerRepository();

  // =====================================================
  // CREATE
  // =====================================================

  async create(
    data: CreateCustomerInput
  ) {

    const customer =
      await this.customerRepository.create({
        first_name:
          data.first_name,

        last_name:
          data.last_name,

        email:
          data.email || null,

        phone:
          data.phone || null,

        status:
          data.status,

        notes:
          data.notes || null,
      });

    return customer;
  }

  // =====================================================
  // GET ALL
  // =====================================================

  async findAll(options: {
    search?: string;
    status?: "Active" | "Inactive";
    page: number;
    limit: number;
  }) {

    return this.customerRepository.findAll(
      options
    );
  }

  // =====================================================
  // GET BY ID
  // =====================================================

  async findById(
    customerId: number
  ) {

    const customer =
      await this.customerRepository.findById(
        customerId
      );

    if (!customer) {
      throw new NotFoundError(
        "Customer not found."
      );
    }

    return customer;
  }

  // =====================================================
  // GET BY UUID
  // =====================================================

  async findByUuid(
    uuid: string
  ) {

    const customer =
      await this.customerRepository.findByUuid(
        uuid
      );

    if (!customer) {
      throw new NotFoundError(
        "Customer not found."
      );
    }

    return customer;
  }

  // =====================================================
  // UPDATE
  // =====================================================

  async update(
    customerId: number,
    data: UpdateCustomerInput
  ) {

    await this.findById(
      customerId
    );

    const customer =
      await this.customerRepository.update(
        customerId,
        data
      );

    return customer;
  }

  // =====================================================
  // DELETE
  // =====================================================

  async delete(
    customerId: number
  ) {

    await this.findById(
      customerId
    );

    await this.customerRepository.delete(
      customerId
    );

    return {
      id: customerId,
    };
  }
}