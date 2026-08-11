import {
  ReportRepository,
} from "./report.repository";

export class ReportService {

  private reportRepository =
    new ReportRepository();


  // =====================================================
  // OVERVIEW
  // =====================================================

  async getOverview(
    dateFrom?: string,
    dateTo?: string
  ) {

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const startDate =
      dateFrom ?? today;

    const endDate =
      dateTo ?? today;


    if (startDate > endDate) {
      throw new Error(
        "date_from cannot be greater than date_to."
      );
    }


    const [
      overview,
      revenueByDate,
      revenueByCourt,
      paymentMethods,
      peakHours,
    ] = await Promise.all([

      this.reportRepository.getOverview(
        startDate,
        endDate
      ),

      this.reportRepository.getRevenueByDate(
        startDate,
        endDate
      ),

      this.reportRepository.getRevenueByCourt(
        startDate,
        endDate
      ),

      this.reportRepository.getPaymentMethods(
        startDate,
        endDate
      ),

      this.reportRepository.getPeakHours(
        startDate,
        endDate
      ),

    ]);


    return {

      date_from:
        startDate,

      date_to:
        endDate,

      total_revenue:
        Number(
          overview?.total_revenue ?? 0
        ),

      total_reservations:
        Number(
          overview?.total_reservations ?? 0
        ),

      paid_reservations:
        Number(
          overview?.paid_reservations ?? 0
        ),

      pending_reservations:
        Number(
          overview?.pending_reservations ?? 0
        ),

      cancelled_reservations:
        Number(
          overview?.cancelled_reservations ?? 0
        ),

      revenue_by_date:
        revenueByDate.map(
          (item: any) => ({
            date:
              item.date,

            revenue:
              Number(item.revenue ?? 0),
          })
        ),

      revenue_by_court:
        revenueByCourt.map(
          (item: any) => ({
            court_id:
              Number(item.court_id),

            court_name:
              item.court_name,

            revenue:
              Number(item.revenue ?? 0),

            reservations:
              Number(
                item.reservations ?? 0
              ),
          })
        ),

      payment_methods:
        paymentMethods.map(
          (item: any) => ({
            payment_method:
              item.payment_method,

            amount:
              Number(item.amount ?? 0),

            transactions:
              Number(
                item.transactions ?? 0
              ),
          })
        ),

      peak_hours:
        peakHours.map(
          (item: any) => ({
            hour:
              Number(item.hour),

            bookings:
              Number(
                item.bookings ?? 0
              ),
          })
        ),

    };
  }
}