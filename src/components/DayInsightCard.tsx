import { StyleSheet, Text, View } from 'react-native';
import type { CalendarDay } from '../lunar/today';
import { colors } from '../theme/tokens';

type Props = {
  day: CalendarDay;
  fontFamily?: string;
  /** Hide badge row — quality already on paper */
  compact?: boolean;
};

const TONE_COLOR: Record<CalendarDay['dayPathTone'], string> = {
  great: colors.crimson,
  good: colors.crimson,
  neutral: colors.inkMuted,
  poor: '#8B6914',
  bad: '#5C2E2E',
};

export function DayInsightCard({ day, fontFamily, compact = false }: Props) {
  const tone = TONE_COLOR[day.dayPathTone];
  const clock = `${String(new Date().getHours()).padStart(2, '0')}:${String(
    new Date().getMinutes(),
  ).padStart(2, '0')}`;

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.quoteBlock}>
        <Text style={styles.quoteMark}>「</Text>
        <Text
          style={[styles.quoteText, fontFamily ? { fontFamily } : null]}
          numberOfLines={4}
        >
          {day.quote.text}
        </Text>
        <Text style={styles.quoteAuthor}>— {day.quote.author}</Text>
      </View>

      {!compact ? (
        <View style={styles.top}>
          <View style={[styles.badge, { borderColor: tone }]}>
            <Text style={[styles.badgeText, { color: tone }, fontFamily ? { fontFamily } : null]}>
              {day.dayPathLabel}
            </Text>
          </View>
          <Text style={styles.quality}>{day.qualityLabel}</Text>
        </View>
      ) : null}

      <Text style={[styles.summary, compact && styles.summaryCompact]}>
        {day.summaryLine}
      </Text>

      <View style={[styles.row3, compact && styles.row3Compact]}>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>GIỜ HIỆN TẠI</Text>
          <Text style={[styles.cellValue, fontFamily ? { fontFamily } : null]}>
            Giờ {day.canChi.hourBranch}
          </Text>
          <Text style={styles.cellSub}>{clock}</Text>
          <Text style={styles.cellSub}>{day.canChi.hour}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>NÊN LÀM</Text>
          <Text style={styles.cellBody}>
            {day.shouldDo.length > 0
              ? day.shouldDo.slice(0, 3).join(', ')
              : 'Giữ nhịp sống nhẹ nhàng'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>NÊN KIÊNG</Text>
          <Text style={styles.cellBody}>
            {day.avoidDo.length > 0
              ? day.avoidDo.slice(0, 3).join(', ')
              : 'Tránh quyết định vội'}
          </Text>
        </View>
      </View>

      {day.hoangHours.length > 0 ? (
        <View style={styles.hours}>
          <Text style={[styles.hoursTitle, fontFamily ? { fontFamily } : null]}>
            GIỜ HOÀNG ĐẠO
          </Text>
          <Text style={styles.hoursBody}>
            {day.hoangHours
              .slice(0, 6)
              .map((h) => `${h.branch} ${h.time.replace(':00', 'h')}`)
              .join(' · ')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  cardCompact: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  quoteBlock: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  quoteMark: {
    color: colors.crimsonSoft,
    fontSize: 16,
    lineHeight: 16,
    marginBottom: 2,
  },
  quoteText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    marginTop: 6,
    fontSize: 11,
    color: colors.inkFaint,
    fontStyle: 'italic',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  quality: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkMuted,
  },
  summary: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink,
  },
  summaryCompact: {
    marginTop: 0,
    fontSize: 12,
    lineHeight: 18,
  },
  row3: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  row3Compact: {
    marginTop: 10,
    paddingTop: 10,
  },
  cell: { flex: 1 },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  cellLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cellValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  cellSub: {
    marginTop: 2,
    fontSize: 11,
    color: colors.inkMuted,
  },
  cellBody: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.ink,
  },
  hours: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  hoursTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.5,
  },
  hoursBody: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: colors.inkMuted,
  },
});
