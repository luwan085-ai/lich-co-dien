import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { CollapsibleStampPanel } from './CollapsibleStampPanel';
import { VnTeacherStamp } from './VnTeacherStamp';
import { freshInkSeed } from '../lib/stampInk';
import { playStampFeedback } from '../lib/localMoods';
import { PRAISE_STAMPS, type Praise } from '../types/mood';
import { colors } from '../theme/tokens';
import type { FlowerFace } from './HoaBeNgoan';

type Props = {
  selected?: Praise;
  inkSeed?: number;
  fontFamily?: string;
  stampFont?: string;
  face?: FlowerFace;
  inkColor?: string;
  onPick: (praise: Praise, inkSeed: number) => void;
};

export function PraiseStampPicker({
  selected,
  inkSeed,
  fontFamily,
  stampFont,
  face = 'happy',
  inkColor,
  onPick,
}: Props) {
  const [bangSeed, setBangSeed] = useState(inkSeed ?? 1);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(8);

  useEffect(() => {
    if (!selected) return;
    const tilt = PRAISE_STAMPS.find((p) => p.id === selected)?.tilt ?? 4;
    scale.value = 0.2;
    opacity.value = 0;
    rotate.value = tilt + 12;
    scale.value = withSequence(
      withTiming(1.1, { duration: 130, easing: Easing.out(Easing.back(1.8)) }),
      withTiming(1, { duration: 150 }),
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 70 }),
      withTiming(1, { duration: 950 }),
      withTiming(0, { duration: 260 }),
    );
    rotate.value = withTiming(tilt, { duration: 200 });
  }, [selected, bangSeed, scale, opacity, rotate]);

  const bangStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const active = PRAISE_STAMPS.find((m) => m.id === selected);
  const scriptFont = stampFont ?? fontFamily;

  return (
    <CollapsibleStampPanel
      panelId="praise"
      title="MỘC KHEN NGỢI"
      sub="Bộ 3 dấu: Làm tốt lắm! · Giỏi lắm! · Cô khen!"
      summary={
        active
          ? `Đã đóng: ${active.lines[0]} · chạm để mở`
          : 'Chạm để đóng dấu khen'
      }
      fontFamily={fontFamily}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {PRAISE_STAMPS.map((m) => {
          const isOn = selected === m.id;
          return (
            <Pressable
              key={m.id}
              style={[styles.chip, isOn && styles.chipOn]}
              onPress={() => {
                const seed = freshInkSeed();
                setBangSeed(seed);
                void playStampFeedback();
                onPick(m.id, seed);
              }}
            >
              <VnTeacherStamp
                praiseId={m.id}
                size="sm"
                inkSeed={isOn ? (inkSeed ?? bangSeed) : m.id.length * 9973}
                rotate={m.tilt * 0.2}
                fontFamily={scriptFont}
                face={face}
                inkColor={inkColor}
              />
              <Text style={[styles.label, inkColor ? { color: inkColor } : null]}>
                {m.labelVi}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.bangSlot}>
        {active ? (
          <Animated.View style={[styles.bang, bangStyle]}>
            <VnTeacherStamp
              praiseId={active.id}
              size="lg"
              inkSeed={bangSeed}
              rotate={0}
              fontFamily={scriptFont}
              face={face}
              inkColor={inkColor}
            />
          </Animated.View>
        ) : null}
      </View>
    </CollapsibleStampPanel>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingTop: 14,
    paddingBottom: 4,
    paddingRight: 8,
  },
  chip: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 4,
    backgroundColor: colors.paper,
  },
  chipOn: {
    borderColor: '#F5B4AE',
    backgroundColor: '#FFF5F4',
  },
  label: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    color: '#E83A24',
  },
  bangSlot: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    pointerEvents: 'none',
  },
  bang: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
