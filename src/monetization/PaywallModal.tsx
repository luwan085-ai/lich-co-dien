import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme/tokens';
import { monetizationConfig } from './config';

type Props = {
  visible: boolean;
  reason?: string;
  onClose: () => void;
  onPurchase: () => Promise<boolean>;
  onRestore: () => Promise<boolean>;
  fontFamily?: string;
  displayFont?: string;
};

export function PaywallModal({
  visible,
  reason,
  onClose,
  onPurchase,
  onRestore,
  fontFamily,
  displayFont,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!visible) return null;

  const handleBuy = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const ok = await onPurchase();
      if (ok) {
        setMsg('Đã kích hoạt Premium thành công!');
        setTimeout(() => {
          setMsg(null);
          onClose();
        }, 1200);
      } else {
        setMsg('Chưa hoàn tất mua hàng.');
      }
    } catch {
      setMsg('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const ok = await onRestore();
      if (ok) {
        setMsg('Khôi phục Premium thành công!');
        setTimeout(() => {
          setMsg(null);
          onClose();
        }, 1200);
      } else {
        setMsg('Không tìm thấy giao dịch Premium cũ.');
      }
    } catch {
      setMsg('Có lỗi xảy ra khi khôi phục.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={[styles.kicker, fontFamily ? { fontFamily } : null]}>
              LỊCH CỔ ĐIỂN PREMIUM
            </Text>
            <Text
              style={[
                styles.title,
                displayFont ? { fontFamily: displayFont } : null,
              ]}
            >
              Mở khóa toàn bộ ưu đãi
            </Text>

            {reason ? (
              <View style={styles.reasonBox}>
                <Text style={styles.reasonText}>⚠️ {reason}</Text>
              </View>
            ) : null}

            <View style={styles.benefitsBox}>
              <Text style={styles.benefitItem}>
                ✨ <Text style={styles.boldText}>Không giới hạn</Text> ngày âm
                lịch cá nhân (Giỗ & Sinh nhật)
              </Text>
              <Text style={styles.benefitItem}>
                🔔 <Text style={styles.boldText}>Nhắc nhở trước 3 & 7 ngày</Text>{' '}
                (lúc 7:30 sáng giờ VN)
              </Text>
              <Text style={styles.benefitItem}>
                🎨 <Text style={styles.boldText}>Mực vàng Premium</Text> & kiểu
                dán băng keo
              </Text>
              <Text style={styles.benefitItem}>
                📌 <Text style={styles.boldText}>Ghim widget</Text> & giao diện cao
                cấp
              </Text>
              <Text style={styles.benefitItem}>
                🚫 <Text style={styles.boldText}>100% Không quảng cáo</Text>
              </Text>
            </View>

            {msg ? <Text style={styles.statusMsg}>{msg}</Text> : null}

            <Pressable
              style={[styles.buyBtn, busy && styles.btnDisabled]}
              onPress={handleBuy}
              disabled={busy}
            >
              <Text
                style={[styles.buyBtnText, fontFamily ? { fontFamily } : null]}
              >
                {busy
                  ? 'Đang xử lý…'
                  : `Nâng cấp Premium — ${monetizationConfig.priceLabel}`}
              </Text>
            </Pressable>

            <Pressable
              style={styles.restoreBtn}
              onPress={handleRestore}
              disabled={busy}
            >
              <Text style={styles.restoreText}>Khôi phục mua hàng</Text>
            </Pressable>

            <Text style={styles.pricingHint}>
              {monetizationConfig.pricing.monthlyHint} ·{' '}
              {monetizationConfig.pricing.lifetimePrice}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 20, 16, 0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 18,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.paperDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: colors.inkMuted,
    fontWeight: '700',
  },
  content: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  kicker: {
    color: colors.crimson,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 4,
    marginBottom: 12,
  },
  reasonBox: {
    backgroundColor: '#FFF4E5',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#8C4A00',
    fontWeight: '600',
  },
  benefitsBox: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  benefitItem: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.ink,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '700',
    color: colors.crimson,
  },
  statusMsg: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.crimson,
    fontWeight: '600',
    marginBottom: 10,
  },
  buyBtn: {
    backgroundColor: colors.crimson,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  restoreBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 14,
    color: colors.inkMuted,
    textDecorationLine: 'underline',
  },
  pricingHint: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: 4,
  },
});
