import { StyleSheet, Text, View } from 'react-native';
import type { FlowerFace } from './HoaBeNgoan';
import { HoaBeNgoan } from './HoaBeNgoan';
import { colors } from '../theme/tokens';

type Props = {
  line: string;
  face?: FlowerFace;
  inkColor?: string;
  fontFamily?: string;
};

/** Tiny brand whisper — sits in poster whitespace, never competes with the date. */
export function PosterBrandWhisper({
  line,
  face = 'happy',
  inkColor = colors.crimson,
  fontFamily,
}: Props) {
  return (
    <View style={styles.wrap}>
      <HoaBeNgoan size={22} color={inkColor} face={face} />
      <Text
        style={[
          styles.line,
          { color: inkColor },
          fontFamily ? { fontFamily } : null,
        ]}
      >
        {line}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.88,
  },
  line: {
    fontSize: 11,
    fontWeight: '700',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
});
