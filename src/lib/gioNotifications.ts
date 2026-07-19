import AsyncStorage from '@react-native-async-storage/async-storage';
import { lunarToSolar } from '@baostudio/viet-lunar';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getVietnamSolarToday, vietnamWallClockDate } from '../lunar/vietnamTime';
import {
  hydrateMemo,
  loadMemoMap,
  type DayMemo,
  type LunarAnniv,
} from './localMemos';
import {
  ensureNotificationPermission,
} from './ramNotifications';

const CHANNEL = 'lich-gio';
const PREF_KEY = 'lich_gio_notif_v1';
/** How many lunar years ahead to schedule. */
const YEARS_AHEAD = 2;

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: 'Giỗ âm lịch',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function loadGioNotifEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(PREF_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function setGioNotifEnabled(on: boolean): Promise<void> {
  await AsyncStorage.setItem(PREF_KEY, on ? '1' : '0');
}

export async function cancelGioNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.kind === 'gio')
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

function uniqueLunarAnniversaries(map: Record<string, DayMemo>): LunarAnniv[] {
  const seen = new Set<string>();
  const out: LunarAnniv[] = [];
  for (const [key, raw] of Object.entries(map)) {
    const memo = hydrateMemo(key, raw);
    if (!memo.isAnniversary || !memo.lunar) continue;
    const id = `${memo.lunar.leapMonth ? 'L' : ''}${memo.lunar.month}-${memo.lunar.day}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(memo.lunar);
  }
  return out;
}

function labelForGio(map: Record<string, DayMemo>, lunar: LunarAnniv): string {
  for (const [key, raw] of Object.entries(map)) {
    const memo = hydrateMemo(key, raw);
    if (
      memo.isAnniversary &&
      memo.lunar &&
      memo.lunar.month === lunar.month &&
      memo.lunar.day === lunar.day &&
      memo.lunar.leapMonth === lunar.leapMonth &&
      memo.text.trim()
    ) {
      return memo.text.trim().slice(0, 80);
    }
  }
  return 'Nhớ chuẩn bị lễ giỗ theo âm lịch.';
}

/**
 * Schedule morning giỗ reminders for next YEARS_AHEAD lunar years.
 * Fire time: 07:30 Asia/Ho_Chi_Minh.
 */
export async function scheduleGioNotifications(): Promise<number> {
  if (Platform.OS === 'web') return 0;
  const ok = await ensureNotificationPermission();
  if (!ok) return 0;
  await ensureAndroidChannel();
  await cancelGioNotifications();

  const map = await loadMemoMap();
  const anniversaries = uniqueLunarAnniversaries(map);
  if (anniversaries.length === 0) return 0;

  const today = getVietnamSolarToday();
  const startYear = today.year - 1;
  let count = 0;

  for (const lunar of anniversaries) {
    const note = labelForGio(map, lunar);
    for (let y = startYear; y <= startYear + YEARS_AHEAD + 1; y += 1) {
      let solar: { year: number; month: number; day: number };
      try {
        solar = lunarToSolar({
          year: y,
          month: lunar.month,
          day: lunar.day,
          leapMonth: lunar.leapMonth,
        });
      } catch {
        // Leap month may not exist that year — skip
        continue;
      }

      const fire = vietnamWallClockDate(
        solar.year,
        solar.month,
        solar.day,
        7,
        30,
      );
      if (fire.getTime() <= Date.now()) continue;

      const leap = lunar.leapMonth ? ' (nhuận)' : '';
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Giỗ · âm ${lunar.day}/${lunar.month}${leap}`,
          body: note,
          data: {
            kind: 'gio',
            lunarMonth: lunar.month,
            lunarDay: lunar.day,
            leapMonth: lunar.leapMonth,
            solar,
          },
          ...(Platform.OS === 'android' ? { channelId: CHANNEL } : null),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fire,
        },
      });
      count += 1;
    }
  }
  return count;
}

export async function toggleGioNotifications(on: boolean): Promise<number> {
  await setGioNotifEnabled(on);
  if (!on) {
    await cancelGioNotifications();
    return 0;
  }
  return scheduleGioNotifications();
}

/** Reschedule if toggle is on (call after memo/giỗ save). */
export async function rescheduleGioIfEnabled(): Promise<void> {
  if (!(await loadGioNotifEnabled())) return;
  await scheduleGioNotifications();
}
