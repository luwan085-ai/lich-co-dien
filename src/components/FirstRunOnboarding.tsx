import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, spacing } from '../theme/tokens';

const ONBOARDING_KEY = 'lich_onboarding_seen_v1';

type Props = {
  fontFamily?: string;
  displayFont?: string;
};

const SLIDES = [
  {
    kicker: 'LỊCH ÂM MỖI NGÀY',
    title: 'Tờ lịch âm đẹp mỗi ngày',
    body: 'Xem ngày âm, ngày tốt xấu, giờ đẹp và chia sẻ tờ lịch hôm nay.',
  },
  {
    kicker: 'NGÀY ÂM GIA ĐÌNH',
    title: 'Không quên ngày âm của gia đình',
    body: 'Lưu giỗ, sinh nhật âm lịch và nhận nhắc hằng năm lúc 7:30 giờ VN.',
  },
  {
    kicker: 'CÁ NHÂN HÓA',
    title: 'Cá nhân hóa theo tuổi của bạn',
    body: 'Nhập năm sinh để xem Tử vi hôm nay theo con giáp.',
  },
] as const;

export function FirstRunOnboarding({ fontFamily, displayFont }: Props) {
  const [visible, setVisible] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (alive && seen !== '1') setVisible(true);
      } catch {
        if (alive) setVisible(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const close = async () => {
    setVisible(false);
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, '1');
    } catch {
      // If storage fails, still let the user continue.
    }
  };

  const next = () => {
    if (idx < SLIDES.length - 1) {
      setIdx((n) => n + 1);
    } else {
      void close();
    }
  };

  const slide = SLIDES[idx]!;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => void close()}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={[styles.kicker, fontFamily ? { fontFamily } : null]}>
            {slide.kicker}
          </Text>
          <Text style={[styles.title, displayFont ? { fontFamily: displayFont } : null]}>
            {slide.title}
          </Text>
          <Text style={[styles.body, fontFamily ? { fontFamily } : null]}>
            {slide.body}
          </Text>

          <View style={styles.dots}>
            {SLIDES.map((_, dotIdx) => (
              <View
                key={dotIdx}
                style={[styles.dot, dotIdx === idx && styles.dotOn]}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable hitSlop={10} onPress={() => void close()}>
              <Text style={styles.skip}>Bỏ qua</Text>
            </Pressable>
            <Pressable style={styles.cta} onPress={next}>
              <Text style={[styles.ctaText, fontFamily ? { fontFamily } : null]}>
                {idx === SLIDES.length - 1 ? 'Bắt đầu' : 'Tiếp tục'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 26, 23, 0.42)',
    justifyContent: 'center',
    paddingHorizontal: spacing.page + 8,
  },
  card: {
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderColor: colors.crimson,
    paddingHorizontal: 20,
    paddingVertical: 22,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    color: colors.crimson,
    marginBottom: 12,
  },
  title: {
    fontSize: 27,
    lineHeight: 35,
    fontWeight: '800',
    color: colors.ink,
  },
  body: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 23,
    color: colors.inkMuted,
    fontWeight: '600',
  },
  dots: {
    marginTop: 22,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(138, 127, 114, 0.35)',
  },
  dotOn: {
    width: 22,
    backgroundColor: colors.crimson,
  },
  actions: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  skip: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.inkFaint,
  },
  cta: {
    backgroundColor: colors.crimson,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  ctaText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
});
