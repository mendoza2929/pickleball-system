import api from "@/lib/api";

export interface Court {
  id: number;
  uuid: string;
  name: string;
  description?: string | null;
  hourly_rate: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface CourtsResponse {
  success: boolean;
  message?: string;
  data: Court[];
}

export async function getCourts(): Promise<Court[]> {
  const response =
    await api.get<CourtsResponse>(
      "/courts"
    );

  return response.data.data;
}