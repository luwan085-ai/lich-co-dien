import { StyleSheet, Text, View } from 'react-native';
import type { CalendarDay } from '../lunar/today';
import { colors } from '../theme/tokens';
import { CornerOrnament } from './CornerOrnament';
import { PaperTexture } from './PaperTexture';

type Fonts = {
  display?: string;
  quote?: string;
  body?: string;
  bodyMedium?: string;
};

type Props = {
  day: CalendarDay;
  fonts?: Fonts;
  /** Stretch to fill parent (home hero). */
  fill?: boolean;
};

const QUALITY_COLOR: Record<CalendarDay['dayPathTone'], string> = {
  great: colors.crimson,
  good: colors.crimsonDeep,
  neutral: colors.inkMuted,
  poor: '#8B6914',
  bad: '#5C2E2E',
};

/**
 * Core paper card — premium minimal.
 * Quote / Hoàng Đạo / footer stamps live below the fold or on Tử vi.
 */
export function CalendarPaper({ day, fonts, fill }: Props) {
  const display = fonts?.display;
  const body = fonts?.body;
  const bodyMed = fonts?.bodyMedium ?? body;

  return (
    <View style={[styles.paper, fill && styles.paperFill]}>
      <View style={styles.innerFrame} />
      <CornerOrnament position="tl" />
      <CornerOrnament position="tr" />
      <CornerOrnament position="bl" />
      <CornerOrnament position="br" />
      <PaperTexture />

      <View style={styles.topRow}>
        <Text style={[styles.year, bodyMed ? { fontFamily: bodyMed } : null]}>
          {day.solar.year}
        </Text>
        <Text
          style={[styles.canChiYear, bodyMed ? { fontFamily: bodyMed } : null]}
        >
          {day.yearCanChiUpper}
        </Text>
        <Text style={[styles.solarMonth, body ? { fontFamily: body } : null]}>
          {day.solarMonthLine}
        </Text>
      </View>

      <View style={[styles.centerBlock, fill && styles.centerBlockFill]}>
        <Text style={[styles.lunarDay, display ? { fontFamily: display } : null]}>
          {day.lunar.day}
        </Text>

        <View style={styles.weekdayWrap}>
          <View style={styles.weekdayGold} />
          <View style={styles.weekdayBar}>
            <Text
              style={[
                styles.weekdayText,
                bodyMed ? { fontFamily: bodyMed } : null,
              ]}
            >
              {day.weekdayBanner}
            </Text>
          </View>
          <View style={styles.weekdayGold} />
        </View>

        <Text
          style={[
            styles.qualityLine,
            { color: QUALITY_COLOR[day.dayPathTone] },
            bodyMed ? { fontFamily: bodyMed } : null,
          ]}
        >
          {day.dayPathLabel} · {day.qualityLabel}
        </Text>

        <Text style={[styles.lunarMonth, body ? { fontFamily: body } : null]}>
          {day.lunar.monthLabel} ({day.lunar.lengthLabel})
        </Text>

        <View style={styles.solarRow}>
          <Text
            style={[styles.solarDay, display ? { fontFamily: display } : null]}
          >
            {day.solar.day}
          </Text>
          <View style={styles.zhCol}>
            {day.weekdayZh.split('').map((ch, i) => (
              <Text key={`${ch}-${i}`} style={styles.zhChar}>
                {ch}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.canChiRow}>
        <Text style={[styles.canChiItem, body ? { fontFamily: body } : null]}>
          Năm {day.canChi.year}
        </Text>
        <Text style={styles.canChiDot}>·</Text>
        <Text style={[styles.canChiItem, body ? { fontFamily: body } : null]}>
          Tháng {day.canChi.month}
        </Text>
        <Text style={styles.canChiDot}>·</Text>
        <Text style={[styles.canChiItem, body ? { fontFamily: body } : null]}>
          Ngày {day.canChi.day}
        </Text>
        <Text style={styles.canChiDot}>·</Text>
        <Text style={[styles.canChiItem, body ? { fontFamily: body } : null]}>
          Giờ {day.canChi.hour}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    backgroundColor: colors.paper,
    borderWidth: 2.5,
    borderColor: colors.crimson,
    borderTopWidth: 0,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    overflow: 'hidden',
  },
  paperFill: {
    flex: 1,
    justifyContent: 'space-between',
  },
  innerFrame: {
    ...StyleSheet.absoluteFill,
    margin: 5,
    borderWidth: 1,
    borderColor: colors.gold,
    opacity: 0.45,
    zIndex: 1,
  },
  topRow: {
    zIndex: 2,
    alignItems: 'flex-start',
  },
  year: {
    fontSize: 14,
    color: colors.inkMuted,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  canChiYear: {
    fontSize: 13,
    color: colors.crimsonDeep,
    marginTop: 3,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  solarMonth: {
    fontSize: 11,
    color: colors.inkFaint,
    marginTop: 4,
    letterSpacing: 0.6,
  },
  centerBlock: {
    alignItems: 'center',
    marginTop: 10,
    zIndex: 2,
  },
  centerBlockFill: {
    flexGrow: 1,
    justifyContent: 'center',
    marginTop: 0,
  },
  lunarDay: {
    fontSize: 28,
    color: colors.ink,
    fontWeight: '600',
  },
  weekdayWrap: {
    marginTop: 8,
    width: '78%',
    alignItems: 'center',
  },
  weekdayGold: {
    width: '100%',
    height: 1.5,
    backgroundColor: colors.gold,
  },
  weekdayBar: {
    backgroundColor: colors.crimson,
    paddingHorizontal: 20,
    paddingVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  weekdayText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  qualityLine: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  lunarMonth: {
    marginTop: 8,
    fontSize: 12,
    color: colors.inkMuted,
    letterSpacing: 0.9,
    fontWeight: '500',
  },
  solarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 14,
  },
  solarDay: {
    fontSize: 108,
    lineHeight: 116,
    color: colors.crimson,
    fontWeight: '700',
  },
  zhCol: {
    paddingTop: 12,
    borderLeftWidth: 1,
    borderLeftColor: colors.gold,
    paddingLeft: 10,
  },
  zhChar: {
    fontSize: 15,
    color: colors.ink,
    lineHeight: 20,
    fontWeight: '600',
  },
  canChiRow: {
    zIndex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(196, 30, 58, 0.28)',
  },
  canChiItem: {
    fontSize: 11,
    color: colors.crimsonDeep,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  canChiDot: {
    fontSize: 11,
    color: colors.goldDeep,
    opacity: 0.7,
  },
});
