export interface Court {
  id: number;
  uuid: string;
  court_number: number;
  name: string;
  description: string | null;
  surface_type: string;
  hourly_rate: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CourtResponse {
  success: boolean;
  data: Court[];
}