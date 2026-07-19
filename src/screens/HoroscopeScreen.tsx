import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { KillerPackTray } from '../components/KillerPackTray';
import { BoiQueCard } from '../components/BoiQueCard';
import { buildDailyHoroscope } from '../data/horoscope';
import { getCalendarDay } from '../lunar/today';
import { useRewardedAdGate } from '../monetization/ads';
import { usePremium } from '../monetization/premium';
import { colors, spacing } from '../theme/tokens';

type Props = {
  fontFamily?: string;
  displayFont?: string;
};

export function HoroscopeScreen({ fontFamily, displayFont }: Props) {
  const day = useMemo(() => getCalendarDay(), []);
  const data = useMemo(() => buildDailyHoroscope(day), [day]);
  const { isPremium } = usePremium();
  const { loading, showRewarded, AdOverlay } = useRewardedAdGate();
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (isPremium) setUnlocked(true);
  }, [isPremium]);

  const unlock = async () => {
    if (isPremium) {
      setUnlocked(true);
      return;
    }
    const result = await showRewarded();
    if (result === 'earned') setUnlocked(true);
  };

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={[styles.kicker, fontFamily ? { fontFamily } : null]}>
            TỬ VI TRONG NGÀY
          </Text>
          <Text
            style={[
              styles.title,
              displayFont ? { fontFamily: displayFont } : null,
            ]}
          >
            {data.yearHeadline}
          </Text>
          <Text style={styles.sub}>
            {day.weekdayVi} · {day.solar.day}/{day.solar.month}/{day.solar.year}
            {' · '}
            Ngày {data.dayCanChi}
          </Text>
          <Text style={styles.path}>
            {day.dayPathLabel} · {day.qualityLabel}
            {data.yearElement ? ` · hành ${data.yearElement}` : ''}
          </Text>
          <Text style={styles.elementNote} numberOfLines={3}>
            {data.elementNote}
          </Text>
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>Điểm ngày {data.score}/100</Text>
          </View>
        </View>

        {!unlocked ? (
          <View style={styles.lockCard}>
            <Text style={styles.lockTitle}>Bản xem trước</Text>
            <Text style={styles.lockBody}>{data.lockedPreview}</Text>
            <Pressable
              style={[styles.cta, loading && styles.ctaDisabled]}
              onPress={() => void unlock()}
              disabled={loading}
            >
              <Text style={[styles.ctaText, fontFamily ? { fontFamily } : null]}>
                {loading
                  ? 'Đang mở…'
                  : isPremium
                    ? 'Mở tử vi (Premium)'
                    : 'Xem quảng cáo · mở chi tiết'}
              </Text>
            </Pressable>
            <Text style={styles.hint}>
              {isPremium
                ? 'Premium không cần xem quảng cáo'
                : 'Xem hết ~5s (sim) · sau gắn AdMob 30s trên bản native'}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            <Row title="Tổng quan" body={data.overall} fontFamily={fontFamily} />
            <Row
              title={`Khí năm · ${data.yearAnimal ?? '—'}`}
              body={data.elementNote}
              fontFamily={fontFamily}
            />
            <Row title="Tình cảm" body={data.love} fontFamily={fontFamily} />
            <Row title="Công việc" body={data.work} fontFamily={fontFamily} />
            <Row title="Tài lộc" body={data.money} fontFamily={fontFamily} />
            <Row title="Lời khuyên" body={data.advice} fontFamily={fontFamily} />
            <Row
              title="Nên / Kiêng hôm nay"
              body={`Nên: ${day.shouldDo.slice(0, 3).join(', ') || '—'}\nKiêng: ${day.avoidDo.slice(0, 3).join(', ') || '—'}`}
              fontFamily={fontFamily}
            />
          </View>
        )}

        <View style={styles.blockKill}>
          <KillerPackTray day={day} fontFamily={fontFamily} />
        </View>

        <BoiQueCard fontFamily={fontFamily} />
      </ScrollView>
      <AdOverlay />
    </>
  );
}

function Row({
  title,
  body,
  fontFamily,
}: {
  title: string;
  body: string;
  fontFamily?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowTitle, fontFamily ? { fontFamily } : null]}>
        {title}
      </Text>
      <Text style={styles.rowBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.page,
    paddingTop: 16,
    paddingBottom: 28,
  },
  hero: {
    backgroundColor: colors.lacquer,
    padding: 18,
    borderRadius: 4,
    borderBottomWidth: 3,
    borderBottomColor: colors.gold,
  },
  kicker: {
    color: colors.goldSoft,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 8,
    color: colors.white,
    fontSize: 34,
    fontWeight: '700',
  },
  sub: {
    marginTop: 6,
    color: 'rgba(255,250,243,0.78)',
    fontSize: 12,
  },
  path: {
    marginTop: 8,
    color: colors.goldSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  elementNote: {
    marginTop: 8,
    color: 'rgba(255,250,243,0.72)',
    fontSize: 12,
    lineHeight: 18,
  },
  scorePill: {
    alignSelf: 'flex-start',
    marginTop: 14,
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  scoreText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '800',
  },
  lockCard: {
    marginTop: 14,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  lockTitle: {
    color: colors.crimson,
    fontSize: 13,
    fontWeight: '800',
  },
  lockBody: {
    marginTop: 8,
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  cta: {
    marginTop: 16,
    backgroundColor: colors.crimson,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.7 },
  ctaText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.4,
  },
  hint: {
    marginTop: 10,
    fontSize: 10,
    color: colors.inkFaint,
    lineHeight: 14,
  },
  grid: { marginTop: 14, gap: 10 },
  blockKill: { marginTop: 14 },
  row: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  rowTitle: {
    color: colors.crimson,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  rowBody: {
    marginTop: 6,
    color: colors.ink,
    fontSize: 13,
    lineHeight: 20,
  },
});
