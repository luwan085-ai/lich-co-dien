import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

/** Traditional corner bracket — góc khung lịch bloc. */
export function CornerOrnament({
  position,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br';
}) {
  const flipX = position === 'tr' || position === 'br';
  const flipY = position === 'bl' || position === 'br';

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        position === 'tl' && styles.tl,
        position === 'tr' && styles.tr,
        position === 'bl' && styles.bl,
        position === 'br' && styles.br,
        {
          transform: [
            { scaleX: flipX ? -1 : 1 },
            { scaleY: flipY ? -1 : 1 },
          ],
        },
      ]}
    >
      <View style={styles.h} />
      <View style={styles.v} />
      <View style={styles.diamond} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: 22,
    height: 22,
    zIndex: 3,
  },
  tl: { top: 6, left: 6 },
  tr: { top: 6, right: 6 },
  bl: { bottom: 6, left: 6 },
  br: { bottom: 6, right: 6 },
  h: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 18,
    height: 2,
    backgroundColor: colors.crimson,
  },
  v: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 2,
    height: 18,
    backgroundColor: colors.crimson,
  },
  diamond: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 6,
    height: 6,
    backgroundColor: colors.gold,
    transform: [{ rotate: '45deg' }],
  },
});
