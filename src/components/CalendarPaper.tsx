import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  kiengDigestLine,
  nenDigestLine,
  statusDigestLine,
} from '../lib/dayDigest';
import type { CalendarDay } from '../lunar/today';
import { colors } from '../theme/tokens';
import { CornerOrnament } from './CornerOrnament';
import { HoangHourChips } from './HoangHourChips';
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
  /** Home hero — today digest inside the paper. */
  compact?: boolean;
  /** Stamps in the side margins beside the solar date. */
  leftWing?: ReactNode;
  rightWing?: ReactNode;
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
 * `compact`: share-ready + today digest (status · nên/kiêng · giờ tốt).
 */
export function CalendarPaper({
  day,
  fonts,
  fill,
  compact,
  leftWing,
  rightWing,
}: Props) {
  const display = fonts?.display;
  const body = fonts?.body;
  const bodyMed = fonts?.bodyMedium ?? body;

  return (
    <View style={[styles.paper, fill && styles.paperFill, compact && styles.paperCompact]}>
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

      <View
        style={[
          styles.centerBlock,
          fill && styles.centerBlockFill,
          compact && styles.centerBlockCompact,
        ]}
      >
        {!compact ? (
          <>
            <Text
              style={[
                styles.lunarDay,
                display ? { fontFamily: display } : null,
              ]}
            >
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
          </>
        ) : (
          <View style={styles.weekdayWrapCompact}>
            <View style={styles.weekdayGold} />
            <View style={[styles.weekdayBar, styles.weekdayBarCompact]}>
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
        )}

        <View style={[styles.solarRowOuter, compact && styles.solarRowOuterCompact]}>
          <View style={[styles.solarWing, styles.solarWingLeft]}>
            {leftWing}
          </View>
          <View style={[styles.solarCluster, compact && styles.solarClusterCompact]}>
            <Text
              style={[
                styles.solarDay,
                compact && styles.solarDayCompact,
                display ? { fontFamily: display } : null,
              ]}
            >
              {day.solar.day}
            </Text>
            <View style={[styles.zhCol, compact && styles.zhColCompact]}>
              {day.weekdayZh.split('').map((ch, i) => (
                <Text key={`${ch}-${i}`} style={styles.zhChar}>
                  {ch}
                </Text>
              ))}
            </View>
          </View>
          <View style={[styles.solarWing, styles.solarWingRight]}>
            {rightWing}
          </View>
        </View>

        {compact ? (
          <View style={styles.digestBlock}>
            <Text
              style={[
                styles.statusLine,
                { color: QUALITY_COLOR[day.dayPathTone] },
                bodyMed ? { fontFamily: bodyMed } : null,
              ]}
            >
              {statusDigestLine(day)}
            </Text>
            <Text style={[styles.digestLine, body ? { fontFamily: body } : null]}>
              {nenDigestLine(day)}
            </Text>
            <Text
              style={[
                styles.digestLine,
                styles.digestKieng,
                body ? { fontFamily: body } : null,
              ]}
            >
              {kiengDigestLine(day)}
            </Text>
            <Text style={[styles.lunarMonthCompact, body ? { fontFamily: body } : null]}>
              Âm {day.lunar.day}/{day.lunar.month}
              {day.lunar.leapMonth ? ' nhuận' : ''}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.footerBlock, compact && styles.footerBlockCompact]}>
        {compact && day.hoangHours.length > 0 ? (
          <View style={styles.hoangSection}>
            <Text
              style={[
                styles.hoangLabel,
                bodyMed ? { fontFamily: bodyMed } : null,
              ]}
            >
              GIỜ HOÀNG ĐẠO
            </Text>
            <HoangHourChips
              hours={day.hoangHours}
              size="sm"
              fontFamily={bodyMed}
            />
          </View>
        ) : null}
        <View style={[styles.canChiRow, compact && styles.canChiRowCompact]}>
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
  paperCompact: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
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
    fontSize: 13,
    color: colors.inkMuted,
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  canChiYear: {
    fontSize: 12,
    color: colors.crimsonDeep,
    marginTop: 2,
    letterSpacing: 1,
    fontWeight: '700',
  },
  solarMonth: {
    fontSize: 10,
    color: colors.inkFaint,
    marginTop: 2,
    letterSpacing: 0.5,
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
  centerBlockCompact: {
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
  weekdayWrapCompact: {
    marginTop: 2,
    width: '84%',
    alignItems: 'center',
  },
  weekdayGold: {
    width: '100%',
    height: 1.5,
    backgroundColor: colors.gold,
  },
  weekdayBar: {
    backgroundColor: colors.crimson,
    paddingHorizontal: 16,
    paddingVertical: 6,
    width: '100%',
    alignItems: 'center',
  },
  weekdayBarCompact: {
    paddingVertical: 4,
  },
  weekdayText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
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
  lunarMonthCompact: {
    marginTop: 4,
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 0.3,
    fontWeight: '600',
    textAlign: 'center',
  },
  solarRowOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  solarRowOuterCompact: {
    marginTop: 2,
  },
  solarWing: {
    flex: 1,
    minWidth: 52,
    justifyContent: 'center',
  },
  solarWingLeft: {
    alignItems: 'flex-end',
    paddingRight: 4,
  },
  solarWingRight: {
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  solarCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 14,
  },
  solarClusterCompact: {
    gap: 10,
  },
  solarDay: {
    fontSize: 108,
    lineHeight: 116,
    color: colors.crimson,
    fontWeight: '700',
  },
  solarDayCompact: {
    fontSize: 72,
    lineHeight: 78,
  },
  zhCol: {
    paddingTop: 12,
    borderLeftWidth: 1,
    borderLeftColor: colors.gold,
    paddingLeft: 10,
  },
  zhColCompact: {
    paddingTop: 8,
  },
  zhChar: {
    fontSize: 15,
    color: colors.ink,
    lineHeight: 20,
    fontWeight: '600',
  },
  digestBlock: {
    marginTop: 4,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  statusLine: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  digestLine: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    color: colors.ink,
    fontWeight: '600',
    textAlign: 'center',
  },
  digestKieng: {
    color: colors.crimsonDeep,
  },
  footerBlock: {
    zIndex: 2,
  },
  footerBlockCompact: {
    gap: 4,
    flexShrink: 0,
  },
  hoangSection: {
    width: '100%',
    paddingTop: 2,
  },
  hoangLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: colors.crimsonSoft,
    marginBottom: 4,
    textAlign: 'center',
  },
  canChiRow: {
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
  canChiRowCompact: {
    marginTop: 0,
    paddingTop: 6,
  },
  canChiItem: {
    fontSize: 10,
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
