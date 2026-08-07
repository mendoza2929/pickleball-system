export interface CreateCourtScheduleInput {
  court_id: number;
  day_of_week:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  open_time: string;
  close_time: string;
  is_closed?: boolean;
}

export interface UpdateCourtScheduleInput {
  day_of_week?:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  open_time?: string;
  close_time?: string;
  is_closed?: boolean;
}