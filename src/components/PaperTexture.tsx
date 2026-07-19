import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

/** Giấy dó flecks — warmer, denser handmade paper. */
export function PaperTexture() {
  const dots = [
    [6, 8],
    [14, 22],
    [21, 51],
    [28, 14],
    [35, 67],
    [42, 33],
    [49, 88],
    [56, 19],
    [63, 74],
    [70, 41],
    [77, 9],
    [84, 58],
    [91, 27],
    [11, 79],
    [38, 45],
    [52, 61],
    [67, 92],
    [81, 36],
    [18, 94],
    [73, 16],
    [25, 70],
    [88, 82],
    [45, 6],
    [59, 48],
  ] as const;

  return (
    <View style={[StyleSheet.absoluteFill, styles.root]}>
      {dots.map(([l, t], i) => (
        <View
          key={i}
          style={[
            i % 4 === 0 ? styles.fiber : styles.dot,
            {
              left: `${l}%`,
              top: `${t}%`,
              opacity: i % 3 === 0 ? 0.14 : 0.07,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    pointerEvents: 'none',
  },
  dot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.paperFiber,
  },
  fiber: {
    position: 'absolute',
    width: 5,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: colors.paperFiber,
    transform: [{ rotate: '25deg' }],
  },
});
