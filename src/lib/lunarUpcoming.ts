import { lunarMonthName } from '../lunar/labels';
import { addSolarDays, type SolarDate } from '../lunar/solar';
import { getCalendarDayForSolar } from '../lunar/today';
import { getVietnamSolarToday } from '../lunar/vietnamTime';
import { loadMemoMap, type DayMemo } from './localMemos';
import { dDayLabel, daysBetween, listUpcomingGio } from './gioSchedule';

export type LunarEventKind = 'ram' | 'mung' | 'gio' | 'birthday';

export type UpcomingLunarEvent = {
  kind: LunarEventKind;
  label: string;
  daysUntil: number;
  solar: SolarDate;
  /** Personal saved memo — sort tie-break toward top. */
  personal: boolean;
};

const SCAN_DAYS = 120;

const BIRTHDAY_RE =
  /sinh nhật|sn âm|birthday|thọ|mừng tuổi|tết thọ|ngày sinh/i;

export function isLunarBirthdayMemo(text: string): boolean {
  return BIRTHDAY_RE.test(text.trim());
}

function scanRamMung(from: SolarDate, max = 6): UpcomingLunarEvent[] {
  const out: UpcomingLunarEvent[] = [];
  for (let i = 0; i < SCAN_DAYS && out.length < max; i += 1) {
    const solar = addSolarDays(from, i);
    const cal = getCalendarDayForSolar(solar, 12);
    const ld = cal.lunar.day;
    if (ld !== 1 && ld !== 15) continue;
    const monthName = lunarMonthName(cal.lunar.month);
    const leap = cal.lunar.leapMonth ? ' (nhuận)' : '';
    out.push({
      kind: ld === 1 ? 'mung' : 'ram',
      label:
        ld === 1
          ? `Mùng Một tháng ${monthName}${leap}`
          : `Rằm tháng ${monthName}${leap}`,
      daysUntil: daysBetween(from, solar),
      solar,
      personal: false,
    });
  }
  return out;
}

function personalEventsFromMap(
  map: Record<string, DayMemo>,
  from: SolarDate,
): UpcomingLunarEvent[] {
  return listUpcomingGio(map, from, 8).map((g) => {
    const birthday = isLunarBirthdayMemo(g.label);
    return {
      kind: birthday ? ('birthday' as const) : ('gio' as const),
      label: birthday ? g.label : g.label,
      daysUntil: g.daysUntil,
      solar: g.solar,
      personal: true,
    };
  });
}

function eventSort(a: UpcomingLunarEvent, b: UpcomingLunarEvent): number {
  if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil;
  if (a.personal !== b.personal) return a.personal ? -1 : 1;
  return a.label.localeCompare(b.label, 'vi');
}

/** Personal giỗ / sinh nhật âm + Rằm / Mùng Một — nearest first. */
export async function listUpcomingLunarEvents(
  limit = 4,
): Promise<UpcomingLunarEvent[]> {
  const from = getVietnamSolarToday();
  const map = await loadMemoMap();
  const personal = personalEventsFromMap(map, from);
  const ritual = scanRamMung(from, 6);
  const merged = [...personal, ...ritual].sort(eventSort);

  const picked: UpcomingLunarEvent[] = [];
  const seen = new Set<string>();

  // Ensure up to 2 personal events surface when saved.
  for (const p of personal.slice(0, 2)) {
    const key = `${p.kind}-${p.label}-${p.solar.year}-${p.solar.month}-${p.solar.day}`;
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(p);
  }

  for (const e of merged) {
    if (picked.length >= limit) break;
    const key = `${e.kind}-${e.label}-${e.solar.year}-${e.solar.month}-${e.solar.day}`;
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(e);
  }

  return picked.sort(eventSort).slice(0, limit);
}

/** Nearest personal lunar anniversary (giỗ or sinh nhật âm). */
export async function nearestPersonalLunarEvent(): Promise<UpcomingLunarEvent | null> {
  const from = getVietnamSolarToday();
  const map = await loadMemoMap();
  const personal = personalEventsFromMap(map, from);
  return personal.sort(eventSort)[0] ?? null;
}

export { dDayLabel };
