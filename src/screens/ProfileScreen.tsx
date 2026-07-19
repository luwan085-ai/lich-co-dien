import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  loadRamNotifEnabled,
  toggleRamNotifications,
} from '../lib/ramNotifications';
import {
  usePremium,
  type StampSkin,
} from '../monetization/premium';
import { colors, spacing } from '../theme/tokens';

type Props = {
  fontFamily?: string;
  onOpenSteps: () => void;
};

const SKINS: { id: StampSkin; label: string; premium?: boolean }[] = [
  { id: 'classic', label: 'Đỏ mực cổ' },
  { id: 'gold', label: 'Vàng Premium', premium: true },
  { id: 'tape', label: 'Băng keo dán', premium: true },
];

export function ProfileScreen({ fontFamily, onOpenSteps }: Props) {
  const {
    ready,
    isPremium,
    priceLabel,
    purchaseMode,
    stampSkin,
    purchaseMonthly,
    restore,
    setPremiumMock,
    setStampSkin,
  } = usePremium();
  const [busy, setBusy] = useState(false);
  const [ramOn, setRamOn] = useState(false);
  const [ramBusy, setRamBusy] = useState(false);

  useEffect(() => {
    void loadRamNotifEnabled().then(setRamOn);
  }, []);

  const buy = async () => {
    setBusy(true);
    try {
      await purchaseMonthly();
    } finally {
      setBusy(false);
    }
  };

  const doRestore = async () => {
    setBusy(true);
    try {
      await restore();
    } finally {
      setBusy(false);
    }
  };

  const toggleRam = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Chỉ trên máy thật',
        'Thông báo Rằm / Mùng Một cần bản iOS hoặc Android.',
      );
      return;
    }
    setRamBusy(true);
    try {
      const next = !ramOn;
      const n = await toggleRamNotifications(next);
      setRamOn(next);
      if (next) {
        Alert.alert(
          'Đã bật nhắc',
          n > 0
            ? `Đã lên lịch ${n} buổi sáng Rằm / Mùng Một (7:30).`
            : 'Đã bật nhưng chưa có ngày sắp tới trong 60 ngày (hiếm).',
        );
      }
    } finally {
      setRamBusy(false);
    }
  };

  const pickSkin = async (skin: StampSkin) => {
    if (skin !== 'classic' && !isPremium) {
      Alert.alert(
        'Premium',
        'Mực vàng & băng keo dán dành cho Premium. Nâng cấp thử ở bên trên.',
      );
      return;
    }
    await setStampSkin(skin);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.wrap}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.kicker, fontFamily ? { fontFamily } : null]}>
        CÁ NHÂN
      </Text>
      <Text style={styles.title}>Lịch Cổ Điển</Text>
      <Text style={styles.body}>
        Bản local · Premium bỏ quảng cáo, giữ widget đã ghim, mực vàng & băng
        keo.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Premium</Text>
        {!ready ? (
          <ActivityIndicator color={colors.crimson} />
        ) : isPremium ? (
          <>
            <Text style={styles.premiumOn}>Đang dùng Premium</Text>
            <Text style={styles.line}>• Không quảng cáo thưởng</Text>
            <Text style={styles.line}>• Widget ghim giữ bố cục</Text>
            <Text style={styles.line}>• Tử vi mở ngay</Text>
            <Text style={styles.line}>• Mực vàng & băng keo dán</Text>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => void setPremiumMock(false)}
            >
              <Text style={styles.secondaryText}>Hủy bản thử (local)</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.price}>{priceLabel}</Text>
            <Text style={styles.line}>• Bỏ quảng cáo 30s</Text>
            <Text style={styles.line}>• Ghim widget vĩnh viễn</Text>
            <Text style={styles.line}>• Mực vàng + băng keo dán</Text>
            <Pressable
              style={[styles.cta, busy && styles.ctaDisabled]}
              onPress={() => void buy()}
              disabled={busy}
            >
              <Text style={[styles.ctaText, fontFamily ? { fontFamily } : null]}>
                {busy ? 'Đang xử lý…' : 'Nâng cấp Premium (thử)'}
              </Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => void doRestore()}>
              <Text style={styles.secondaryText}>Khôi phục mua hàng</Text>
            </Pressable>
            <Text style={styles.hint}>
              {purchaseMode === 'mock'
                ? 'Chế độ thử local · gắn EXPO_PUBLIC_RC_IOS_KEY / ANDROID_KEY để bật RevenueCat.'
                : 'RevenueCat đã cấu hình · mua hàng qua store.'}
            </Text>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Da dấu / giấy</Text>
        <Text style={styles.line}>
          Đổi mực đóng dấu trên tờ lịch. Vàng & băng keo cần Premium.
        </Text>
        <View style={styles.skinRow}>
          {SKINS.map((s) => {
            const on = stampSkin === s.id;
            const locked = Boolean(s.premium) && !isPremium;
            return (
              <Pressable
                key={s.id}
                style={[styles.skinChip, on && styles.skinChipOn, locked && styles.skinLocked]}
                onPress={() => void pickSkin(s.id)}
              >
                <Text style={[styles.skinText, on && styles.skinTextOn]}>
                  {s.label}
                  {locked ? ' 🔒' : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nhắc Rằm / Mùng Một</Text>
        <Text style={styles.line}>
          Sáng 7:30 mỗi ngày Rằm (15) và Mùng Một — nhớ thắp hương & lời hứa.
        </Text>
        <Pressable
          style={[styles.cta, ramOn && styles.ctaOff, ramBusy && styles.ctaDisabled]}
          onPress={() => void toggleRam()}
          disabled={ramBusy}
        >
          <Text style={[styles.ctaText, fontFamily ? { fontFamily } : null]}>
            {ramBusy
              ? 'Đang lên lịch…'
              : ramOn
                ? 'Đang bật · chạm để tắt'
                : 'Bật nhắc trên máy'}
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.card} onPress={onOpenSteps}>
        <Text style={styles.cardTitle}>Bước chân</Text>
        <Text style={styles.line}>Mở màn hình đếm bước · pedometer / demo</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Đã có trên máy</Text>
        <Text style={styles.line}>• Lịch âm + xé tờ lịch</Text>
        <Text style={styles.line}>• Cam kết 10 chữ → đóng dấu tự động</Text>
        <Text style={styles.line}>• Widget hôm nay + chia sẻ tờ lịch</Text>
        <Text style={styles.line}>• Tin VnExpress + widget ghim</Text>
        <Text style={styles.line}>• Tử vi (xem quảng cáo / Premium)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  wrap: {
    paddingHorizontal: spacing.page,
    paddingTop: 20,
    paddingBottom: 28,
  },
  kicker: {
    color: colors.crimson,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '700',
    color: colors.ink,
  },
  body: {
    marginTop: 10,
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  card: {
    marginTop: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
  },
  cardTitle: {
    color: colors.crimson,
    fontWeight: '800',
    marginBottom: 8,
  },
  premiumOn: {
    color: colors.goldDeep,
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 6,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 6,
  },
  line: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 22,
  },
  cta: {
    marginTop: 14,
    backgroundColor: colors.crimson,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaOff: {
    backgroundColor: colors.lacquer,
  },
  ctaDisabled: { opacity: 0.7 },
  ctaText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  secondaryBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  secondaryText: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  hint: {
    marginTop: 8,
    fontSize: 10,
    color: colors.inkFaint,
    lineHeight: 14,
  },
  skinRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skinChip: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  skinChipOn: {
    borderColor: colors.crimson,
    backgroundColor: '#FFF5F4',
  },
  skinLocked: {
    opacity: 0.75,
  },
  skinText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkMuted,
  },
  skinTextOn: {
    color: colors.crimson,
  },
});
