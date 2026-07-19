import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { findNextHoangIndex, isHourActive } from '../lib/hoangHours';
import type { HoangHour } from '../lunar/today';
import { getVietnamHour } from '../lunar/vietnamTime';
import { colors } from '../theme/tokens';

type Props = {
  hours: HoangHour[];
  fontFamily?: string;
  /** `sm` fits inside the paper card. */
  size?: 'sm' | 'md';
  /** `grid` shows all slots without horizontal clip. */
  layout?: 'scroll' | 'grid';
};

function formatHourRange(time: string): string {
  return time.replace(/:00/g, ':00');
}

export function HoangHourChips({
  hours,
  fontFamily,
  size = 'md',
  layout = 'scroll',
}: Props) {
  const nowH = getVietnamHour();
  const sm = size === 'sm';
  const grid = layout === 'grid';

  if (!hours.length) {
    return <Text style={styles.empty}>—</Text>;
  }

  const nextIdx = findNextHoangIndex(hours, nowH);
  const chips = hours.slice(0, 6);

  const chipNodes = chips.map((h, i) => {
    const active = isHourActive(h.time, nowH);
    const isNext = i === nextIdx && !active;
    return (
      <View
        key={`${h.branch}-${h.time}`}
        style={[
          styles.chip,
          sm && styles.chipSm,
          grid && styles.chipGrid,
          active && styles.chipActive,
          isNext && styles.chipNext,
        ]}
      >
        {isNext ? (
          <Text
            style={[
              styles.badge,
              sm && styles.badgeSm,
              fontFamily ? { fontFamily } : null,
            ]}
          >
            Tiếp theo
          </Text>
        ) : null}
        {active ? (
          <Text
            style={[
              styles.badge,
              styles.badgeNow,
              sm && styles.badgeSm,
              fontFamily ? { fontFamily } : null,
            ]}
          >
            Đang trong
          </Text>
        ) : null}
        <Text
          style={[
            styles.time,
            sm && styles.timeSm,
            grid && styles.timeGrid,
            (active || isNext) && styles.textActive,
            fontFamily ? { fontFamily } : null,
          ]}
        >
          {formatHourRange(h.time)}
        </Text>
        <Text
          style={[
            styles.branch,
            sm && styles.branchSm,
            grid && styles.branchGrid,
            (active || isNext) && styles.textActive,
            fontFamily ? { fontFamily } : null,
          ]}
        >
          {h.branch}
        </Text>
      </View>
    );
  });

  if (grid) {
    return <View style={styles.grid}>{chipNodes}</View>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {chipNodes}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 88,
  },
  chipSm: {
    minWidth: 76,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  chipGrid: {
    width: '31%',
    minWidth: 0,
    flexGrow: 1,
    paddingHorizontal: 6,
    paddingVertical: 7,
  },
  chipActive: {
    borderColor: colors.crimson,
    backgroundColor: '#FFF5F4',
    borderWidth: 1.5,
  },
  chipNext: {
    borderColor: colors.crimson,
    backgroundColor: '#FFFAF8',
    borderWidth: 2,
  },
  badge: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: colors.crimson,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  badgeSm: {
    fontSize: 7,
    marginBottom: 2,
  },
  badgeNow: {
    color: colors.crimsonDeep,
  },
  time: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.inkMuted,
  },
  timeSm: {
    fontSize: 9,
  },
  timeGrid: {
    fontSize: 9,
    lineHeight: 12,
  },
  branch: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
  },
  branchSm: {
    fontSize: 11,
    marginTop: 1,
  },
  branchGrid: {
    fontSize: 11,
    marginTop: 1,
  },
  textActive: {
    color: colors.crimsonDeep,
  },
  empty: {
    fontSize: 12,
    color: colors.inkFaint,
  },
});
