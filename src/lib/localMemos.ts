import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'lich_memo_map_v1';

export type DayMemo = {
  text: string;
  isAnniversary: boolean;
  updatedAt: string;
};

export async function loadMemoMap(): Promise<Record<string, DayMemo>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, DayMemo>;
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
  };
  map[dateKey] = next;
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
  return next;
}
