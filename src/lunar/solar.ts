export type SolarDate = {
  year: number;
  month: number;
  day: number;
};

export function solarKey(d: SolarDate): string {
  const m = String(d.month).padStart(2, '0');
  const day = String(d.day).padStart(2, '0');
  return `${d.year}-${m}-${day}`;
}

export function parseSolarKey(key: string): SolarDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

export function addSolarDays(d: SolarDate, delta: number): SolarDate {
  const utc = new Date(Date.UTC(d.year, d.month - 1, d.day + delta, 12));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

export function compareSolar(a: SolarDate, b: SolarDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function isSameSolar(a: SolarDate, b: SolarDate): boolean {
  return compareSolar(a, b) === 0;
}
