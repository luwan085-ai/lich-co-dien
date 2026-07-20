import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ProfileHoroscopeSection } from '../components/ProfileHoroscopeSection';
import { ProfileMoodSection } from '../components/ProfileMoodSection';
import { ProfilePraiseSection } from '../components/ProfilePraiseSection';
import { storeConfig } from '../config/store';
import {
  loadGioNotifEnabled,
  rescheduleGioIfEnabled,
  toggleGioNotifications,
} from '../lib/gioNotifications';
import {
  GIO_ADVANCE_OPTIONS,
  loadGioAdvanceDays,
  setGioAdvanceDays,
  type GioAdvanceDays,
} from '../lib/gioSchedule';
import {
  clampAdvanceForTier,
  FREE_ANNIV_LIMIT,
  isAdvanceAllowed,
} from '../lib/gioLimits';
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
  stampFont?: string;
  onOpenGioList: () => void;
};

const SKINS: { id: StampSkin; label: string; premium?: boolean }[] = [
  { id: 'classic', label: 'Đỏ mực cổ' },
  { id: 'gold', label: 'Vàng Premium', premium: true },
  { id: 'tape', label: 'Băng keo dán', premium: true },
];

const PREMIUM_BENEFITS = [
  'Giỗ & sinh nhật âm không giới hạn',
  'Nhắc trước 1/3/7 ngày',
  'Không quảng cáo',
  'Ghim widget & da giấy Premium',
] as const;

const PRIVACY_BODY = `Lịch Cổ Điển ưu tiên lưu cục bộ trên máy bạn.

• Ghi chú, giỗ âm lịch, cam kết / dấu đóng — lưu trên thiết bị
• Nhắc Rằm / Mùng Một / Giỗ — lịch thông báo cục bộ
• Giá vàng / xăng / tin — chỉ khi có mạng (có bản offline)
• Quảng cáo & mua Premium — qua store chính thức

Không thu thập hồ sơ cá nhân để bán. Cặp số may mắn chỉ mang tính giải trí; dưới 18 tuổi không tham gia xổ số.`;

