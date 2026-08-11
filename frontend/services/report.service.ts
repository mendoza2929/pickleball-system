import api from "@/lib/api";

import type {
  ReportOverview,
} from "@/types/report";

export interface ReportOverviewParams {
  date_from?: string;
  date_to?: string;
}

export const getReportOverview =
  async (
    params?: ReportOverviewParams
  ): Promise<ReportOverview> => {

    const response =
      await api.get(
        "/reports/overview",
        {
          params,
        }
      );

    return response.data.data;
  };