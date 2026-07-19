import type { AnnivKind, DayMemo, LunarAnniv } from './localMemos';
import { hydrateMemo, memoMatchesLunar, annivKindOnLunar } from './localMemos';
import { posterSummaryBar, statusDigestLine } from './dayDigest';
import type { CalendarDay } from '../lunar/today';
import { solarKey, type SolarDate } from '../lunar/solar';
import { getVietnamSolarToday } from '../lunar/vietnamTime';
import { isSameSolar } from '../lunar/solar';

export type MonthPersonalEvent = {
  kind: AnnivKind;
  label: string;
};

export function personalEventOnLunar(
  map: Record<string, DayMemo>,
  lunar: LunarAnniv,
): MonthPersonalEvent | null {
  const kind = annivKindOnLunar(map, lunar);
  if (!kind) return null;
  for (const [key, raw] of Object.entries(map)) {
    const memo = hydrateMemo(key, raw);
    if (memoMatchesLunar(memo, lunar) && memo.text.trim()) {
      return { kind, label: memo.text.trim().slice(0, 42) };
    }
  }
  return {
    kind,
    label: kind === 'birthday' ? 'Sinh nhật âm' : 'Giỗ âm lịch',
  };
}

export function personalEventLine(
  event: MonthPersonalEvent | null,
  solar: SolarDate,
): string {
  if (!event) {
    return 'Không có giỗ/sinh nhật trong ngày này';
  }
  const today = getVietnamSolarToday();
  const suffix = isSameSolar(solar, today) ? ' · hôm nay' : '';
  const prefix = event.kind === 'birthday' ? 'Sinh nhật' : 'Giỗ';
  if (event.label === 'Sinh nhật âm' || event.label === 'Giỗ âm lịch') {
    return `${prefix} âm${suffix}`;
  }
  return `${prefix} ${event.label}${suffix}`;
}

export type MonthSelectedSummary = {
  headline: string;
  statusLine: string;
  personalLine: string;
  actionLine: string;
};

export function buildMonthSelectedSummary(
  day: CalendarDay,
  map: Record<string, DayMemo>,
): MonthSelectedSummary {
  const leap = day.lunar.leapMonth ? ' nhuận' : '';
  const headline = `${day.weekdayVi} ${day.solar.day}/${day.solar.month} · Âm ${day.lunar.day}/${day.lunar.month}${leap}`;
  const personal = personalEventOnLunar(map, {
    month: day.lunar.month,
    day: day.lunar.day,
    leapMonth: day.lunar.leapMonth,
  });

  return {
    headline,
    statusLine: statusDigestLine(day),
    personalLine: personalEventLine(personal, day.solar),
    actionLine: posterSummaryBar(day),
  };
}

export function memoNoteForSolar(
  map: Record<string, DayMemo>,
  solar: SolarDate,
): string | null {
  const memo = map[solarKey(solar)];
  if (!memo?.text.trim() || memo.isAnniversary) return null;
  return memo.text.trim().slice(0, 48);
}
