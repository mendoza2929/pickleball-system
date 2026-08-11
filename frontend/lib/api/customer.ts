import api from "@/lib/api";

// =====================================================
// TYPES
// =====================================================

export type CustomerStatus =
  | "Active"
  | "Inactive";

export interface Customer {
  id: number;
  uuid: string;

  customer_no?: string | null;

  first_name: string;
  last_name: string;

  email: string | null;
  phone: string | null;

  status: CustomerStatus;

  notes?: string | null;

  created_at: string;
  updated_at: string;
}

export interface CustomerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomerListResult {
  customers: Customer[];
  pagination: CustomerPagination;
}

// =====================================================
// GET ALL CUSTOMERS
// =====================================================

export async function getCustomers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
}): Promise<CustomerListResult> {
  const response = await api.get(
    "/customers",
    {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        search:
          params?.search?.trim() || undefined,
        status:
          params?.status || undefined,
      },
    }
  );

  return {
    customers:
      response.data?.data?.customers ?? [],

    pagination: {
      page:
        Number(
          response.data?.data?.pagination?.page
        ) || 1,

      limit:
        Number(
          response.data?.data?.pagination?.limit
        ) || 10,

      total:
        Number(
          response.data?.data?.pagination?.total
        ) || 0,

      totalPages:
        Number(
          response.data?.data?.pagination?.totalPages
        ) || 0,
    },
  };
}

// =====================================================
// GET CUSTOMER BY ID
// =====================================================

export async function getCustomerById(
  id: number
): Promise<Customer> {
  const response = await api.get(
    `/customers/${id}`
  );

  return response.data.data;
}

// =====================================================
// GET CUSTOMER BY UUID
// =====================================================

export async function getCustomerByUuid(
  uuid: string
): Promise<Customer> {
  const response = await api.get(
    `/customers/uuid/${uuid}`
  );

  return response.data.data;
}

// =====================================================
// CREATE CUSTOMER
// =====================================================

export async function createCustomer(data: {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status?: CustomerStatus;
  notes?: string;
}): Promise<Customer> {
  const response = await api.post(
    "/customers",
    data
  );

  return response.data.data;
}

// =====================================================
// UPDATE CUSTOMER
// =====================================================

export async function updateCustomer(
  id: number,
  data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    status?: CustomerStatus;
    notes?: string;
  }
): Promise<Customer> {
  const response = await api.put(
    `/customers/${id}`,
    data
  );

  return response.data.data;
}

// =====================================================
// DELETE CUSTOMER
// =====================================================

export async function deleteCustomer(
  id: number
): Promise<void> {
  await api.delete(
    `/customers/${id}`
  );
}