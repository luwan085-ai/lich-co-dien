import AsyncStorage from '@react-native-async-storage/async-storage';

const PREF_KEY = 'lich_gio_notif_v1';

/** Web stub — expo-notifications is not loaded on web. */
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

export async function cancelGioNotifications(): Promise<void> {}

export async function scheduleGioNotifications(): Promise<number> {
  return 0;
}

export async function toggleGioNotifications(on: boolean): Promise<number> {
  await setGioNotifEnabled(on);
  return 0;
}

export async function rescheduleGioIfEnabled(): Promise<void> {}
