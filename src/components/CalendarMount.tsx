import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

type Props = {
  /** Saved / draft wish shown on the lacquer bar */
  wishText?: string;
  fontFamily?: string;
  children?: ReactNode;
};

/** Lacquer mount — bar shows the day’s wish; tap to edit. */
export function CalendarMount({ wishText, fontFamily, children }: Props) {
  const [open, setOpen] = useState(false);
  const trimmed = wishText?.trim() ?? '';
  const hasWish = trimmed.length > 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.goldEdge} />
      <View style={styles.rings}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.ringOuter}>
            <View style={styles.ringInner} />
          </View>
        ))}
      </View>

      <Pressable
        style={styles.bar}
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <Text
          style={[
            hasWish ? styles.wish : styles.wishEmpty,
            fontFamily ? { fontFamily } : null,
          ]}
          numberOfLines={2}
        >
          {hasWish ? trimmed : 'Viết điều ước của bạn'}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.goldSoft}
          style={styles.chev}
        />
      </Pressable>

      {open ? (
        <View style={styles.drawer}>
          <View style={styles.paperInset}>{children}</View>
        </View>
      ) : null}

      <View style={styles.goldEdgeBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.lacquer,
  },
  goldEdge: {
    height: 2,
    backgroundColor: colors.gold,
  },
  goldEdgeBottom: {
    height: 1.5,
    backgroundColor: colors.goldDeep,
    opacity: 0.85,
  },
  rings: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    paddingTop: 7,
    paddingBottom: 3,
  },
  ringOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.goldSoft,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lacquer,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 10,
    paddingTop: 2,
  },
  wish: {
    flex: 1,
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  wishEmpty: {
    flex: 1,
    color: 'rgba(255,250,243,0.55)',
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  chev: {
    flexShrink: 0,
  },
  drawer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  paperInset: {
    backgroundColor: colors.paper,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(240,215,140,0.45)',
  },
});
