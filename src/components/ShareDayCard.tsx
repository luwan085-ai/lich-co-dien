import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CalendarDay } from '../lunar/today';
import { colors } from '../theme/tokens';
import { HoaBeNgoan, type FlowerFace } from './HoaBeNgoan';
import { stampInkForSkin } from '../lib/stampInk';
import type { Praise } from '../types/mood';
import { PRAISE_STAMPS } from '../types/mood';

type Props = {
  day: CalendarDay;
  face: FlowerFace;
  praiseId?: Praise;
  skin?: 'classic' | 'gold' | 'tape';
  fontFamily?: string;
  displayFont?: string;
};

/** Shareable paper card — capture with view-shot. */
export const ShareDayCard = forwardRef<View, Props>(function ShareDayCard(
  { day, face, praiseId, skin = 'classic', fontFamily, displayFont },
  ref,
) {
  const praise = PRAISE_STAMPS.find((p) => p.id === praiseId);
  const ink = stampInkForSkin(skin);

  return (
    <View
      ref={ref}
      style={[
        styles.card,
        skin === 'gold' && styles.cardGold,
        skin === 'tape' && styles.cardTape,
      ]}
      collapsable={false}
    >
      {skin === 'tape' ? (
        <>
          <View style={[styles.tape, styles.tapeL]} />
          <View style={[styles.tape, styles.tapeR]} />
        </>
      ) : null}
      <Text style={styles.brand}>LỊCH CỔ ĐIỂN</Text>
      <Text style={[styles.weekday, fontFamily ? { fontFamily } : null]}>
        {day.weekdayVi}
      </Text>
      <Text
        style={[styles.solar, displayFont ? { fontFamily: displayFont } : null]}
      >
        {day.solar.day}
      </Text>
      <Text style={styles.lunar}>
        Âm {day.lunar.day} · {day.lunar.monthLabel}
      </Text>
      <Text style={styles.quality}>{day.qualityLabel}</Text>
      <Text style={styles.quote} numberOfLines={3}>
        “{day.quote.text}”
      </Text>
      {praise ? (
        <View style={styles.stampRow}>
          <HoaBeNgoan size={44} color={ink} face={face} />
          <Text
            style={[
              styles.praise,
              { color: ink },
              fontFamily ? { fontFamily } : null,
            ]}
          >
            {praise.lines.join('\n')}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 320,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    overflow: 'hidden',
  },
  cardGold: {
    borderColor: colors.gold,
    borderWidth: 2,
    backgroundColor: '#FFF9EE',
  },
  cardTape: {
    backgroundColor: '#FFFCF6',
  },
  tape: {
    position: 'absolute',
    width: 72,
    height: 18,
    backgroundColor: 'rgba(201, 168, 76, 0.45)',
    zIndex: 2,
  },
  tapeL: { top: 10, left: -8, transform: [{ rotate: '-12deg' }] },
  tapeR: { top: 14, right: -10, transform: [{ rotate: '10deg' }] },
  brand: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 1.2,
  },
  weekday: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '700',
    color: colors.crimson,
  },
  solar: {
    marginTop: 4,
    fontSize: 72,
    lineHeight: 78,
    fontWeight: '700',
    color: colors.ink,
  },
  lunar: { marginTop: 4, fontSize: 14, color: colors.inkMuted },
  quality: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '800',
    color: colors.goldDeep,
  },
  quote: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    color: colors.ink,
  },
  stampRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  praise: {
    fontSize: 22,
    fontWeight: '700',
    fontStyle: 'italic',
  },
});
