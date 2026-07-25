import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  fontFamily?: string;
};

/** Lacquer mount — clean wooden/lacquer header with brass rings. */
export function CalendarMount({ fontFamily }: Props) {
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

      <View style={styles.bar}>
        <Text style={[styles.title, fontFamily ? { fontFamily } : null]}>
          LỊCH CỔ ĐIỂN
        </Text>
      </View>

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
    paddingTop: 6,
    paddingBottom: 2,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  title: {
    color: colors.goldSoft,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
