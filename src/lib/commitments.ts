import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Praise, PraiseGrade } from '../types/mood';
import { PRAISE_STAMPS } from '../types/mood';
import { addSolarDays, solarKey, type SolarDate } from '../lunar/solar';
import { getVietnamHour } from '../lunar/vietnamTime';

const KEY = 'lich_commit_v1';

export type CommitmentEntry = {
  text: string;
  completedAt: string;
  praiseId: Praise;
};

type CommitMap = Record<string, CommitmentEntry>;

async function loadMap(): Promise<CommitMap> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CommitMap;
  } catch {
    return {};
  }
}

export async function loadCommitment(
  dateKey: string,
): Promise<CommitmentEntry | null> {
  const map = await loadMap();
  return map[dateKey] ?? null;
}

export async function saveCommitment(
  dateKey: string,
  entry: CommitmentEntry,
): Promise<void> {
  const map = await loadMap();
  map[dateKey] = entry;
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
}

/** Consecutive completed days ending at `today` (inclusive if done). */
export async function countStreakEndingAt(today: SolarDate): Promise<number> {
  const map = await loadMap();
  let streak = 0;
  let cursor = today;
  // If today not done yet, streak is previous consecutive days
  if (!map[solarKey(today)]) {
    cursor = addSolarDays(today, -1);
  }
  for (let i = 0; i < 60; i++) {
    if (!map[solarKey(cursor)]) break;
    streak += 1;
    cursor = addSolarDays(cursor, -1);
  }
  return streak;
}

/**
 * Pick stamp grade:
 * - premium (Giỏi lắm!): streak will hit 3 or 7, or morning before 9h
 * - warm (Cô khen!): weekend or late after 20h
 * - standard (Làm tốt lắm!): default
 */
export function pickPraiseForCompletion(opts: {
  now: Date;
  /** streak AFTER counting today's completion */
  streakAfter: number;
}): Praise {
  const hour = opts.now.getHours();
  const dow = opts.now.getDay(); // 0 Sun … 6 Sat
  const isWeekend = dow === 0 || dow === 6;
  const isLate = hour >= 20;
  const isEarly = hour < 9;
  const hitStreak =
    opts.streakAfter === 3 ||
    opts.streakAfter === 7 ||
    opts.streakAfter === 14 ||
    opts.streakAfter === 30;

  let grade: PraiseGrade = 'standard';
  if (hitStreak || isEarly) grade = 'premium';
  else if (isWeekend || isLate) grade = 'warm';

  const stamp = PRAISE_STAMPS.find((p) => p.grade === grade);
  return stamp?.id ?? 'lam_tot_lam';
}

export { getVietnamHour };
