import { useCallback, useRef, useState, type ReactElement } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme/tokens';
import { adBackend } from './config';
import { usePremium } from './premium';

export type RewardedResult = 'earned' | 'skipped' | 'unavailable';

type AdGate = {
  loading: boolean;
  /** mock | admob */
  adMode: 'mock' | 'admob';
  showRewarded: () => Promise<RewardedResult>;
  AdOverlay: () => ReactElement | null;
};

/**
 * Rewarded ad gate. Premium skips.
 * When AdMob unit IDs are set, swap the overlay for the native SDK loader
 * (see `loadNativeRewarded` stub below). Until then Expo Go / web use mock.
 */
export function useRewardedAdGate(): AdGate {
  const { isPremium } = usePremium();
  const mode = adBackend();
  const [visible, setVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [loading, setLoading] = useState(false);
  const resolveRef = useRef<((r: RewardedResult) => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finish = useCallback(
    (result: RewardedResult) => {
      clearTimer();
      setVisible(false);
      setLoading(false);
      resolveRef.current?.(result);
      resolveRef.current = null;
    },
    [clearTimer],
  );

  const showRewarded = useCallback((): Promise<RewardedResult> => {
    if (isPremium) {
      return Promise.resolve('earned');
    }

    if (mode === 'admob') {
      // Native path stub — return unavailable until react-native-google-mobile-ads wired
      return loadNativeRewarded();
    }

    setLoading(true);
    return new Promise((resolve) => {
      clearTimer();
      resolveRef.current = resolve;
      setSecondsLeft(5);
      setVisible(true);
      setLoading(false);

      let left = 5;
      timerRef.current = setInterval(() => {
        left -= 1;
        setSecondsLeft(left);
        if (left <= 0) {
          finish('earned');
        }
      }, 1000);
    });
  }, [isPremium, mode, clearTimer, finish]);

  const AdOverlay = useCallback((): ReactElement | null => {
    if (!visible) return null;
    return (
      <Modal transparent animationType="fade" visible={visible}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.kicker}>QUẢNG CÁO THƯỞNG</Text>
            <Text style={styles.title}>Đang xem… {secondsLeft}s</Text>
            <Text style={styles.body}>
              Xem hết để mở luận giải đầy đủ hôm nay · giải trí, không đảm bảo kết
              quả.
            </Text>
          </View>
        </View>
      </Modal>
    );
  }, [visible, secondsLeft, finish]);

  return { loading, adMode: mode, showRewarded, AdOverlay };
}

/** Wire `react-native-google-mobile-ads` RewardedAd here after EAS build. */
async function loadNativeRewarded(): Promise<RewardedResult> {
  return 'unavailable';
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 20, 16, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
  },
  kicker: {
    color: colors.crimson,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
  },
  body: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: colors.inkMuted,
  },
});
