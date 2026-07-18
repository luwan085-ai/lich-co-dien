/** Vietnam wall-clock helpers (UTC+7). */

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
