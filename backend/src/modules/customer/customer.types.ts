export interface Customer {
  id: number;
  uuid: string;
  customer_no: string;

  first_name: string;
  last_name: string;

  email: string | null;
  phone: string | null;

  status: "Active" | "Inactive";

  notes: string | null;

  created_at: Date;
  updated_at: Date;
}

export interface CustomerListQuery {
  search?: string;
  status?: "Active" | "Inactive";
  page?: number;
  limit?: number;
}