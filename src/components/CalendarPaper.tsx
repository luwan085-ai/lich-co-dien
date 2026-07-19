import { StyleSheet, Text, View } from 'react-native';
import {
  kiengDigestLine,
  nenDigestLine,
  posterSummaryBar,
  statusDigestLine,
} from '../lib/dayDigest';
import type { CalendarDay } from '../lunar/today';
import { colors } from '../theme/tokens';
import { CornerOrnament } from './CornerOrnament';
import type { FlowerFace } from './HoaBeNgoan';
import { PaperTexture } from './PaperTexture';
import { PosterBrandWhisper } from './PosterBrandWhisper';

type Fonts = {
  display?: string;
  quote?: string;
  body?: string;
  bodyMedium?: string;
};

export type PosterBrandWhisperProps = {
  line: string;
  face?: FlowerFace;
  inkColor?: string;
  fontFamily?: string;
};

type Props = {
  day: CalendarDay;
  fonts?: Fonts;
  /** Stretch to fill parent (home hero). */
  fill?: boolean;
  /** Home hero — share-ready poster with today’s conclusion only. */
  compact?: boolean;
  /** Tiny praise whisper in poster whitespace (when stamped). */
  brandWhisper?: PosterBrandWhisperProps;
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
 * `compact`: poster layout — big date, nên/kiêng, one-line giờ + hướng.
 */
export function CalendarPaper({
  day,
  fonts,
  fill,
  compact,
  brandWhisper,
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
          fill && !compact && styles.centerBlockFill,
          compact && styles.centerBlockCompact,
        ]}
      >
        <View style={compact ? styles.posterTop : undefined}>
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
            <View style={styles.weekdayRibbon}>
              <View style={styles.weekdayGoldLine} />
              <View style={[styles.weekdayBar, styles.weekdayBarCompact]}>
                <Text
                  style={[
                    styles.weekdayText,
                    styles.weekdayTextCompact,
                    bodyMed ? { fontFamily: bodyMed } : null,
                  ]}
                >
                  {day.weekdayBanner}
                </Text>
              </View>
              <View style={styles.weekdayGoldLine} />
            </View>
          </View>
        )}

        <View style={[styles.solarRow, compact && styles.solarRowCompact]}>
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
              <Text
                key={`${ch}-${i}`}
                style={[styles.zhChar, compact && styles.zhCharCompact]}
              >
                {ch}
              </Text>
            ))}
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
            {brandWhisper ? (
              <View style={styles.brandInline}>
                <PosterBrandWhisper
                  line={brandWhisper.line}
                  face={brandWhisper.face}
                  inkColor={brandWhisper.inkColor}
                  fontFamily={brandWhisper.fontFamily}
                />
              </View>
            ) : null}
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
          </View>
        ) : null}
        </View>
      </View>

      <View style={[styles.footerBlock, compact && styles.footerBlockCompact]}>
        {compact ? (
          <View style={styles.summaryBar}>
            <Text
              style={[styles.summaryBarText, bodyMed ? { fontFamily: bodyMed } : null]}
            >
              {posterSummaryBar(day)}
            </Text>
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
    paddingTop: 6,
    paddingBottom: 10,
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
    marginTop: 1,
    letterSpacing: 1,
    fontWeight: '700',
  },
  solarMonth: {
    fontSize: 10,
    color: colors.inkFaint,
    marginTop: 1,
    letterSpacing: 0.5,
  },
  centerBlock: {
    alignItems: 'center',
    marginTop: 10,
    zIndex: 2,
  },
  centerBlockFill: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 0,
  },
  centerBlockCompact: {
    width: '100%',
    marginTop: 10,
    flexShrink: 0,
    justifyContent: 'flex-start',
  },
  posterTop: {
    width: '100%',
    alignItems: 'center',
  },
  brandInline: {
    marginTop: 6,
    marginBottom: 2,
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
    marginTop: 0,
    alignItems: 'center',
    alignSelf: 'center',
  },
  weekdayRibbon: {
    alignSelf: 'center',
    maxWidth: '100%',
  },
  weekdayGoldLine: {
    height: 1.5,
    backgroundColor: colors.gold,
    alignSelf: 'stretch',
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
    paddingVertical: 5,
    paddingHorizontal: 12,
    width: undefined,
    alignSelf: 'center',
  },
  weekdayText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  weekdayTextCompact: {
    letterSpacing: 0.8,
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
  solarRowCompact: {
    marginTop: 8,
    gap: 12,
  },
  solarDay: {
    fontSize: 108,
    lineHeight: 116,
    color: colors.crimson,
    fontWeight: '700',
  },
  solarDayCompact: {
    fontSize: 92,
    lineHeight: 98,
  },
  zhCol: {
    paddingTop: 12,
    borderLeftWidth: 1,
    borderLeftColor: colors.gold,
    paddingLeft: 10,
  },
  zhColCompact: {
    paddingTop: 10,
  },
  zhChar: {
    fontSize: 15,
    color: colors.ink,
    lineHeight: 20,
    fontWeight: '600',
  },
  zhCharCompact: {
    fontSize: 13,
    lineHeight: 17,
    color: colors.inkMuted,
  },
  digestBlock: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  statusLine: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  digestLine: {
    marginTop: 4,
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
    flexShrink: 0,
    gap: 0,
  },
  summaryBar: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 30, 58, 0.28)',
    marginBottom: 6,
  },
  summaryBarText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: colors.crimsonDeep,
    textAlign: 'center',
    letterSpacing: 0.15,
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
    paddingTop: 0,
    borderTopWidth: 0,
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
