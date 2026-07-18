import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  fontFamily?: string;
};

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
        <Text style={[styles.side, fontFamily ? { fontFamily } : null]}>
          ✦ PHÚ QUÝ ✦
        </Text>
        <View style={styles.centerBlock}>
          <Text style={styles.leaf}>❀</Text>
          <Text style={[styles.center, fontFamily ? { fontFamily } : null]}>
            VINH HOA
          </Text>
          <Text style={styles.leaf}>❀</Text>
        </View>
        <Text style={[styles.side, fontFamily ? { fontFamily } : null]}>
          ✦ CÁT TƯỜNG ✦
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
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 9,
    paddingTop: 2,
  },
  side: {
    color: colors.goldSoft,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  centerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  leaf: {
    color: colors.goldSoft,
    fontSize: 8,
  },
  center: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
