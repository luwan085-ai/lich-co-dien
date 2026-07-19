import { useMemo, useState, type ReactNode } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { CalendarDay } from '../lunar/today';
import { buildKillerPack } from '../lib/killerPack';
import type { VanKhanArticle } from '../data/vanKhan';
import { colors } from '../theme/tokens';

type Props = {
  day: CalendarDay;
  fontFamily?: string;
  /** Hide lottery block — use HoroscopeEntertainmentSection on Tử vi. */
  coreOnly?: boolean;
};

function fillVanKhan(body: string, day: CalendarDay): string {
  return body
    .replace('tháng ... năm ...', `tháng ${day.lunar.month} năm ${day.canChi.year}`)
    .replace('tháng ...', `tháng ${day.lunar.month}`);
}

export function KillerPackTray({ day, fontFamily, coreOnly = false }: Props) {
  const pack = useMemo(() => buildKillerPack(day), [day]);
  const [khan, setKhan] = useState<VanKhanArticle | null>(null);

  const openKhan = (article: VanKhanArticle | null | undefined) => {
    if (!article) return;
    setKhan({
      ...article,
      body: fillVanKhan(article.body, day),
    });
  };

  return (
    <View style={styles.stack}>
      {pack.vanKhan.reason ? (
        <Pressable
          style={styles.alert}
          onPress={() => openKhan(pack.vanKhan.spotlight)}
        >
          <Text style={styles.alertTitle}>Hôm nay cần Văn Khấn</Text>
          <Text style={styles.alertBody}>{pack.vanKhan.reason}</Text>
          <Text style={styles.alertCta}>Chạm để đọc to ›</Text>
        </Pressable>
      ) : null}

      <Card
        title={pack.gioHoangDao.title}
        desc={pack.gioHoangDao.desc}
        fontFamily={fontFamily}
        accent="#B8860B"
      >
        <Text style={styles.heroLine}>{pack.gioHoangDao.openShopLine}</Text>
        {pack.gioHoangDao.hours.map((h) => (
          <Text key={h.branch + h.time} style={styles.line}>
            · {h.label}: {h.time}
          </Text>
        ))}
      </Card>

      <Card
        title="⚠️ Tuổi Xung Ngày Hôm Nay"
        desc="Những tuổi đại kỵ, dễ gặp thị phi, hao tài hôm nay."
        fontFamily={fontFamily}
        accent={colors.crimson}
      >
        <Text style={styles.heroLine}>{pack.tuoiXung.headline}</Text>
        <Text style={styles.tip}>{pack.tuoiXung.tip}</Text>
      </Card>

      <Card
        title={pack.vanKhan.title}
        desc="Bài cúng ngắn — đọc trước bàn thờ."
        fontFamily={fontFamily}
        accent="#6B3FA0"
      >
        {pack.vanKhan.articles.map((a) => (
          <Pressable
            key={a.id}
            style={styles.linkRow}
            onPress={() => openKhan(a)}
          >
            <Text style={styles.linkText}>{a.title}</Text>
            <Text style={styles.linkChev}>›</Text>
          </Pressable>
        ))}
      </Card>

      {!coreOnly ? (
      <Card
        title="🎱 Cặp số may mắn hôm nay"
        desc="Số Đề / Lô Tô · gợi ý vui 00–99 cho xổ số kiến thiết chiều nay."
        fontFamily={fontFamily}
        accent="#0F766E"
      >
        <Text style={styles.heroLine}>{pack.taiLoc.headline}</Text>
        <View style={styles.numRow}>
          {pack.taiLoc.numbers.map((n) => (
            <View key={n} style={styles.numPill}>
              <Text style={styles.numText}>{String(n).padStart(2, '0')}</Text>
            </View>
          ))}
        </View>
        <Pressable
          style={styles.kqxs}
          onPress={() => void Linking.openURL(pack.taiLoc.kqxsUrl)}
        >
          <Text style={styles.kqxsText}>Xem KQXS · xoso.com.vn ›</Text>
        </Pressable>
        <Text style={styles.disclaimer}>{pack.taiLoc.disclaimer}</Text>
        <Text style={styles.disclaimerLegal}>
          Không khuyến khích đánh bạc. Liên kết ngoài chỉ để tra cứu kết quả công
          khai.
        </Text>
      </Card>
      ) : null}

      <Modal visible={Boolean(khan)} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{khan?.title}</Text>
            <Text style={styles.modalSub}>{khan?.subtitle}</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalBody}>{khan?.body}</Text>
            </ScrollView>
            <Pressable style={styles.modalClose} onPress={() => setKhan(null)}>
              <Text style={styles.modalCloseText}>Đóng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Card({
  title,
  desc,
  accent,
  fontFamily,
  children,
}: {
  title: string;
  desc: string;
  accent: string;
  fontFamily?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <Text style={[styles.cardTitle, fontFamily ? { fontFamily } : null]}>
        {title}
      </Text>
      <Text style={styles.cardDesc}>{desc}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 10 },
  alert: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#F5B4AE',
    padding: 12,
  },
  alertTitle: {
    fontWeight: '800',
    color: colors.crimson,
    fontSize: 13,
  },
  alertBody: {
    marginTop: 4,
    fontSize: 12,
    color: colors.ink,
    lineHeight: 18,
  },
  alertCta: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '800',
    color: colors.crimson,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  cardDesc: {
    marginTop: 4,
    fontSize: 11,
    color: colors.inkFaint,
    lineHeight: 16,
    marginBottom: 8,
  },
  heroLine: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 20,
  },
  line: {
    marginTop: 4,
    fontSize: 12,
    color: colors.inkMuted,
  },
  tip: {
    marginTop: 6,
    fontSize: 11,
    color: colors.inkMuted,
    lineHeight: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  linkText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.crimson,
  },
  linkChev: { fontSize: 16, color: colors.inkFaint },
  numRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  numPill: {
    minWidth: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#99F6E4',
    alignItems: 'center',
  },
  numText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F766E',
  },
  kqxs: {
    marginTop: 12,
    backgroundColor: colors.lacquer,
    paddingVertical: 10,
    alignItems: 'center',
  },
  kqxsText: {
    color: colors.goldSoft,
    fontWeight: '800',
    fontSize: 12,
  },
  disclaimer: {
    marginTop: 8,
    fontSize: 10,
    color: colors.inkFaint,
    lineHeight: 14,
  },
  disclaimerLegal: {
    marginTop: 4,
    fontSize: 9,
    color: colors.inkFaint,
    lineHeight: 13,
    fontStyle: 'italic',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(28,20,16,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.paper,
    maxHeight: '85%',
    padding: 18,
    borderTopWidth: 3,
    borderTopColor: colors.gold,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.crimson,
  },
  modalSub: {
    marginTop: 4,
    fontSize: 12,
    color: colors.inkMuted,
  },
  modalScroll: { marginTop: 12, maxHeight: 360 },
  modalBody: {
    fontSize: 15,
    lineHeight: 26,
    color: colors.ink,
  },
  modalClose: {
    marginTop: 14,
    backgroundColor: colors.crimson,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: colors.white,
    fontWeight: '800',
  },
});
