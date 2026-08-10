export interface Reservation {
  id: number;
  uuid: string;
  reservation_no: string;

  user_id: number | null;
  customer_id: number | null;

  court_id: number;

  reservation_date: string;

  start_time: string;
  end_time: string;

  total_hours: number;
  hourly_rate: number;
  total_amount: number;

  reservation_status:
    | "Pending"
    | "Confirmed"
    | "Cancelled"
    | "Completed";

  payment_status:
    | "Unpaid"
    | "Partial"
    | "Paid";

  remarks: string | null;

  created_at: Date;
  updated_at: Date;
}