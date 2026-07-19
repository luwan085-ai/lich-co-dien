import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getVietnamSolarToday, vietnamWallClockDate } from '../lunar/vietnamTime';
import { loadMemoMap, type AnnivKind, type LunarAnniv } from './localMemos';
import {
  advanceSolarFor,
  formatLunarLabel,
  formatSolarShort,
  labelForLunarGio,
  listFutureOccurrenceSolars,
  listUniqueGio,
  loadGioAdvanceDays,
  type GioAdvanceDays,
} from './gioSchedule';
import { ensureNotificationPermission } from './ramNotifications';

const CHANNEL = 'lich-gio';
const PREF_KEY = 'lich_gio_notif_v1';
/** How many lunar years ahead to schedule. */
const YEARS_AHEAD = 2;

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: 'Giỗ & sinh nhật âm',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

function dayTitle(kind: AnnivKind, lunarLabel: string): string {
  return kind === 'birthday'
    ? `Sinh nhật · ${lunarLabel}`
    : `Giỗ · ${lunarLabel}`;
}

function advanceTitle(
  kind: AnnivKind,
  advanceDays: GioAdvanceDays,
  lunarLabel: string,
): string {
  if (advanceDays === 1) {
    return kind === 'birthday'
      ? `Ngày mai sinh nhật · ${lunarLabel}`
      : `Ngày mai giỗ · ${lunarLabel}`;
  }
  return kind === 'birthday'
    ? `Sinh nhật sau ${advanceDays} ngày · ${lunarLabel}`
    : `Giỗ sau ${advanceDays} ngày · ${lunarLabel}`;
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

async function scheduleAt(
  fire: Date,
  title: string,
  body: string,
  lunar: LunarAnniv,
  solar: { year: number; month: number; day: number },
  phase: 'day' | 'advance',
  advanceDays: GioAdvanceDays,
): Promise<void> {
  if (fire.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: {
        kind: 'gio',
        phase,
        advanceDays,
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
}

/**
 * Schedule morning giỗ reminders for next YEARS_AHEAD lunar years.
 * Fire time: 07:30 Asia/Ho_Chi_Minh · day-of + N-day advance (pref).
 */
export async function scheduleGioNotifications(): Promise<number> {
  if (Platform.OS === 'web') return 0;
  const ok = await ensureNotificationPermission();
  if (!ok) return 0;
  await ensureAndroidChannel();
  await cancelGioNotifications();

  const map = await loadMemoMap();
  const items = listUniqueGio(map);
  if (items.length === 0) return 0;

  const advanceDays = await loadGioAdvanceDays();
  const today = getVietnamSolarToday();
  const startYear = today.year - 1;
  const endYear = startYear + YEARS_AHEAD + 1;
  let count = 0;
  const now = Date.now();

  for (const item of items) {
    const { lunar, annivKind } = item;
    const note = labelForLunarGio(map, lunar);
    const lunarLabel = formatLunarLabel(lunar);
    const solars = listFutureOccurrenceSolars(
      lunar,
      startYear,
      endYear,
      new Date(now),
    );

    for (const solar of solars) {
      const dayFire = vietnamWallClockDate(
        solar.year,
        solar.month,
        solar.day,
        7,
        30,
      );
      if (dayFire.getTime() > now) {
        await scheduleAt(
          dayFire,
          dayTitle(annivKind, lunarLabel),
          note,
          lunar,
          solar,
          'day',
          advanceDays,
        );
        count += 1;
      }

      const advSolar = advanceSolarFor(solar, advanceDays);
      if (advSolar) {
        const advFire = vietnamWallClockDate(
          advSolar.year,
          advSolar.month,
          advSolar.day,
          7,
          30,
        );
        if (advFire.getTime() > now) {
          await scheduleAt(
            advFire,
            advanceTitle(annivKind, advanceDays, lunarLabel),
            `Ngày ${formatSolarShort(solar)} dương · ${note}`,
            lunar,
            solar,
            'advance',
            advanceDays,
          );
          count += 1;
        }
      }
    }
  }
  return count;
}

export async function toggleGioNotifications(on: boolean): Promise<number> {
  if (!on) {
    await setGioNotifEnabled(false);
    await cancelGioNotifications();
    return 0;
  }
  const ok = await ensureNotificationPermission();
  if (!ok) {
    await setGioNotifEnabled(false);
    return -1;
  }
  await setGioNotifEnabled(true);
  return scheduleGioNotifications();
}

/** Reschedule if toggle is on (call after memo/giỗ save or day roll). */
export async function rescheduleGioIfEnabled(): Promise<void> {
  if (!(await loadGioNotifEnabled())) return;
  await scheduleGioNotifications();
}
