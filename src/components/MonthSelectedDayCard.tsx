import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SolarDate } from '../lunar/solar';
import { getCalendarDayForSolar } from '../lunar/today';
import type { DayMemo } from '../lib/localMemos';
import {
  buildMonthSelectedSummary,
  memoNoteForSolar,
} from '../lib/monthDaySummary';
import { colors } from '../theme/tokens';

type Props = {
  selected: SolarDate;
  memos: Record<string, DayMemo>;
  fontFamily?: string;
  displayFont?: string;
  onOpenDay: (day: SolarDate) => void;
};

/** Ngày đã chọn — digest before opening Hôm nay. */
export function MonthSelectedDayCard({
  selected,
  memos,
  fontFamily,
  displayFont,
  onOpenDay,
}: Props) {
  const day = getCalendarDayForSolar(selected, 12);
  const summary = buildMonthSelectedSummary(day, memos);
  const note = memoNoteForSolar(memos, selected);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.kicker, fontFamily ? { fontFamily } : null]}>
        NGÀY ĐÃ CHỌN
      </Text>
      <Text
        style={[styles.headline, displayFont ? { fontFamily: displayFont } : null]}
      >
        {summary.headline}
      </Text>
      <Text style={[styles.line, fontFamily ? { fontFamily } : null]}>
        {summary.statusLine}
      </Text>
      <Text style={[styles.personal, fontFamily ? { fontFamily } : null]}>
        {summary.personalLine}
      </Text>
      {note ? (
        <Text style={[styles.note, fontFamily ? { fontFamily } : null]}>
          Ghi chú: {note}
        </Text>
      ) : null}
      <Text style={[styles.action, fontFamily ? { fontFamily } : null]}>
        {summary.actionLine}
      </Text>
      <Pressable style={styles.cta} onPress={() => onOpenDay(selected)}>
        <Text style={[styles.ctaText, fontFamily ? { fontFamily } : null]}>
          Mở tờ lịch ngày này ›
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    backgroundColor: '#FFFBF5',
    borderWidth: 1,
    borderColor: 'rgba(196, 30, 58, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.crimson,
    marginBottom: 6,
  },
  headline: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 24,
  },
  line: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    color: colors.inkMuted,
  },
  personal: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    color: colors.crimsonDeep,
  },
  note: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkMuted,
    fontWeight: '600',
  },
  action: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 16,
    color: colors.inkMuted,
    fontWeight: '600',
  },
  cta: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.crimson,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.paper,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.crimson,
  },
});
