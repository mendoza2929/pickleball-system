export interface ReportDateRange {
  date_from?: string;
  date_to?: string;
}

export interface RevenueByDate {
  date: string;
  revenue: number;
}

export interface RevenueByCourt {
  court_id: number;
  court_name: string;
  revenue: number;
  reservations: number;
}

export interface PaymentMethodReport {
  payment_method: string;
  amount: number;
  transactions: number;
}

export interface PeakBookingHour {
  hour: number;
  bookings: number;
}

export interface ReportOverview {
  date_from: string;
  date_to: string;

  total_revenue: number;

  total_reservations: number;
  paid_reservations: number;
  pending_reservations: number;
  cancelled_reservations: number;

  revenue_by_date: RevenueByDate[];
  revenue_by_court: RevenueByCourt[];
  payment_methods: PaymentMethodReport[];
  peak_hours: PeakBookingHour[];
}