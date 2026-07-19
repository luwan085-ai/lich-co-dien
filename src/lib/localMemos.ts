import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCalendarDayForSolar } from '../lunar/today';
import { parseSolarKey } from '../lunar/solar';

const KEY = 'lich_memo_map_v1';

export type LunarAnniv = {
  month: number;
  day: number;
  leapMonth: boolean;
};

export type DayMemo = {
  text: string;
  isAnniversary: boolean;
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
  if (!memo.isAnniversary) return memo;
  if (memo.lunar?.month && memo.lunar?.day) return memo;
  const lunar = lunarFromSolarKey(dateKey);
  return lunar ? { ...memo, lunar } : memo;
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
): Promise<DayMemo> {
  const map = await loadMemoMap();
  const trimmed = text.trim();
  if (!trimmed && !isAnniversary) {
    delete map[dateKey];
    await AsyncStorage.setItem(KEY, JSON.stringify(map));
    return { text: '', isAnniversary: false, updatedAt: new Date().toISOString() };
  }
  const next: DayMemo = {
    text: trimmed,
    isAnniversary,
    updatedAt: new Date().toISOString(),
    ...(isAnniversary ? { lunar: lunarFromSolarKey(dateKey) } : {}),
  };
  map[dateKey] = next;
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
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
  return Object.values(map).some((m) => memoMatchesLunar(m, lunar));
}