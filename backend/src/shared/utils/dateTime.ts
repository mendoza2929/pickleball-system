export function calculateHours(
  start: string,
  end: string
): number {

  const [sh, sm] = start.split(":").map(Number);

  const [eh, em] = end.split(":").map(Number);

  const startMinutes = sh * 60 + sm;

  const endMinutes = eh * 60 + em;

  return (endMinutes - startMinutes) / 60;
}