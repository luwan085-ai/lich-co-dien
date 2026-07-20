import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  animalFromBirthYear,
  loadHoroscopeProfile,
  setBirthYear,
  setZodiacAnimal,
  ZODIAC_ANIMALS,
  type HoroscopeProfile,
  type ZodiacAnimal,
} from '../lib/horoscopeProfile';
import { colors } from '../theme/tokens';

type Props = {
  fontFamily?: string;
};

const MIN_BIRTH_YEAR = 1920;

export function ProfileHoroscopeSection({ fontFamily }: Props) {
  const [profile, setProfile] = useState<HoroscopeProfile>({});
  const [yearDraft, setYearDraft] = useState('');

  useEffect(() => {
    void loadHoroscopeProfile().then((next) => {
      setProfile(next);
      if (next.birthYear) setYearDraft(String(next.birthYear));
    });
  }, []);

  const pick = async (animal: ZodiacAnimal) => {
    const next = await setZodiacAnimal(animal);
    setProfile(next);
    setYearDraft('');
  };

  const applyBirthYear = async () => {
    const year = Number.parseInt(yearDraft.trim(), 10);
    const maxYear = new Date().getFullYear();
    if (!Number.isFinite(year) || year < MIN_BIRTH_YEAR || year > maxYear) {
      Alert.alert(
        'Năm sinh không hợp lệ',
        `Nhập năm từ ${MIN_BIRTH_YEAR} đến ${maxYear}.`,
      );
      return;
    }
    const next = await setBirthYear(year);
    setProfile(next);
    setYearDraft(String(year));
  };

  const selected = profile.animal;
  const previewYear = Number.parseInt(yearDraft.trim(), 10);
  const previewAnimal =
    yearDraft.trim().length === 4 &&
    Number.isFinite(previewYear) &&
    previewYear >= MIN_BIRTH_YEAR &&
    previewYear <= new Date().getFullYear()
      ? animalFromBirthYear(previewYear)
      : null;
  const selectedLine = selected
    ? profile.birthYear
      ? `Đang chọn: tuổi ${selected} · sinh ${profile.birthYear}`
      : `Đang chọn: tuổi ${selected}`
    : 'Chưa chọn tuổi · nhập năm sinh hoặc chọn con giáp';

  return (
    <View style={styles.wrap}>
      <Text style={styles.sub}>
        Màn Tử vi sẽ hiển thị “Hôm nay của tuổi …” theo lựa chọn của bạn.
      </Text>
      <Text style={[styles.selectedLine, fontFamily ? { fontFamily } : null]}>
        {selectedLine}
      </Text>

      <Text style={[styles.fieldLabel, fontFamily ? { fontFamily } : null]}>
        Nhập năm sinh
      </Text>
      <View style={styles.yearRow}>
        <TextInput
          style={[styles.yearInput, fontFamily ? { fontFamily } : null]}
          value={yearDraft}
          onChangeText={setYearDraft}
          keyboardType="number-pad"
          maxLength={4}
          placeholder="1990"
          placeholderTextColor={colors.inkFaint}
          returnKeyType="done"
          onSubmitEditing={() => void applyBirthYear()}
        />
        <Pressable style={styles.yearBtn} onPress={() => void applyBirthYear()}>
          <Text style={[styles.yearBtnText, fontFamily ? { fontFamily } : null]}>
            Áp dụng
          </Text>
        </Pressable>
      </View>
      {previewAnimal ? (
        <Text style={styles.yearHint}>→ tuổi {previewAnimal}</Text>
      ) : null}

      <Text style={[styles.orLine, fontFamily ? { fontFamily } : null]}>
        hoặc chọn con giáp
      </Text>

      <View style={styles.grid}>
        {ZODIAC_ANIMALS.map((animal) => {
          const active = selected === animal;
          return (
            <Pressable
              key={animal}
              style={[styles.chip, active && styles.chipOn]}
              onPress={() => void pick(animal)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.chipText,
                  active && styles.chipTextOn,
                  fontFamily ? { fontFamily } : null,
                ]}
              >
                {animal}
                {active ? ' ✓' : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 2,
  },
  sub: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.inkMuted,
  },
  selectedLine: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '800',
    color: colors.crimsonDeep,
  },
  fieldLabel: {
    marginTop: 14,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: colors.inkMuted,
  },
  yearRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  yearInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  yearBtn: {
    borderWidth: 1,
    borderColor: colors.crimson,
    backgroundColor: colors.paper,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  yearBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.crimson,
  },
  yearHint: {
    marginTop: 6,
    fontSize: 11,
    color: colors.inkFaint,
  },
  orLine: {
    marginTop: 14,
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkFaint,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    width: '30%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  chipOn: {
    borderWidth: 2,
    borderColor: colors.crimson,
    backgroundColor: '#FFF1F2',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkMuted,
  },
  chipTextOn: {
    color: colors.crimson,
    fontWeight: '800',
  },
});
