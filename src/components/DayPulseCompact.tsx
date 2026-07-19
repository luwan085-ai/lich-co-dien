import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HoangHourChips } from './HoangHourChips';
import type { CalendarDay } from '../lunar/today';
import { colors } from '../theme/tokens';

type Props = {
  day: CalendarDay;
  fontFamily?: string;
};

/** Collapsible giờ hoàng đạo — summary when closed, full grid when open. */
export function DayPulseCompact({ day, fontFamily }: Props) {
  const [open, setOpen] = useState(false);
  const count = day.hoangHours.length;

  if (!count) return null;

  return (
    <Pressable
      style={styles.wrap}
      onPress={() => setOpen((v) => !v)}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
    >
      <View style={styles.header}>
        <Text style={[styles.label, fontFamily ? { fontFamily } : null]}>
          GIỜ HOÀNG ĐẠO
        </Text>
        <View style={styles.headerRight}>
          {!open ? (
            <Text
              style={[styles.summaryMuted, fontFamily ? { fontFamily } : null]}
              numberOfLines={1}
            >
              {count} khung giờ tốt ·{' '}
              <Text style={styles.summaryAction}>chạm để xem</Text>
            </Text>
          ) : (
            <Text style={[styles.summaryAction, fontFamily ? { fontFamily } : null]}>
              Thu gọn
            </Text>
          )}
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={open ? colors.inkFaint : colors.crimsonDeep}
          />
        </View>
      </View>
      {open ? (
        <HoangHourChips
          hours={day.hoangHours}
          fontFamily={fontFamily}
          size="md"
          layout="grid"
        />
      ) : null}
    </Pressable>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: colors.crimsonSoft,
  },
  summaryMuted: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.inkFaint,
    textAlign: 'right',
    flexShrink: 1,
  },
  summaryAction: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.crimsonDeep,
  },
});
