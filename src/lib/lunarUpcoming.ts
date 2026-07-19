import { lunarMonthName } from '../lunar/labels';
import { addSolarDays, type SolarDate } from '../lunar/solar';
import { getCalendarDayForSolar } from '../lunar/today';
import { getVietnamSolarToday } from '../lunar/vietnamTime';
import { loadMemoMap, type DayMemo } from './localMemos';
import { dDayLabel, daysBetween, listUpcomingGio } from './gioSchedule';
import type { AnnivKind } from './localMemos';

export type LunarEventKind = 'ram' | 'mung' | 'gio' | 'birthday';

export type UpcomingLunarEvent = {
  kind: LunarEventKind;
  label: string;
  daysUntil: number;
  solar: SolarDate;
  /** Personal saved memo — sort tie-break toward top. */
  personal: boolean;
  annivKind?: AnnivKind;
};

const SCAN_DAYS = 120;

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

function formatPersonalLabel(raw: string, kind: AnnivKind): string {
  const t = raw.trim();
  const birthday = kind === 'birthday';
  if (!t || t === 'Giỗ âm lịch' || t === 'Sinh nhật âm') {
    return birthday ? 'Sinh nhật âm' : 'Giỗ âm lịch';
  }
  if (birthday) {
    if (/^sinh nhật/i.test(t)) return t;
    return `Sinh nhật âm · ${t}`;
  }
  if (/^giỗ\b/i.test(t)) return t;
  return `Giỗ ${t}`;
}

function personalEventsFromMap(
  map: Record<string, DayMemo>,
  from: SolarDate,
): UpcomingLunarEvent[] {
  return listUpcomingGio(map, from, 12).map((g) => {
    const birthday = g.annivKind === 'birthday';
    return {
      kind: birthday ? ('birthday' as const) : ('gio' as const),
      label: formatPersonalLabel(g.label, g.annivKind),
      daysUntil: g.daysUntil,
      solar: g.solar,
      personal: true,
      annivKind: g.annivKind,
    };
  });
}

function eventSort(a: UpcomingLunarEvent, b: UpcomingLunarEvent): number {
  if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil;
  if (a.personal !== b.personal) return a.personal ? -1 : 1;
  return a.label.localeCompare(b.label, 'vi');
}

/** Personal giỗ / sinh nhật âm first, then Rằm / Mùng Một. */
export async function listUpcomingLunarEvents(
  limit = 4,
): Promise<UpcomingLunarEvent[]> {
  const from = getVietnamSolarToday();
  const map = await loadMemoMap();
  const personal = personalEventsFromMap(map, from).sort(eventSort);
  const ritual = scanRamMung(from, 8).sort(eventSort);

  const picked: UpcomingLunarEvent[] = [];
  const seen = new Set<string>();

  const add = (e: UpcomingLunarEvent) => {
    const key = `${e.kind}-${e.label}-${e.solar.year}-${e.solar.month}-${e.solar.day}`;
    if (seen.has(key)) return;
    seen.add(key);
    picked.push(e);
  };

  for (const p of personal) {
    if (picked.length >= limit) break;
    add(p);
  }

  for (const r of ritual) {
    if (picked.length >= limit) break;
    add(r);
  }

  return picked;
}

/** Nearest personal lunar anniversary (giỗ or sinh nhật âm). */
export async function nearestPersonalLunarEvent(): Promise<UpcomingLunarEvent | null> {
  const from = getVietnamSolarToday();
  const map = await loadMemoMap();
  const personal = personalEventsFromMap(map, from);
  return personal.sort(eventSort)[0] ?? null;
}

export { dDayLabel };
