const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function getDayOfWeek(date: string) {
  return DAYS[new Date(date).getDay()];
}