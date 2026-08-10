import { DashboardRepository } from "./dashboard.repository";

export class DashboardService {
  private dashboardRepository =
    new DashboardRepository();

  async getDashboard() {
    const [
      stats,
      schedule,
      courts,
      recentReservations,
    ] = await Promise.all([
      this.dashboardRepository.getStats(),
      this.dashboardRepository.getTodaySchedule(),
      this.dashboardRepository.getCourtStatus(),
      this.dashboardRepository.getRecentReservations(),
    ]);

    return {
      stats,
      schedule,
      courts,
      recentReservations,
    };
  }
}