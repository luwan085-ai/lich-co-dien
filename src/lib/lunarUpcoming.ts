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

export type HolidayRule =
  | { type: 'solar'; month: number; day: number; label: string }
  | { type: 'lunar'; month: number; day: number; label: string };

export const VIETNAM_HOLIDAYS: HolidayRule[] = [
  // Major Solar Holidays
  { type: 'solar', month: 3, day: 8, label: 'Quốc tế Phụ nữ (8/3)' },
  { type: 'solar', month: 4, day: 30, label: 'Giải phóng miền Nam (30/4)' },
  { type: 'solar', month: 5, day: 1, label: 'Quốc tế Lao động (1/5)' },
  { type: 'solar', month: 9, day: 2, label: 'Quốc khánh Việt Nam (2/9)' },
  { type: 'solar', month: 10, day: 20, label: 'Ngày Phụ nữ Việt Nam (20/10)' },
  { type: 'solar', month: 11, day: 20, label: 'Ngày Nhà giáo Việt Nam (20/11)' },

  // Major Lunar Holidays & Traditional Festivals
  { type: 'lunar', month: 1, day: 1, label: 'Tết Nguyên Đán (Mùng 1 Tết)' },
  { type: 'lunar', month: 1, day: 2, label: 'Mùng 2 Tết' },
  { type: 'lunar', month: 1, day: 3, label: 'Mùng 3 Tết' },
  { type: 'lunar', month: 3, day: 3, label: 'Tết Hàn Thực' },
  { type: 'lunar', month: 3, day: 10, label: 'Giỗ Tổ Hùng Vương (10/3 âm)' },
  { type: 'lunar', month: 5, day: 5, label: 'Tết Đoan Ngọ (5/5 âm)' },
  { type: 'lunar', month: 7, day: 15, label: 'Vu Lan Báo Hiếu (Rằm tháng 7)' },
  { type: 'lunar', month: 8, day: 15, label: 'Tết Trung Thu (Rằm tháng 8)' },
  { type: 'lunar', month: 12, day: 23, label: 'Ông Táo về trời (23 Chạp)' },
];

const SCAN_DAYS = 120;

function scanHolidays(from: SolarDate, max = 6): UpcomingLunarEvent[] {
  const out: UpcomingLunarEvent[] = [];
  for (let i = 0; i < SCAN_DAYS && out.length < max; i += 1) {
    const solar = addSolarDays(from, i);
    const cal = getCalendarDayForSolar(solar, 12);
    const lm = cal.lunar.month;
    const ld = cal.lunar.day;
    const sm = solar.month;
    const sd = solar.day;

    for (const h of VIETNAM_HOLIDAYS) {
      if (h.type === 'solar' && sm === h.month && sd === h.day) {
        out.push({
          kind: 'ram',
          label: h.label,
          daysUntil: daysBetween(from, solar),
          solar,
          personal: false,
        });
      } else if (
        h.type === 'lunar' &&
        lm === h.month &&
        ld === h.day &&
        !cal.lunar.leapMonth
      ) {
        out.push({
          kind: 'ram',
          label: h.label,
          daysUntil: daysBetween(from, solar),
          solar,
          personal: false,
        });
      }
    }
  }
  return out;
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

function formatPersonalLabel(raw: string, kind: AnnivKind): string {
  const t = raw.trim();
  const birthday = kind === 'birthday';
  if (
    !t ||
    t === 'Giỗ âm lịch' ||
    t === 'Sinh nhật âm' ||
    t === 'Sinh nhật âm lịch'
  ) {
    return birthday ? 'Sinh nhật âm lịch' : 'Giỗ âm lịch';
  }
  if (birthday) {
    if (/^sinh nhật/i.test(t)) return t;
    return `Sinh nhật âm lịch · ${t}`;
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

/** Personal lunar dates first, then Major Vietnam Holidays, then Rằm / Mùng Một. */
export async function listUpcomingLunarEvents(
  limit = 5,
): Promise<UpcomingLunarEvent[]> {
  const from = getVietnamSolarToday();
  const map = await loadMemoMap();
  const personal = personalEventsFromMap(map, from).sort(eventSort);
  const holidays = scanHolidays(from, 8).sort(eventSort);
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

  for (const h of holidays) {
    if (picked.length >= limit) break;
    add(h);
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
