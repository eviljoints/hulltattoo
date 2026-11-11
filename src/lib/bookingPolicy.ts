export const BOOKING_TIMEZONE = "Europe/London";
export const BOOKING_NOTICE_DAYS = 3;

export function londonBookingDay(value: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value instanceof Date ? value : new Date(value));
}

export function earliestBookingDay(now = new Date()): string {
  const day = new Date(`${londonBookingDay(now)}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() + BOOKING_NOTICE_DAYS);
  return day.toISOString().slice(0, 10);
}

export function meetsBookingNotice(start?: string, now = new Date()): boolean {
  if (!start || !Number.isFinite(Date.parse(start))) return false;
  return londonBookingDay(start) >= earliestBookingDay(now);
}
