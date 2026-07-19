import { StyleSheet, Text, View } from 'react-native';
import { travelHintForDay } from '../lib/travelDirection';
import type { CalendarDay } from '../lunar/today';
import { colors } from '../theme/tokens';

type Props = {
  day: CalendarDay;
  fontFamily?: string;
};

/** Hướng xuất hành — giờ hoàng đạo chips live on the paper card. */
export function DayPulseCompact({ day, fontFamily }: Props) {
  const travel = travelHintForDay(day);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>HƯỚNG XUẤT HÀNH</Text>
      <Text style={[styles.value, fontFamily ? { fontFamily } : null]} numberOfLines={2}>
        {travel.favorable}
      </Text>
      {!day.isGoodDay ? (
        <Text style={[styles.sub, fontFamily ? { fontFamily } : null]} numberOfLines={1}>
          Tránh {travel.avoid}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: colors.crimsonSoft,
    marginBottom: 6,
  },
  value: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.ink,
    fontWeight: '600',
  },
  sub: {
    marginTop: 4,
    fontSize: 11,
    color: colors.inkMuted,
    fontWeight: '600',
  },
});
