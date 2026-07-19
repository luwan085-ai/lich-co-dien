import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  loadHoroscopeProfile,
  setZodiacAnimal,
  ZODIAC_ANIMALS,
  type HoroscopeProfile,
  type ZodiacAnimal,
} from '../lib/horoscopeProfile';
import { colors } from '../theme/tokens';

type Props = {
  fontFamily?: string;
};

export function ProfileHoroscopeSection({ fontFamily }: Props) {
  const [profile, setProfile] = useState<HoroscopeProfile>({});

  useEffect(() => {
    void loadHoroscopeProfile().then(setProfile);
  }, []);

  const pick = async (animal: ZodiacAnimal) => {
    const next = await setZodiacAnimal(animal);
    setProfile(next);
  };

  const selected = profile.animal;

  return (
    <View style={styles.wrap}>
      <Text style={styles.sub}>
        Chọn tuổi của bạn — màn Tử vi sẽ hiển thị “Hôm nay của tuổi …”
      </Text>
      <Text style={[styles.selectedLine, fontFamily ? { fontFamily } : null]}>
        {selected ? `Đang chọn: tuổi ${selected}` : 'Chưa chọn tuổi · chạm một con giáp bên dưới'}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
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
