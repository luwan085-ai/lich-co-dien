import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { getSupabase, isSupabaseConfigured } from './supabase';
import type { DatePageRecord, Mood } from '../types/mood';

export type { Mood } from '../types/mood';

const DEVICE_KEY = 'lich_device_id';

async function memoryFallbackId(): Promise<string> {
  // web / secure-store unavailable
  const g = globalThis as { __lichDeviceId?: string };
  if (!g.__lichDeviceId) {
    g.__lichDeviceId = `web_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
  return g.__lichDeviceId;
}

export async function getDeviceId(): Promise<string> {
  if (Platform.OS === 'web') return memoryFallbackId();
  try {
    const existing = await SecureStore.getItemAsync(DEVICE_KEY);
    if (existing) return existing;
    const next = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    await SecureStore.setItemAsync(DEVICE_KEY, next);
    return next;
  } catch {
    return memoryFallbackId();
  }
}

export async function upsertMoodStamp(solarDate: string, mood: Mood) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false as const, reason: 'not_configured' as const };

  const device_id = await getDeviceId();
  const { error } = await supabase.from('mood_stamps').upsert(
    {
      device_id,
      solar_date: solarDate,
      mood,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'device_id,solar_date' },
  );

  if (error) return { ok: false as const, reason: error.message };
  return { ok: true as const };
}

export async function fetchMoodStamps(): Promise<Record<string, DatePageRecord>> {
  const supabase = getSupabase();
  if (!supabase) return {};

  const device_id = await getDeviceId();
  const { data, error } = await supabase
    .from('mood_stamps')
    .select('solar_date, mood')
    .eq('device_id', device_id);

  if (error || !data) return {};

  const map: Record<string, DatePageRecord> = {};
  for (const row of data) {
    map[row.solar_date] = { moodStamp: row.mood as Mood };
  }
  return map;
}

export function supabaseStatusLabel() {
  return isSupabaseConfigured ? 'Supabase: connected' : 'Supabase: waiting for keys';
}
