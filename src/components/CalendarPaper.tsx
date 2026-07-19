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
};

const STAMPS: { ch: string; rot: string }[] = [
  { ch: '祿', rot: '-8deg' },
  { ch: '壽', rot: '4deg' },
  { ch: '安', rot: '-3deg' },
];

const QUALITY_COLOR: Record<CalendarDay['dayPathTone'], string> = {
  great: colors.crimson,
  good: colors.crimsonDeep,
  neutral: colors.inkMuted,
  poor: '#8B6914',
  bad: '#5C2E2E',
};

export function CalendarPaper({ day, fonts }: Props) {
  const display = fonts?.display;
  const quote = fonts?.quote ?? display;
  const body = fonts?.body;
  const bodyMed = fonts?.bodyMedium ?? body;

  return (
    <View style={styles.paper}>
      <View style={styles.innerFrame} />
      <CornerOrnament position="tl" />
      <CornerOrnament position="tr" />
      <CornerOrnament position="bl" />
      <CornerOrnament position="br" />
      <PaperTexture />

      <View style={styles.topRow}>
        <View>
          <Text style={[styles.year, bodyMed ? { fontFamily: bodyMed } : null]}>
            {day.solar.year}
          </Text>
          <Text style={[styles.canChiYear, bodyMed ? { fontFamily: bodyMed } : null]}>
            {day.yearCanChiUpper}
          </Text>
          <Text style={[styles.solarMonth, body ? { fontFamily: body } : null]}>
            {day.solarMonthLine}
          </Text>
        </View>

        <View style={styles.sealStack}>
          <View style={styles.sealOuter}>
            <View style={styles.seal}>
              <Text style={styles.sealText}>福</Text>
              <Text style={styles.sealSub}>LỘC</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.centerBlock}>
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

      <View style={styles.metaDivider}>
        <View style={styles.metaDividerLine} />
        <Text style={styles.metaDividerMark}>◈</Text>
        <View style={styles.metaDividerLine} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaCol}>
          <Text style={[styles.metaRed, body ? { fontFamily: body } : null]}>
            Năm {day.canChi.year}
          </Text>
          <Text style={[styles.metaRed, body ? { fontFamily: body } : null]}>
            Tháng {day.canChi.month}
          </Text>
          <Text style={[styles.metaRed, body ? { fontFamily: body } : null]}>
            Ngày {day.canChi.day}
          </Text>
          <Text style={[styles.metaRed, body ? { fontFamily: body } : null]}>
            Giờ {day.canChi.hour}
          </Text>
          {day.metaLine ? (
            <Text style={[styles.metaSub, body ? { fontFamily: body } : null]}>
              {day.metaLine}
            </Text>
          ) : null}
        </View>

        <View style={styles.quoteCol}>
          <Text style={styles.quoteMark}>「</Text>
          <Text
            style={[styles.quoteText, quote ? { fontFamily: quote } : null]}
          >
            {day.quote.text}
          </Text>
          <Text style={[styles.quoteAuthor, body ? { fontFamily: body } : null]}>
            — {day.quote.author}
          </Text>
        </View>

        <View style={styles.metaColRight}>
          <Text
            style={[
              styles.sectionTitle,
              bodyMed ? { fontFamily: bodyMed } : null,
            ]}
          >
            GIỜ HOÀNG ĐẠO
          </Text>
          {day.hoangHours.slice(0, 4).map((h) => (
            <Text
              key={h.branch}
              style={[styles.hourLine, body ? { fontFamily: body } : null]}
            >
              {h.branch} · {h.time.replace(':00', 'h').replace('-', '–')}
            </Text>
          ))}
          <Text
            style={[
              styles.sectionTitle,
              styles.sectionGap,
              bodyMed ? { fontFamily: bodyMed } : null,
            ]}
          >
            THUẬN LỢI
          </Text>
          <Text style={[styles.favorText, body ? { fontFamily: body } : null]}>
            {day.favorable}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.stamps}>
          {STAMPS.map((s) => (
            <View
              key={s.ch}
              style={[styles.stamp, { transform: [{ rotate: s.rot }] }]}
            >
              <Text style={styles.stampText}>{s.ch}</Text>
            </View>
          ))}
        </View>
        <Text
          style={[styles.footerText, bodyMed ? { fontFamily: bodyMed } : null]}
        >
          TỨ QUÝ BÌNH AN
        </Text>
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
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
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  innerFrame: {
    ...StyleSheet.absoluteFill,
    margin: 4,
    borderWidth: 1,
    borderColor: colors.gold,
    opacity: 0.55,
    zIndex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  year: {
    fontSize: 14,
    color: colors.inkMuted,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  canChiYear: {
    fontSize: 12,
    color: colors.crimsonDeep,
    marginTop: 2,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  solarMonth: {
    fontSize: 10,
    color: colors.inkFaint,
    marginTop: 3,
    letterSpacing: 0.6,
  },
  sealStack: {
    paddingTop: 2,
  },
  sealOuter: {
    padding: 3,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft,
  },
  seal: {
    width: 46,
    height: 46,
    backgroundColor: colors.sealField,
    borderWidth: 1.5,
    borderColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealText: {
    color: colors.goldSoft,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
  },
  sealSub: {
    color: colors.gold,
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 1,
  },
  centerBlock: {
    alignItems: 'center',
    marginTop: 6,
    zIndex: 2,
  },
  lunarDay: {
    fontSize: 26,
    color: colors.ink,
    fontWeight: '600',
  },
  weekdayWrap: {
    marginTop: 6,
    width: '82%',
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
    paddingVertical: 7,
    width: '100%',
    alignItems: 'center',
  },
  weekdayText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  qualityLine: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  lunarMonth: {
    marginTop: 6,
    fontSize: 11,
    color: colors.inkMuted,
    letterSpacing: 0.9,
    fontWeight: '500',
  },
  solarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 12,
  },
  solarDay: {
    fontSize: 96,
    lineHeight: 104,
    color: colors.crimson,
    fontWeight: '700',
  },
  zhCol: {
    paddingTop: 10,
    borderLeftWidth: 1,
    borderLeftColor: colors.gold,
    paddingLeft: 8,
  },
  zhChar: {
    fontSize: 14,
    color: colors.ink,
    lineHeight: 19,
    fontWeight: '600',
  },
  metaDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 2,
    gap: 6,
    zIndex: 2,
  },
  metaDividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.crimson,
    opacity: 0.35,
  },
  metaDividerMark: {
    color: colors.goldDeep,
    fontSize: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    zIndex: 2,
  },
  metaCol: {
    flex: 1.05,
  },
  metaColRight: {
    flex: 1.15,
  },
  quoteCol: {
    flex: 1.25,
    paddingHorizontal: 5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.gold,
    opacity: 1,
  },
  quoteMark: {
    color: colors.crimsonSoft,
    fontSize: 14,
    lineHeight: 14,
  },
  metaRed: {
    fontSize: 10,
    color: colors.crimsonDeep,
    lineHeight: 14,
    fontWeight: '600',
  },
  metaSub: {
    marginTop: 6,
    fontSize: 9,
    fontStyle: 'italic',
    color: colors.inkFaint,
  },
  quoteText: {
    fontSize: 10,
    lineHeight: 14,
    color: colors.ink,
    textAlign: 'center',
  },
  quoteAuthor: {
    marginTop: 6,
    fontSize: 8,
    color: colors.inkFaint,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  sectionGap: {
    marginTop: 6,
  },
  hourLine: {
    fontSize: 8,
    color: colors.ink,
    lineHeight: 12,
  },
  favorText: {
    fontSize: 8,
    color: colors.inkMuted,
    lineHeight: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    zIndex: 2,
  },
  stamps: {
    flexDirection: 'row',
    gap: 5,
  },
  stamp: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: colors.sealInk,
    backgroundColor: 'rgba(196, 30, 58, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampText: {
    fontSize: 11,
    color: colors.sealInk,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 1.2,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    width: 54,
    justifyContent: 'flex-end',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.crimson,
    borderWidth: 1,
    borderColor: colors.gold,
  },
});
