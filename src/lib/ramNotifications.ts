import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addSolarDays, type SolarDate } from '../lunar/solar';
import { getCalendarDayForSolar } from '../lunar/today';
import { getVietnamSolarToday } from '../lunar/vietnamTime';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const CHANNEL = 'lich-ram';
const PREF_KEY = 'lich_ram_notif_v1';

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: 'Rằm & Mùng Một',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function loadRamNotifEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(PREF_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function setRamNotifEnabled(on: boolean): Promise<void> {
  await AsyncStorage.setItem(PREF_KEY, on ? '1' : '0');
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export async function cancelRamNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.kind === 'ram')
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/** Schedule next ~60 days of Rằm (15) / Mùng Một (1) morning reminders. */
export async function scheduleRamNotifications(): Promise<number> {
  if (Platform.OS === 'web') return 0;
  const ok = await ensureNotificationPermission();
  if (!ok) return 0;
  await ensureAndroidChannel();
  await cancelRamNotifications();

  let count = 0;
  let cursor: SolarDate = getVietnamSolarToday();
  for (let i = 0; i < 60; i++) {
    const day = getCalendarDayForSolar(cursor, 8);
    const lunarDay = day.lunar.day;
    if (lunarDay === 1 || lunarDay === 15) {
      const label = lunarDay === 1 ? 'Mùng Một' : 'Rằm';
      const fire = new Date(
        cursor.year,
        cursor.month - 1,
        cursor.day,
        7,
        30,
        0,
      );
      if (fire.getTime() > Date.now()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${label} · Lịch Cổ Điển`,
            body: `Hôm nay ${label} tháng ${day.lunar.month} âm · nhớ thắp hương & lời hứa ngày.`,
            data: { kind: 'ram', solar: cursor },
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
    cursor = addSolarDays(cursor, 1);
  }
  return count;
}

export async function toggleRamNotifications(on: boolean): Promise<number> {
  await setRamNotifEnabled(on);
  if (!on) {
    await cancelRamNotifications();
    return 0;
  }
  return scheduleRamNotifications();
}
