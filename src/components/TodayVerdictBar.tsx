import { StyleSheet, Text, View } from 'react-native';
import type { CalendarDay } from '../lunar/today';
import { colors } from '../theme/tokens';

type Props = {
  day: CalendarDay;
  fontFamily?: string;
};

const TONE: Record<CalendarDay['dayPathTone'], string> = {
  great: colors.crimson,
  good: colors.crimsonDeep,
  neutral: colors.inkMuted,
  poor: '#8B6914',
  bad: '#5C2E2E',
};

function joinShort(items: string[], fallback: string, max = 2): string {
  if (items.length === 0) return fallback;
  return items.slice(0, max).join(', ');
}

function judgmentHeadline(day: CalendarDay): string {
  if (day.dayPathTone === 'great') return 'Hôm nay rất thuận';
  if (day.dayPathTone === 'good' && day.isGoodDay) return 'Hôm nay khá tốt';
  if (day.dayPathTone === 'bad') return 'Hôm nay nên thận trọng';
  if (day.dayPathTone === 'poor') return 'Hôm nay nên tĩnh';
  if (day.isGoodDay) return 'Hôm nay ổn';
  return 'Hôm nay bình thường';
}

/** Judgment-first “today” card — less thinking for the user. */
export function TodayVerdictBar({ day, fontFamily }: Props) {
  const tone = TONE[day.dayPathTone];
  const head = judgmentHeadline(day);
  const nen = joinShort(day.shouldDo, 'khai trương, xuất hành');
  const kieng = joinShort(day.avoidDo, 'quyết định vội');

  return (
    <View style={styles.wrap}>
      <Text style={[styles.kicker, fontFamily ? { fontFamily } : null]}>
        HÔM NAY
      </Text>
      <Text style={[styles.headline, { color: tone }, fontFamily ? { fontFamily } : null]}>
        {head}
      </Text>
      <Text style={[styles.fitLine, fontFamily ? { fontFamily } : null]} numberOfLines={2}>
        {day.qualityLabel} · hợp {nen}
      </Text>
      <Text style={[styles.avoidLine, fontFamily ? { fontFamily } : null]} numberOfLines={2}>
        Tránh {kieng}
      </Text>
      <Text style={[styles.pathHint, fontFamily ? { fontFamily } : null]}>
        {day.dayPathLabel}
      </Text>
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
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.crimson,
    marginBottom: 4,
  },
  headline: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  fitLine: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink,
    fontWeight: '600',
  },
  avoidLine: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: colors.crimsonDeep,
    fontWeight: '700',
  },
  pathHint: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '600',
    color: colors.inkFaint,
    letterSpacing: 0.2,
  },
});