export function ProfileScreen({
  fontFamily,
  stampFont,
  onOpenGioList,
}: Props) {
  const {
    ready,
    isPremium,
    pricing,
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
  const [gioOn, setGioOn] = useState(false);
  const [gioBusy, setGioBusy] = useState(false);
  const [gioAdvance, setGioAdvance] = useState<GioAdvanceDays>(1);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useEffect(() => {
    void loadRamNotifEnabled().then(setRamOn);
    void loadGioNotifEnabled().then(setGioOn);
    void loadGioAdvanceDays().then(async (days) => {
      const clamped = clampAdvanceForTier(days, isPremium);
      if (clamped !== days) {
        await setGioAdvanceDays(clamped);
        if (gioOn) {
          await rescheduleGioIfEnabled();
        }
      }
      setGioAdvance(clamped);
    });
  }, [isPremium, gioOn]);

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
      if (next && n < 0) {
        setRamOn(false);
        Alert.alert(
          'Chưa có quyền thông báo',
          'Hãy bật thông báo cho Lịch Cổ Điển trong Cài đặt hệ thống.',
        );
        return;
      }
      setRamOn(next);
      if (next) {
        Alert.alert(
          'Đã bật nhắc',
          n > 0
            ? `Đã lên lịch ${n} buổi sáng Rằm / Mùng Một (7:30 giờ VN).`
            : 'Đã bật nhưng chưa có Rằm / Mùng Một trong 60 ngày tới (hiếm).',
        );
      }
    } finally {
      setRamBusy(false);
    }
  };

  const pickAdvance = async (days: GioAdvanceDays) => {
    if (!isAdvanceAllowed(days, isPremium)) {
      Alert.alert(
        'Premium',
        'Nhắc trước 3/7 ngày dành cho Premium. Miễn phí: chỉ ngày giỗ hoặc 1 ngày trước.',
      );
      return;
    }
    if (days === gioAdvance) return;
    setGioAdvance(days);
    await setGioAdvanceDays(days);
    if (gioOn) {
      await rescheduleGioIfEnabled();
    }
  };

  const toggleGio = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Chỉ trên máy thật',
        'Nhắc giỗ âm lịch cần bản iOS hoặc Android.',
      );
      return;
    }
    setGioBusy(true);
    try {
      const next = !gioOn;
      const n = await toggleGioNotifications(next);
      if (next && n < 0) {
        setGioOn(false);
        Alert.alert(
          'Chưa có quyền thông báo',
          'Hãy bật thông báo cho Lịch Cổ Điển trong Cài đặt hệ thống.',
        );
        return;
      }
      setGioOn(next);
      if (next) {
        Alert.alert(
          'Đã bật nhắc giỗ',
          n > 0
            ? `Đã lên lịch ${n} buổi sáng giỗ (7:30 giờ VN · theo âm lịch).`
            : 'Chưa có giỗ hoặc sinh nhật âm. Vào Hôm nay → Ghi chú / Giỗ lễ để chọn loại.',
        );
      }
    } finally {
      setGioBusy(false);
    }
  };

  const openPrivacy = async () => {
    const url = storeConfig.privacyPolicyUrl.trim();
    if (url) {
      try {
        await Linking.openURL(url);
        return;
      } catch {
        // fall through to in-app
      }
    }
    setPrivacyOpen(true);
  };

  const pickSkin = async (skin: StampSkin) => {
    if (skin !== 'classic' && !isPremium) {
      Alert.alert(
        'Premium',
        'Mực vàng & băng keo dán dành cho Premium. Nâng cấp ở mục Premium bên dưới.',
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
      <Text style={styles.title}>{storeConfig.displayName}</Text>
      <Text style={styles.body}>
        Thiết lập tuổi, nhắc giỗ, cảm xúc và dấu mộc — mọi thứ lưu trên máy
        bạn.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tử vi cá nhân</Text>
        <ProfileHoroscopeSection fontFamily={fontFamily} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nhắc Giỗ âm lịch</Text>
        <Text style={styles.line}>
          Ngày bạn đánh dấu giỗ hoặc sinh nhật âm sẽ nhắc lại mỗi năm theo âm (7:30 giờ VN) — kể cả
          khi dương lịch lệch.
        </Text>
        <Text style={[styles.line, styles.advanceLabel]}>
          Nhắc trước (sáng 7:30 giờ VN)
        </Text>
        {!isPremium ? (
          <Text style={styles.tierHint}>
            Miễn phí: tối đa {FREE_ANNIV_LIMIT} giỗ/sinh nhật · nhắc 1 ngày trước
          </Text>
        ) : null}
        <View style={styles.advanceRow}>
          {GIO_ADVANCE_OPTIONS.map((opt) => {
            const on = gioAdvance === opt.value;
            const locked = !isAdvanceAllowed(opt.value, isPremium);
            return (
              <Pressable
                key={opt.value}
                style={[
                  styles.advanceChip,
                  on && styles.advanceChipOn,
                  locked && styles.advanceChipLocked,
                ]}
                onPress={() => void pickAdvance(opt.value)}
              >
                <Text style={[styles.advanceText, on && styles.advanceTextOn]}>
                  {opt.label}
                  {locked ? ' 🔒' : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          style={[styles.cta, gioOn && styles.ctaOff, gioBusy && styles.ctaDisabled]}
          onPress={() => void toggleGio()}
          disabled={gioBusy}
        >
          <Text style={[styles.ctaText, fontFamily ? { fontFamily } : null]}>
            {gioBusy
              ? 'Đang lên lịch…'
              : gioOn
                ? 'Đang bật · chạm để tắt'
                : 'Bật nhắc giỗ trên máy'}
          </Text>
        </Pressable>
        <Pressable style={styles.listLink} onPress={onOpenGioList}>
          <Text style={[styles.listLinkText, fontFamily ? { fontFamily } : null]}>
            Danh sách giỗ & sinh nhật ›
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nhắc Rằm / Mùng Một</Text>
        <Text style={styles.line}>
          Sáng 7:30 (giờ VN) mỗi ngày Rằm (15) và Mùng Một — nhớ thắp hương &
          lời hứa.
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

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Đóng dấu cảm xúc</Text>
        <ProfileMoodSection fontFamily={fontFamily} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mộc khen ngợi</Text>
        <Text style={styles.line}>
          Đóng dấu khen trên tờ lịch hôm nay — ghi lại ngày làm tốt của bạn.
        </Text>
        <ProfilePraiseSection fontFamily={fontFamily} stampFont={stampFont} />
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
        <Text style={styles.cardTitle}>Premium</Text>
        {!ready ? (
          <ActivityIndicator color={colors.crimson} />
        ) : isPremium ? (
          <>
            <Text style={styles.premiumOn}>Đang dùng Premium</Text>
            {PREMIUM_BENEFITS.map((line) => (
              <Text key={line} style={styles.line}>
                • {line}
              </Text>
            ))}
            {__DEV__ ? (
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => void setPremiumMock(false)}
              >
                <Text style={styles.secondaryText}>Hủy bản thử (dev)</Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          <>
            <Text style={styles.price}>{pricing.annual}</Text>
            <Text style={styles.priceHint}>{pricing.monthlyHint}</Text>
            {PREMIUM_BENEFITS.map((line) => (
              <Text key={line} style={styles.line}>
                • {line}
              </Text>
            ))}
            <Pressable
              style={[styles.cta, busy && styles.ctaDisabled]}
              onPress={() => void buy()}
              disabled={busy}
            >
              <Text style={[styles.ctaText, fontFamily ? { fontFamily } : null]}>
                {busy ? 'Đang xử lý…' : 'Nâng cấp Premium'}
              </Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => void doRestore()}>
              <Text style={styles.secondaryText}>Khôi phục mua hàng</Text>
            </Pressable>
            <Text style={styles.lifetimeTitle}>{pricing.lifetimeTitle}</Text>
            <Text style={styles.priceHint}>{pricing.lifetimePrice}</Text>
            {__DEV__ && purchaseMode === 'mock' ? (
              <Text style={styles.hint}>Chế độ thử · chỉ hiện khi dev build</Text>
            ) : null}
          </>
        )}
      </View>

      <Pressable style={styles.card} onPress={() => void openPrivacy()}>
        <Text style={styles.cardTitle}>Chính sách bảo mật</Text>
        <Text style={styles.line}>
          Local-first · giỗ / memo trên máy · mở bản đầy đủ
        </Text>
      </Pressable>

      <Modal
        visible={privacyOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPrivacyOpen(false)}
      >
        <SafePrivacy
          fontFamily={fontFamily}
          onClose={() => setPrivacyOpen(false)}
        />
      </Modal>
    </ScrollView>
  );
}

function SafePrivacy({
  fontFamily,
  onClose,
}: {
  fontFamily?: string;
  onClose: () => void;
}) {
  return (
    <View style={styles.privacyRoot}>
      <View style={styles.privacyBar}>
        <Text style={[styles.privacyTitle, fontFamily ? { fontFamily } : null]}>
          Chính sách bảo mật
        </Text>
        <Pressable onPress={onClose} hitSlop={10}>
          <Text style={styles.privacyClose}>Đóng</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.privacyBody}>
        <Text style={styles.privacyText}>{PRIVACY_BODY}</Text>
      </ScrollView>
    </View>
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
    marginBottom: 2,
  },
  priceHint: {
    fontSize: 11,
    color: colors.inkMuted,
    marginBottom: 10,
  },
  lifetimeTitle: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '800',
    color: colors.inkMuted,
    textAlign: 'center',
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
  advanceLabel: {
    marginTop: 10,
    fontWeight: '700',
    color: colors.inkMuted,
    fontSize: 12,
  },
  advanceRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  advanceChip: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  advanceChipOn: {
    borderColor: colors.crimson,
    backgroundColor: '#FFF5F4',
  },
  advanceChipLocked: {
    opacity: 0.72,
  },
  tierHint: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 16,
    color: colors.inkFaint,
  },
  advanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkMuted,
  },
  advanceTextOn: {
    color: colors.crimson,
  },
  listLink: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 6,
  },
  listLinkText: {
    color: colors.crimson,
    fontWeight: '800',
    fontSize: 13,
  },
  privacyRoot: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
  },
  privacyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.page,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  privacyClose: {
    color: colors.crimson,
    fontWeight: '700',
    fontSize: 14,
  },
  privacyBody: {
    padding: spacing.page,
    paddingBottom: 40,
  },
  privacyText: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.ink,
  },
});
