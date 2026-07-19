import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { CalendarDay } from '../lunar/today';
import { colors } from '../theme/tokens';
import { CalendarPaper, type PosterBrandWhisperProps } from './CalendarPaper';
import {
  hapticTearTick,
  playTearFeedback,
  preloadTearSound,
} from '../interaction/tearFeedback';

type Fonts = {
  display?: string;
  quote?: string;
  body?: string;
  bodyMedium?: string;
};

export type TearablePaperHandle = {
  /** Tear current page away and land on hôm nay (sound + animation). */
  tearToToday: () => void;
};

type Props = {
  day: CalendarDay;
  todayDay: CalendarDay;
  peekNext: CalendarDay;
  peekPrev: CalendarDay;
  fonts?: Fonts;
  /** Fill remaining space under the lacquer mount (home hero). */
  fill?: boolean;
  brandWhisper?: PosterBrandWhisperProps;
  onTornNext: () => void;
  onTornPrev: () => void;
  onTornToday: () => void;
};

const COMMIT_RATIO = 0.22;
const TICK_EVERY = 36;
const TEAR_MS = 400;
const TEAR_HINT_KEY = 'lich_tear_hint_dismissed_v1';

export const TearablePaper = forwardRef<TearablePaperHandle, Props>(
  function TearablePaper(
    {
      day,
      todayDay,
      peekNext,
      peekPrev,
      fonts,
      fill,
      brandWhisper,
      onTornNext,
      onTornPrev,
      onTornToday,
    },
    ref,
  ) {
    const { width } = useWindowDimensions();
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const rot = useSharedValue(0);
    const curl = useSharedValue(0);
    const busy = useSharedValue(0);
    const forcePeek = useSharedValue(0);
    const lastTick = useSharedValue(0);
    const [overridePeek, setOverridePeek] = useState<CalendarDay | null>(null);
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
      preloadTearSound();
    }, []);

    useEffect(() => {
      let alive = true;
      void (async () => {
        const dismissed = await AsyncStorage.getItem(TEAR_HINT_KEY);
        if (alive && dismissed !== '1') setShowHint(true);
      })();
      return () => {
        alive = false;
      };
    }, []);

    const dismissHint = useCallback(() => {
      setShowHint(false);
      void AsyncStorage.setItem(TEAR_HINT_KEY, '1');
    }, []);

    useEffect(() => {
      cancelAnimation(tx);
      cancelAnimation(ty);
      cancelAnimation(rot);
      cancelAnimation(curl);
      tx.value = 0;
      ty.value = 0;
      rot.value = 0;
      curl.value = 0;
      busy.value = 0;
      forcePeek.value = 0;
      lastTick.value = 0;
      setOverridePeek(null);
    }, [
      day.solar.year,
      day.solar.month,
      day.solar.day,
      tx,
      ty,
      rot,
      curl,
      busy,
      forcePeek,
      lastTick,
    ]);

    const finishNext = useCallback(() => {
      onTornNext();
    }, [onTornNext]);

    const finishPrev = useCallback(() => {
      onTornPrev();
    }, [onTornPrev]);

    const finishToday = useCallback(() => {
      forcePeek.value = 0;
      setOverridePeek(null);
      onTornToday();
    }, [forcePeek, onTornToday]);

    const triggerTick = useCallback(() => {
      void hapticTearTick();
    }, []);

    /** Must run on JS thread (gesture uses runOnJS). */
    const startTear = useCallback(
      (mode: 'next' | 'prev' | 'today') => {
        if (busy.value) return;
        dismissHint();
        busy.value = 1;
        void playTearFeedback();

        const dir = mode === 'prev' ? 1 : -1;
        curl.value = withTiming(1, {
          duration: TEAR_MS * 0.5,
          easing: Easing.out(Easing.quad),
        });
        tx.value = withTiming(
          dir * width * 1.4,
          { duration: TEAR_MS, easing: Easing.bezier(0.15, 0.85, 0.25, 1) },
          (done) => {
            if (!done) {
              busy.value = 0;
              return;
            }
            tx.value = 0;
            ty.value = 0;
            rot.value = 0;
            curl.value = 0;
            busy.value = 0;
            if (mode === 'today') runOnJS(finishToday)();
            else if (mode === 'next') runOnJS(finishNext)();
            else runOnJS(finishPrev)();
          },
        );
        ty.value = withTiming(dir * -56, {
          duration: TEAR_MS,
          easing: Easing.out(Easing.cubic),
        });
        rot.value = withTiming(dir * -32, {
          duration: TEAR_MS,
          easing: Easing.out(Easing.cubic),
        });
      },
      [busy, curl, dismissHint, finishNext, finishPrev, finishToday, rot, tx, ty, width],
    );

    useImperativeHandle(
      ref,
      () => ({
        tearToToday: () => {
          if (busy.value) return;
          setOverridePeek(todayDay);
          forcePeek.value = 1;
          requestAnimationFrame(() => {
            startTear('today');
          });
        },
      }),
      [busy, forcePeek, startTear, todayDay],
    );

    const pan = Gesture.Pan()
      .activeOffsetX([-16, 16])
      .failOffsetY([-26, 26])
      .onUpdate((e) => {
        if (busy.value) return;
        tx.value = e.translationX;
        ty.value = e.translationY * 0.18;
        rot.value = interpolate(
          e.translationX,
          [-width, 0, width],
          [-16, 0, 16],
          Extrapolation.CLAMP,
        );
        curl.value = interpolate(
          Math.abs(e.translationX),
          [0, width * 0.35],
          [0, 0.7],
          Extrapolation.CLAMP,
        );
        if (Math.abs(e.translationX - lastTick.value) > TICK_EVERY) {
          lastTick.value = e.translationX;
          runOnJS(triggerTick)();
        }
        if (Math.abs(e.translationX) > 28) {
          runOnJS(dismissHint)();
        }
      })
      .onEnd((e) => {
        if (busy.value) return;
        const threshold = Math.min(130, width * COMMIT_RATIO);
        const goingNext = e.translationX < -threshold || e.velocityX < -700;
        const goingPrev = e.translationX > threshold || e.velocityX > 700;

        if (goingNext || goingPrev) {
          runOnJS(startTear)(goingNext ? 'next' : 'prev');
        } else {
          tx.value = withSpring(0, { damping: 16, stiffness: 170 });
          ty.value = withSpring(0, { damping: 16, stiffness: 170 });
          rot.value = withSpring(0, { damping: 16, stiffness: 170 });
          curl.value = withSpring(0, { damping: 16, stiffness: 170 });
        }
      });

    const frontStyle = useAnimatedStyle(() => {
      const abs = Math.abs(tx.value);
      return {
        transform: [
          { translateX: tx.value },
          { translateY: ty.value },
          { rotateZ: `${rot.value}deg` },
          {
            scale: interpolate(curl.value, [0, 1], [1, 0.93], Extrapolation.CLAMP),
          },
        ],
        opacity: interpolate(abs, [0, width * 0.95], [1, 0.15], Extrapolation.CLAMP),
      };
    });

    const nextPeekStyle = useAnimatedStyle(() => {
      const dragProgress = interpolate(
        -tx.value,
        [0, width * 0.38],
        [0.15, 1],
        Extrapolation.CLAMP,
      );
      const forced = forcePeek.value
        ? interpolate(-tx.value, [0, width * 0.5], [0.55, 1], Extrapolation.CLAMP)
        : 0;
      const progress = Math.max(dragProgress, forced);
      const show = tx.value < 0 || forcePeek.value === 1;
      return {
        opacity: show ? progress : 0,
        transform: [{ scale: interpolate(progress, [0.15, 1], [0.97, 1]) }],
      };
    });

    const prevPeekStyle = useAnimatedStyle(() => {
      const progress = interpolate(
        tx.value,
        [0, width * 0.38],
        [0.15, 1],
        Extrapolation.CLAMP,
      );
      return {
        opacity: forcePeek.value ? 0 : tx.value > 0 ? progress : 0,
        transform: [{ scale: interpolate(progress, [0.15, 1], [0.97, 1]) }],
      };
    });

    const hintStyle = useAnimatedStyle(() => ({
      opacity: showHint
        ? interpolate(Math.abs(tx.value), [0, 36], [1, 0], Extrapolation.CLAMP)
        : 0,
    }));

    const peekForward = overridePeek ?? peekNext;

    return (
      <View style={[styles.wrap, fill && styles.wrapFill]}>
        <Animated.View style={[styles.peekLayer, nextPeekStyle]}>
          <CalendarPaper day={peekForward} fonts={fonts} fill={fill} compact={fill} />
        </Animated.View>
        <Animated.View style={[styles.peekLayer, prevPeekStyle]}>
          <CalendarPaper day={peekPrev} fonts={fonts} fill={fill} compact={fill} />
        </Animated.View>

        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.front, fill && styles.frontFill, frontStyle]}>
            <CalendarPaper day={day} fonts={fonts} fill={fill} compact={fill} brandWhisper={brandWhisper} />
            {showHint ? (
              <Animated.View style={[styles.hint, hintStyle]}>
                <Pressable onPress={dismissHint} hitSlop={8}>
                  <Text style={styles.hintText}>
                    Vuốt trái / phải để sang ngày
                  </Text>
                </Pressable>
              </Animated.View>
            ) : null}
          </Animated.View>
        </GestureDetector>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  wrapFill: {
    flex: 1,
  },
  peekLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
    pointerEvents: 'none',
  },
  front: {
    zIndex: 2,
    backgroundColor: colors.paper,
  },
  frontFill: {
    flex: 1,
  },
  hint: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 0.2,
  },
});
