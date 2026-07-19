import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';
import type { DatePageRecord, Mood, Praise } from '../types/mood';

const LEGACY_MOOD_KEY = 'lich_mood_map_v1';
const PAGE_KEY = 'lich_page_map_v1';

let stampSound: AudioPlayer | null = null;

export async function loadPageMap(): Promise<Record<string, DatePageRecord>> {
  try {
    const raw = await AsyncStorage.getItem(PAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, DatePageRecord>;
      return migratePraiseIds(parsed);
    }

    const legacy = await AsyncStorage.getItem(LEGACY_MOOD_KEY);
    if (!legacy) return {};
    const old = JSON.parse(legacy) as Record<string, Mood>;
    const next: Record<string, DatePageRecord> = {};
    for (const [k, mood] of Object.entries(old)) {
      next[k] = { moodStamp: mood };
    }
    await AsyncStorage.setItem(PAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return {};
  }
}

function migratePraiseIds(
  map: Record<string, DatePageRecord>,
): Record<string, DatePageRecord> {
  const alias: Record<string, Praise> = {
    // legacy → top-3 package
    lam_tot: 'lam_tot_lam',
    lam_bai_tot: 'lam_tot_lam',
    tot: 'lam_tot_lam',
    gioi: 'gioi_lam',
    xuat_sac: 'gioi_lam',
    co_khen_em: 'co_khen',
    thay_khen: 'co_khen',
    tuyet: 'co_khen',
    khen: 'co_khen',
    thuong: 'gioi_lam',
    tien_bo: 'lam_tot_lam',
  };
  let changed = false;
  const next: Record<string, DatePageRecord> = {};
  for (const [k, rec] of Object.entries(map)) {
    const old = rec.praiseStamp as string | undefined;
    if (old && alias[old]) {
      changed = true;
      next[k] = { ...rec, praiseStamp: alias[old] };
    } else if (
      old &&
      old !== 'lam_tot_lam' &&
      old !== 'gioi_lam' &&
      old !== 'co_khen'
    ) {
      // unknown legacy → standard
      changed = true;
      next[k] = { ...rec, praiseStamp: 'lam_tot_lam' };
    } else {
      next[k] = rec;
    }
  }
  if (changed) void AsyncStorage.setItem(PAGE_KEY, JSON.stringify(next));
  return next;
}

async function persistPageMap(map: Record<string, DatePageRecord>) {
  await AsyncStorage.setItem(PAGE_KEY, JSON.stringify(map));
}

export async function saveMood(dateKey: string, mood: Mood) {
  const map = await loadPageMap();
  map[dateKey] = { ...map[dateKey], moodStamp: mood };
  await persistPageMap(map);
}

export async function savePraise(
  dateKey: string,
  praise: Praise,
  inkSeed: number,
) {
  const map = await loadPageMap();
  map[dateKey] = {
    ...map[dateKey],
    praiseStamp: praise,
    praiseInkSeed: inkSeed,
  };
  await persistPageMap(map);
}

export async function loadMoodMap(): Promise<Record<string, Mood>> {
  const pages = await loadPageMap();
  const out: Record<string, Mood> = {};
  for (const [k, rec] of Object.entries(pages)) {
    if (rec.moodStamp) out[k] = rec.moodStamp;
  }
  return out;
}

async function ensureStampSound() {
  if (stampSound) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
    });
    const player = createAudioPlayer(
      require('../../assets/sounds/stamp-thud.wav'),
    );
    player.volume = 1;
    stampSound = player;
  } catch {
    stampSound = null;
  }
}

/** Thud + ~50ms heavy haptic in sync — dopamine hit of a real desk stamp. */
export async function playStampFeedback() {
  const hapticP =
    Platform.OS !== 'web'
      ? (async () => {
          try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } catch {
            // no-op
          }
        })()
      : Promise.resolve();

  const soundP = (async () => {
    try {
      await ensureStampSound();
      if (!stampSound) return;
      await stampSound.seekTo(0);
      stampSound.play();
    } catch {
      // no-op
    }
  })();

  await Promise.all([hapticP, soundP]);
}
