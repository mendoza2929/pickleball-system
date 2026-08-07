import api from "@/lib/api";
import { CourtResponse } from "@/types/court";

export const courtService = {
   async getAll() {
    const response =
      await api.get<CourtResponse>("/courts");

    return response.data.data;
  },

  async getById(id: string) {
    const response = await api.get(`/courts/${id}`);

    return response.data.data;
  },
};