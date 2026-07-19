import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCalendarDayForSolar } from '../lunar/today';
import { parseSolarKey } from '../lunar/solar';

const KEY = 'lich_memo_map_v1';

export type LunarAnniv = {
  month: number;
  day: number;
  leapMonth: boolean;
};

export type AnnivKind = 'gio' | 'birthday';

const BIRTHDAY_RE =
  /sinh nhật|sn âm|birthday|thọ|mừng tuổi|tết thọ|ngày sinh/i;

export function inferAnnivKind(text: string): AnnivKind {
  return BIRTHDAY_RE.test(text.trim()) ? 'birthday' : 'gio';
}

export type DayMemo = {
  text: string;
  isAnniversary: boolean;
  /** Explicit giỗ vs sinh nhật âm — falls back to text inference when missing. */
  annivKind?: AnnivKind;
  updatedAt: string;
  /** Lunar giỗ intent — used for yearly reminders & month marks. */
  lunar?: LunarAnniv;
};

function lunarFromSolarKey(dateKey: string): LunarAnniv | undefined {
  try {
    const solar = parseSolarKey(dateKey);
    if (!solar) return undefined;
    const cal = getCalendarDayForSolar(solar, 12);
    return {
      month: cal.lunar.month,
      day: cal.lunar.day,
      leapMonth: cal.lunar.leapMonth,
    };
  } catch {
    return undefined;
  }
}

/** Ensure anniversary memos carry lunar fields (migration for older saves). */
export function hydrateMemo(dateKey: string, memo: DayMemo): DayMemo {
  let next = memo;
  if (memo.isAnniversary && !memo.annivKind) {
    next = { ...next, annivKind: inferAnnivKind(memo.text) };
  }
  if (!next.isAnniversary) return next;
  if (next.lunar?.month && next.lunar?.day) return next;
  const lunar = lunarFromSolarKey(dateKey);
  return lunar ? { ...next, lunar } : next;
}

export async function loadMemoMap(): Promise<Record<string, DayMemo>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    const map = JSON.parse(raw) as Record<string, DayMemo>;
    let dirty = false;
    for (const [k, v] of Object.entries(map)) {
      if (!v.isAnniversary || v.lunar?.month) continue;
      const next = hydrateMemo(k, v);
      if (next.lunar) {
        map[k] = next;
        dirty = true;
      }
    }
    if (dirty) {
      await AsyncStorage.setItem(KEY, JSON.stringify(map));
    }
    return map;
  } catch {
    return {};
  }
}

export async function loadMemo(dateKey: string): Promise<DayMemo | null> {
  const map = await loadMemoMap();
  return map[dateKey] ?? null;
}

export async function saveMemo(
  dateKey: string,
  text: string,
  isAnniversary: boolean,
  annivKind?: AnnivKind,
): Promise<DayMemo> {
  const map = await loadMemoMap();
  const trimmed = text.trim();
  if (!trimmed && !isAnniversary) {
    delete map[dateKey];
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(map));
    } catch (e) {
      throw e instanceof Error ? e : new Error('saveMemo failed');
    }
    return { text: '', isAnniversary: false, updatedAt: new Date().toISOString() };
  }
  const kind = isAnniversary ? (annivKind ?? inferAnnivKind(trimmed)) : undefined;
  const next: DayMemo = {
    text: trimmed,
    isAnniversary,
    ...(kind ? { annivKind: kind } : {}),
    updatedAt: new Date().toISOString(),
    ...(isAnniversary ? { lunar: lunarFromSolarKey(dateKey) } : {}),
  };
  map[dateKey] = next;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(map));
  } catch (e) {
    throw e instanceof Error ? e : new Error('saveMemo failed');
  }
  return next;
}

export function lunarAnnivKey(l: LunarAnniv): string {
  return `${l.leapMonth ? 'L' : ''}${l.month}-${l.day}`;
}

export function memoMatchesLunar(
  memo: DayMemo | undefined,
  lunar: LunarAnniv,
): boolean {
  if (!memo?.isAnniversary || !memo.lunar) return false;
  return (
    memo.lunar.month === lunar.month &&
    memo.lunar.day === lunar.day &&
    memo.lunar.leapMonth === lunar.leapMonth
  );
}

/** True if any saved giỗ shares this lunar day/month. */
export function mapHasGioOnLunar(
  map: Record<string, DayMemo>,
  lunar: LunarAnniv,
): boolean {
  return annivKindOnLunar(map, lunar) !== null;
}

/** Giỗ vs sinh nhật âm for a lunar day (first matching memo wins). */
export function annivKindOnLunar(
  map: Record<string, DayMemo>,
  lunar: LunarAnniv,
): AnnivKind | null {
  for (const [key, raw] of Object.entries(map)) {
    const memo = hydrateMemo(key, raw);
    if (!memoMatchesLunar(memo, lunar)) continue;
    return memo.annivKind ?? inferAnnivKind(memo.text);
  }
  return null;
}
