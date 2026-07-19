import AsyncStorage from '@react-native-async-storage/async-storage';

const PREF_KEY = 'lich_ram_notif_v1';

/** Web stub — expo-notifications is not loaded on web. */
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
  return false;
}

export async function cancelRamNotifications(): Promise<void> {}

export async function scheduleRamNotifications(): Promise<number> {
  return 0;
}

export async function toggleRamNotifications(on: boolean): Promise<number> {
  await setRamNotifEnabled(on);
  return 0;
}
