/** Vietnam wall-clock helpers (UTC+7, no DST). */

const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

export function getVietnamSolarToday(now = new Date()): {
  year: number;
  month: number;
  day: number;
} {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const pick = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);

  return {
    year: pick('year'),
    month: pick('month'),
    day: pick('day'),
  };
}

export function getVietnamHour(now = new Date()): number {
  const hour = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    hour12: false,
  }).format(now);
  return Number(hour);
}

/**
 * Instant corresponding to Vietnam local Y-M-D HH:mm:ss.
 * Prefer this over `new Date(y, m-1, d, h)` so reminders fire at 7:30 VN
 * even when the device TZ is not Asia/Ho_Chi_Minh.
 */
export function vietnamWallClockDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
  second = 0,
): Date {
  return new Date(
    Date.UTC(year, month - 1, day, hour, minute, second) - VN_OFFSET_MS,
  );
}
