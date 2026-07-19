import AsyncStorage from '@react-native-async-storage/async-storage';

const VISIT_KEY = 'lich_last_visit_v1';

export type LastVisit = {
  dateKey: string;
  at: string;
};

export async function loadLastVisit(): Promise<LastVisit | null> {
  try {
    const raw = await AsyncStorage.getItem(VISIT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LastVisit;
  } catch {
    return null;
  }
}

export async function markVisitToday(dateKey: string): Promise<LastVisit> {
  const next: LastVisit = { dateKey, at: new Date().toISOString() };
  await AsyncStorage.setItem(VISIT_KEY, JSON.stringify(next));
  return next;
}
