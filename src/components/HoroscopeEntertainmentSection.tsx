import { useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BoiQueCard } from './BoiQueCard';
import type { CalendarDay } from '../lunar/today';
import { buildKillerPack } from '../lib/killerPack';
import { colors } from '../theme/tokens';

type Props = {
  day: CalendarDay;
  fontFamily?: string;
};

/** Collapsed Giải trí — lucky numbers + bói quẻ, away from core tử vi. */
export function HoroscopeEntertainmentSection({ day, fontFamily }: Props) {
  const pack = useMemo(() => buildKillerPack(day), [day]);
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.header} onPress={() => setOpen((v) => !v)}>
        <View style={styles.headerText}>
          <Text style={[styles.kicker, fontFamily ? { fontFamily } : null]}>
            GIẢI TRÍ
          </Text>
          <Text style={[styles.summary, fontFamily ? { fontFamily } : null]}>
            Cặp số & Bói quẻ · {open ? 'thu gọn' : 'chạm để mở'}
          </Text>
        </View>
        <Text style={styles.chev}>{open ? '▾' : '▸'}</Text>
      </Pressable>

      {open ? (
        <View style={styles.body}>
          <Text style={styles.numHeadline}>{pack.taiLoc.headline}</Text>
          <View style={styles.numRow}>
            {pack.taiLoc.numbers.map((n) => (
              <View key={n} style={styles.numPill}>
                <Text style={styles.numText}>{String(n).padStart(2, '0')}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.disclaimer}>{pack.taiLoc.disclaimer}</Text>
          <Pressable
            style={styles.softLink}
            onPress={() => void Linking.openURL(pack.taiLoc.kqxsUrl)}
          >
            <Text style={styles.softLinkText}>Tra cứu KQXS công khai ›</Text>
          </Pressable>
          <BoiQueCard fontFamily={fontFamily} compact />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerText: { flex: 1 },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.inkFaint,
  },
  summary: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkMuted,
  },
  chev: {
    fontSize: 14,
    color: colors.inkFaint,
    marginLeft: 8,
  },
  body: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  numHeadline: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkMuted,
    lineHeight: 18,
  },
  numRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  numPill: {
    minWidth: 36,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: colors.paperDeep,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  numText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.inkMuted,
  },
  disclaimer: {
    marginTop: 10,
    fontSize: 10,
    lineHeight: 14,
    color: colors.inkFaint,
  },
  softLink: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  softLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.crimsonDeep,
  },
});
