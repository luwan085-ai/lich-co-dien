import AsyncStorage from '@react-native-async-storage/async-storage';
import { zodiacPackKey } from '../data/zodiacPack';

const KEY = 'lich_horoscope_profile_v1';

export const ZODIAC_ANIMALS = [
  'Chuột',
  'Trâu',
  'Hổ',
  'Mèo',
  'Rồng',
  'Rắn',
  'Ngựa',
  'Dê',
  'Khỉ',
  'Gà',
  'Chó',
  'Heo',
] as const;

export type ZodiacAnimal = (typeof ZODIAC_ANIMALS)[number];

export type HoroscopeProfile = {
  birthYear?: number;
  animal?: ZodiacAnimal;
};

export function animalFromBirthYear(year: number): ZodiacAnimal {
  const idx = ((year - 4) % 12 + 12) % 12;
  return ZODIAC_ANIMALS[idx]!;
}

export async function loadHoroscopeProfile(): Promise<HoroscopeProfile> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as HoroscopeProfile;
    const animal = parsed.animal
      ? (zodiacPackKey(parsed.animal) as ZodiacAnimal)
      : parsed.birthYear
        ? animalFromBirthYear(parsed.birthYear)
        : undefined;
    return { ...parsed, animal };
  } catch {
    return {};
  }
}

export async function saveHoroscopeProfile(
  next: HoroscopeProfile,
): Promise<HoroscopeProfile> {
  const animal =
    next.animal ??
    (next.birthYear ? animalFromBirthYear(next.birthYear) : undefined);
  const stored: HoroscopeProfile = {
    birthYear: next.birthYear,
    animal,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(stored));
  return stored;
}

export async function setBirthYear(year: number): Promise<HoroscopeProfile> {
  return saveHoroscopeProfile({ birthYear: year, animal: animalFromBirthYear(year) });
}

export async function setZodiacAnimal(animal: ZodiacAnimal): Promise<HoroscopeProfile> {
  return saveHoroscopeProfile({ animal });
}
