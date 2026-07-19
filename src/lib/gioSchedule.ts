import AsyncStorage from '@react-native-async-storage/async-storage';
import { lunarToSolar } from '@baostudio/viet-lunar';
import {
  addSolarDays,
  compareSolar,
  type SolarDate,
} from '../lunar/solar';
import {
  getVietnamSolarToday,
  vietnamWallClockDate,
} from '../lunar/vietnamTime';
import {
  hydrateMemo,
  loadMemoMap,
  lunarAnnivKey,
  type DayMemo,
  type LunarAnniv,
} from './localMemos';

const ADVANCE_KEY = 'lich_gio_advance_days_v1';

export type GioAdvanceDays = 0 | 1 | 3 | 7;

export const GIO_ADVANCE_OPTIONS: {
  value: GioAdvanceDays;
  label: string;
}[] = [
  { value: 0, label: 'Chỉ ngày giỗ' },
  { value: 1, label: '1 ngày trước' },
  { value: 3, label: '3 ngày trước' },
  { value: 7, label: '7 ngày trước' },
];

export type GioItem = {
  lunar: LunarAnniv;
  label: string;
  /** Solar dateKey where memo was first saved */
  dateKey: string;
};

export type GioOccurrence = {
  lunar: LunarAnniv;
  solar: SolarDate;
  label: string;
  daysUntil: number;
  lunarLabel: string;
  dateKey: string;
};

export function formatLunarLabel(l: LunarAnniv): string {
  const leap = l.leapMonth ? ' nhuận' : '';
  return `âm ${l.day}/${l.month}${leap}`;
}

export function formatSolarShort(s: SolarDate): string {
  const d = String(s.day).padStart(2, '0');
  const m = String(s.month).padStart(2, '0');
  return `${d}/${m}/${s.year}`;
}

export function daysBetween(from: SolarDate, to: SolarDate): number {
  const a = Date.UTC(from.year, from.month - 1, from.day);
  const b = Date.UTC(to.year, to.month - 1, to.day);
  return Math.round((b - a) / 86400000);
}

function parseAdvance(raw: string | null): GioAdvanceDays {
  const n = Number(raw);
  if (n === 0 || n === 1 || n === 3 || n === 7) return n;
  return 1;
}

export async function loadGioAdvanceDays(): Promise<GioAdvanceDays> {
  try {
    return parseAdvance(await AsyncStorage.getItem(ADVANCE_KEY));
  } catch {
    return 1;
  }
}

export async function setGioAdvanceDays(days: GioAdvanceDays): Promise<void> {
  await AsyncStorage.setItem(ADVANCE_KEY, String(days));
}

/** Convert lunar anniversary in lunar year `y` → solar. Null if leap month invalid. */
export function solarForLunarYear(
  lunar: LunarAnniv,
  lunarYear: number,
): SolarDate | null {
  try {
    return lunarToSolar({
      year: lunarYear,
      month: lunar.month,
      day: lunar.day,
      leapMonth: lunar.leapMonth,
    });
  } catch {
    return null;
  }
}

export function listUniqueGio(map: Record<string, DayMemo>): GioItem[] {
  const seen = new Set<string>();
  const out: GioItem[] = [];
  for (const [dateKey, raw] of Object.entries(map)) {
    const memo = hydrateMemo(dateKey, raw);
    if (!memo.isAnniversary || !memo.lunar) continue;
    const id = lunarAnnivKey(memo.lunar);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      lunar: memo.lunar,
      label: memo.text.trim() || 'Giỗ âm lịch',
      dateKey,
    });
  }
  return out;
}

export function labelForLunarGio(
  map: Record<string, DayMemo>,
  lunar: LunarAnniv,
): string {
  const id = lunarAnnivKey(lunar);
  for (const [key, raw] of Object.entries(map)) {
    const memo = hydrateMemo(key, raw);
    if (
      memo.isAnniversary &&
      memo.lunar &&
      lunarAnnivKey(memo.lunar) === id &&
      memo.text.trim()
    ) {
      return memo.text.trim().slice(0, 80);
    }
  }
  return 'Nhớ chuẩn bị lễ giỗ theo âm lịch.';
}

/** Next solar date on or after `from` for this lunar giỗ. */
export function nextOccurrence(
  lunar: LunarAnniv,
  from: SolarDate = getVietnamSolarToday(),
  searchYears = 5,
): Omit<GioOccurrence, 'label' | 'dateKey'> | null {
  for (let y = from.year - 1; y <= from.year + searchYears; y += 1) {
    const solar = solarForLunarYear(lunar, y);
    if (!solar) continue;
    if (compareSolar(solar, from) >= 0) {
      return {
        lunar,
        solar,
        daysUntil: daysBetween(from, solar),
        lunarLabel: formatLunarLabel(lunar),
      };
    }
  }
  return null;
}

export function listUpcomingGio(
  map: Record<string, DayMemo>,
  from: SolarDate = getVietnamSolarToday(),
  limit = 50,
): GioOccurrence[] {
  const items = listUniqueGio(map);
  const occurrences: GioOccurrence[] = [];
  for (const item of items) {
    const next = nextOccurrence(item.lunar, from);
    if (!next) continue;
    occurrences.push({
      ...next,
      label: item.label,
      dateKey: item.dateKey,
    });
  }
  occurrences.sort((a, b) => {
    if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil;
    return compareSolar(a.solar, b.solar);
  });
  return occurrences.slice(0, limit);
}

/** Future occurrence solar dates within lunar-year window (notifications + dedupe). */
export function listFutureOccurrenceSolars(
  lunar: LunarAnniv,
  startYear: number,
  endYear: number,
  after = new Date(),
): SolarDate[] {
  const out: SolarDate[] = [];
  for (let y = startYear; y <= endYear; y += 1) {
    const solar = solarForLunarYear(lunar, y);
    if (!solar) continue;
    const fire = vietnamWallClockDate(
      solar.year,
      solar.month,
      solar.day,
      7,
      30,
    );
    if (fire.getTime() > after.getTime()) {
      out.push(solar);
    }
  }
  return out;
}

export async function loadUpcomingGio(
  limit = 50,
): Promise<GioOccurrence[]> {
  const map = await loadMemoMap();
  return listUpcomingGio(map, getVietnamSolarToday(), limit);
}

export function dDayLabel(daysUntil: number): string {
  if (daysUntil === 0) return 'Hôm nay';
  if (daysUntil === 1) return 'Ngày mai';
  return `Còn ${daysUntil} ngày`;
}

/** Advance solar date for N-day-before reminder (same 07:30 VN on that morning). */
export function advanceSolarFor(
  occurrence: SolarDate,
  advanceDays: GioAdvanceDays,
): SolarDate | null {
  if (advanceDays <= 0) return null;
  return addSolarDays(occurrence, -advanceDays);
}
