export function timeToMinutes(time: string): number {
    const [hour, minute] = time.split(":").map(Number);

    return hour * 60 + minute;
}