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
  const [year, month, day] = date
    .split("-")
    .map(Number);

  const localDate = new Date(
    year,
    month - 1,
    day
  );

  return DAYS[localDate.getDay()];
}