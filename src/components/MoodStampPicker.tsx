import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { CollapsibleStampPanel } from './CollapsibleStampPanel';
import { MOOD_STAMPS, type Mood } from '../types/mood';
import { colors } from '../theme/tokens';
import { playStampFeedback } from '../lib/localMoods';

type Props = {
  selected?: Mood;
  fontFamily?: string;
  /** Profile card — no collapsible home panel wrapper. */
  plain?: boolean;
  onPick: (mood: Mood) => void;
};

export function MoodStampPicker({
  selected,
  fontFamily,
  plain,
  onPick,
}: Props) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(-12);

  useEffect(() => {
    if (!selected) return;
    scale.value = 0.2;
    opacity.value = 0;
    rotate.value = -18;
    scale.value = withSequence(
      withTiming(1.15, { duration: 160, easing: Easing.out(Easing.back(1.6)) }),
      withTiming(1, { duration: 120 }),
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 120 }),
      withTiming(1, { duration: 700 }),
      withTiming(0, { duration: 280 }),
    );
    rotate.value = withTiming(-6, { duration: 180 });
  }, [selected, scale, opacity, rotate]);

  const bangStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const active = MOOD_STAMPS.find((m) => m.id === selected);

  const body = (
    <>
      <View style={styles.row}>
        {MOOD_STAMPS.map((m) => {
          const isOn = selected === m.id;
          return (
            <Pressable
              key={m.id}
              style={[
                styles.stamp,
                { borderColor: m.color },
                isOn && { backgroundColor: `${m.color}18` },
              ]}
              onPress={() => {
                void playStampFeedback();
                onPick(m.id);
              }}
            >
              <Text style={[styles.char, { color: m.color }]}>{m.char}</Text>
              <Text style={[styles.label, { color: m.color }]}>{m.labelVi}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.bangSlot}>
        {active ? (
          <Animated.View
            style={[
              styles.bang,
              { borderColor: active.color },
              bangStyle,
            ]}
          >
            <Text style={[styles.bangChar, { color: active.color }]}>
              {active.char}
            </Text>
            <Text style={[styles.bangLabel, { color: active.color }]}>
              {active.labelVi}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    </>
  );

  if (plain) return body;

  return (
    <CollapsibleStampPanel
      panelId="mood"
      title="ĐÓNG DẤU CẢM XÚC"
      sub="Chọn một ấn · đóng vào trang lịch hôm nay"
      summary={
        active
          ? `Đã đóng: ${active.labelVi} (${active.char}) · chạm để mở`
          : 'Chạm để chọn cảm xúc hôm nay'
      }
      fontFamily={fontFamily}
    >
      {body}
    </CollapsibleStampPanel>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 6,
  },
  stamp: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1.5,
    borderRadius: 2,
    backgroundColor: colors.paper,
  },
  char: {
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: '700',
  },
  bangSlot: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    pointerEvents: 'none',
  },
  bang: {
    width: 64,
    height: 64,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251,246,236,0.92)',
  },
  bangChar: {
    fontSize: 28,
    fontWeight: '800',
  },
  bangLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});
