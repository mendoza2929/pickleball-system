export interface Court {
  id: number;
  uuid: string;
  court_number: number;
  name: string;
  description: string | null;
  surface_type: "Indoor" | "Outdoor" | "Synthetic" | "Concrete";
  hourly_rate: number;
  status: "Available" | "Maintenance" | "Inactive";
  is_deleted: number;
  created_at: Date;
  updated_at: Date;
}