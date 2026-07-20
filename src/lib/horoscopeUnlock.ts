import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'lich_horoscope_unlock_v1_';

export async function loadHoroscopeUnlocked(dateKey: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY_PREFIX + dateKey)) === '1';
  } catch {
    return false;
  }
}

export async function setHoroscopeUnlocked(
  dateKey: string,
  on: boolean,
): Promise<void> {
  const key = KEY_PREFIX + dateKey;
  if (on) {
    await AsyncStorage.setItem(key, '1');
  } else {
    await AsyncStorage.removeItem(key);
  }
}
