import { useEffect, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  dDayLabel,
  listUpcomingLunarEvents,
  type UpcomingLunarEvent,
} from '../lib/lunarUpcoming';
import type { SolarDate } from '../lunar/solar';
import { colors } from '../theme/tokens';

type Props = {
  fontFamily?: string;
  refreshKey?: number;
  onSelectDay: (day: SolarDate) => void;
  onOpenList?: () => void;
};

const KIND_DOT: Record<UpcomingLunarEvent['kind'], string> = {
  ram: colors.crimson,
  mung: colors.goldDeep,
  gio: '#0F766E',
  birthday: '#7C3AED',
};

/** Sắp tới — Rằm, Mùng Một, giỗ in one glance. */
export function UpcomingLunarCard({
  fontFamily,
  refreshKey = 0,
  onSelectDay,
  onOpenList,
}: Props) {
  const [items, setItems] = useState<UpcomingLunarEvent[]>([]);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const next = await listUpcomingLunarEvents(4);
      if (!alive) return;
      setItems(next);
    };
    void refresh();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, [refreshKey]);

  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[styles.kicker, fontFamily ? { fontFamily } : null]}>
          SẮP TỚI
        </Text>
        {onOpenList ? (
          <Pressable hitSlop={8} onPress={onOpenList}>
            <Text style={styles.more}>Tất cả ›</Text>
          </Pressable>
        ) : null}
      </View>
      {items.map((item, idx) => (
        <Pressable
          key={`${item.kind}-${item.label}-${item.solar.year}-${item.solar.month}-${item.solar.day}`}
          style={[styles.row, idx > 0 ? styles.rowBorder : null]}
          onPress={() => onSelectDay(item.solar)}
        >
          <View style={[styles.dot, { backgroundColor: KIND_DOT[item.kind] }]} />
          <Text
            style={[styles.label, fontFamily ? { fontFamily } : null]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
          <Text style={[styles.dday, item.daysUntil === 0 && styles.ddayToday]}>
            {dDayLabel(item.daysUntil)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFBF5',
    borderWidth: 1,
    borderColor: 'rgba(196, 30, 58, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.crimson,
  },
  more: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.crimsonDeep,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(196, 30, 58, 0.12)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  dday: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.crimsonDeep,
  },
  ddayToday: {
    color: colors.crimson,
  },
});
