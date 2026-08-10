import api from "@/lib/api";

// =====================================================
// CUSTOMER
// =====================================================

export interface Customer {
  id: number;
  uuid: string;

  first_name: string;
  last_name: string;

  email: string | null;
  phone: string | null;

  status: "Active" | "Inactive";

  created_at: string;
  updated_at: string;
}

// =====================================================
// CUSTOMER LIST RESULT
// =====================================================

export interface CustomerListResult {
  customers: Customer[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =====================================================
// CUSTOMER RESPONSE
// =====================================================

interface CustomerResponse {
  success: boolean;
  message: string;
  data: Customer;
}

// =====================================================
// CREATE CUSTOMER PAYLOAD
// =====================================================

export interface CreateCustomerPayload {
  first_name: string;
  last_name: string;

  email?: string;
  phone?: string;

  status?: "Active" | "Inactive";
}

// =====================================================
// GET CUSTOMERS
// GET /api/customers
// =====================================================

export async function getCustomers(
  params?: {
    search?: string;
    status?: "Active" | "Inactive";
    page?: number;
    limit?: number;
  }
): Promise<CustomerListResult> {
  const response = await api.get(
    "/customers",
    {
      params,
    }
  );

  return response.data.data;
}

// =====================================================
// GET CUSTOMER BY ID
// GET /api/customers/:id
// =====================================================

export async function getCustomerById(
  id: number
): Promise<Customer> {
  const response =
    await api.get<CustomerResponse>(
      `/customers/${id}`
    );

  return response.data.data;
}

// =====================================================
// GET CUSTOMER BY UUID
// GET /api/customers/uuid/:uuid
// =====================================================

export async function getCustomerByUuid(
  uuid: string
): Promise<Customer> {
  const response =
    await api.get<CustomerResponse>(
      `/customers/uuid/${uuid}`
    );

  return response.data.data;
}

// =====================================================
// CREATE CUSTOMER
// POST /api/customers
// =====================================================

export async function createCustomer(
  payload: CreateCustomerPayload
): Promise<Customer> {
  const response =
    await api.post<CustomerResponse>(
      "/customers",
      payload
    );

  return response.data.data;
}