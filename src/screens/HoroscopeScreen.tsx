import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HoroscopeEntertainmentSection } from '../components/HoroscopeEntertainmentSection';
import { KillerPackTray } from '../components/KillerPackTray';
import { buildDailyHoroscope, type FacetScores } from '../data/horoscope';
import { loadHoroscopeProfile } from '../lib/horoscopeProfile';
import {
  loadHoroscopeUnlocked,
  setHoroscopeUnlocked,
} from '../lib/horoscopeUnlock';
import { nenDigestLine, kiengDigestLine } from '../lib/dayDigest';
import { getCalendarDay } from '../lunar/today';
import { solarKey } from '../lunar/solar';
import { getVietnamSolarToday } from '../lunar/vietnamTime';
import { useRewardedAdGate } from '../monetization/ads';
import { usePremium } from '../monetization/premium';
import { colors, spacing } from '../theme/tokens';

type Props = {
  fontFamily?: string;
  displayFont?: string;
  onOpenProfile?: () => void;
};

const FACETS: { key: keyof FacetScores; label: string }[] = [
  { key: 'love', label: 'Tình cảm' },
  { key: 'work', label: 'Công việc' },
  { key: 'money', label: 'Tài lộc' },
  { key: 'health', label: 'Sức khỏe' },
];

export function HoroscopeScreen({
  fontFamily,
  displayFont,
  onOpenProfile,
}: Props) {
  const day = useMemo(() => getCalendarDay(), []);
  const todayKey = useMemo(() => solarKey(getVietnamSolarToday()), []);
  const [profileAnimal, setProfileAnimal] = useState<string | null>(null);
  const data = useMemo(
    () => buildDailyHoroscope(day, profileAnimal),
    [day, profileAnimal],
  );
  const { isPremium } = usePremium();
  const { loading, showRewarded, AdOverlay } = useRewardedAdGate();
  const [unlocked, setUnlocked] = useState(false);

  const refreshProfile = useCallback(async () => {
    const profile = await loadHoroscopeProfile();
    setProfileAnimal(profile.animal ?? null);
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (isPremium) {
      setUnlocked(true);
      return;
    }
    void loadHoroscopeUnlocked(todayKey).then(setUnlocked);
  }, [isPremium, todayKey]);

  const unlock = async () => {
    if (isPremium) {
      setUnlocked(true);
      return;
    }
    const result = await showRewarded();
    if (result === 'earned') {
      setUnlocked(true);
      await setHoroscopeUnlocked(todayKey, true);
    }
  };

  const profileConfigured = Boolean(profileAnimal);

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={[styles.kicker, fontFamily ? { fontFamily } : null]}>
            TỬ VI · GIẢI TRÍ · HÔM NAY
          </Text>
          <Text
            style={[
              styles.title,
              displayFont ? { fontFamily: displayFont } : null,
            ]}
          >
            {data.personalHeadline}
          </Text>
          <Text style={styles.sub}>{data.personalSub}</Text>
          {!profileConfigured && onOpenProfile ? (
            <Pressable style={styles.profileCta} onPress={onOpenProfile}>
              <Text style={[styles.profileCtaText, fontFamily ? { fontFamily } : null]}>
                Chọn tuổi trong Cá nhân để cá nhân hóa ›
              </Text>
            </Pressable>
          ) : null}
          <Text style={styles.heroLegal}>
            Luận giải mang tính giải trí · không thay thế tư vấn chuyên môn
          </Text>
          <Text style={styles.meta}>
            {data.yearHeadline}
            {' · '}
            {day.weekdayVi} · {day.solar.day}/{day.solar.month}/{day.solar.year}
            {' · '}
            Ngày {data.dayCanChi}
          </Text>
          <Text style={styles.path}>
            {day.dayPathLabel} · {day.qualityLabel}
          </Text>
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>Điểm ngày {data.score}/100</Text>
          </View>
        </View>

        <View style={styles.facetCard}>
          <Text style={[styles.sectionKicker, fontFamily ? { fontFamily } : null]}>
            BỐN LĨNH VỰC
          </Text>
          {FACETS.map(({ key, label }) => (
            <FacetRow
              key={key}
              label={label}
              score={data.facetScores[key]}
              fontFamily={fontFamily}
            />
          ))}
        </View>

        <View style={styles.adviceCard}>
          <Text style={[styles.sectionKicker, fontFamily ? { fontFamily } : null]}>
            LỜI GỢI Ý HÔM NAY
          </Text>
          {data.adviceLines.map((line, idx) => (
            <Text
              key={idx}
              style={[
                styles.adviceLine,
                !unlocked && idx > 0 ? styles.adviceLocked : null,
                fontFamily ? { fontFamily } : null,
              ]}
            >
              {idx + 1}. {unlocked || idx === 0 ? line : '···'}
            </Text>
          ))}
          <Text style={[styles.caution, fontFamily ? { fontFamily } : null]}>
            {data.cautionLine}
          </Text>
        </View>

        {!unlocked ? (
          <View style={styles.lockCard}>
            <Text style={styles.lockBody}>{data.lockedPreview}</Text>
            <Pressable
              style={[styles.cta, loading && styles.ctaDisabled]}
              onPress={() => void unlock()}
              disabled={loading}
            >
              <Text style={[styles.ctaText, fontFamily ? { fontFamily } : null]}>
                {loading ? 'Đang mở…' : 'Mở luận giải đầy đủ'}
              </Text>
            </Pressable>
            {!isPremium ? (
              <Text style={styles.hint}>
                Xem quảng cáo ngắn để mở · giải trí, không đảm bảo kết quả
              </Text>
            ) : (
              <Text style={styles.hint}>Premium — không cần quảng cáo</Text>
            )}
          </View>
        ) : (
          <View style={styles.detailGrid}>
            <DetailRow title="Tổng quan" body={data.overall} fontFamily={fontFamily} />
            <DetailRow title="Tình cảm" body={data.love} fontFamily={fontFamily} />
            <DetailRow title="Công việc" body={data.work} fontFamily={fontFamily} />
            <DetailRow title="Tài lộc" body={data.money} fontFamily={fontFamily} />
            <DetailRow title="Sức khỏe" body={data.health} fontFamily={fontFamily} />
            <DetailRow title="Lời khuyên" body={data.advice} fontFamily={fontFamily} />
            <DetailRow
              title="Nên / Kiêng hôm nay"
              body={`${nenDigestLine(day)}\n${kiengDigestLine(day)}`}
              fontFamily={fontFamily}
            />
          </View>
        )}

        <View style={styles.blockKill}>
          <KillerPackTray day={day} fontFamily={fontFamily} coreOnly />
        </View>

        <HoroscopeEntertainmentSection day={day} fontFamily={fontFamily} />

        <Text style={styles.footerLegal}>
          Nội dung giải trí · không thay thế tư vấn chuyên môn. Người dưới 18 tuổi
          không tham gia xổ số.
        </Text>
      </ScrollView>
      <AdOverlay />
    </>
  );
}

function FacetRow({
  label,
  score,
  fontFamily,
}: {
  label: string;
  score: number;
  fontFamily?: string;
}) {
  const width = `${score}%`;
  return (
    <View style={styles.facetRow}>
      <View style={styles.facetTop}>
        <Text style={[styles.facetLabel, fontFamily ? { fontFamily } : null]}>
          {label}
        </Text>
        <Text style={styles.facetScore}>{score}</Text>
      </View>
      <View style={styles.facetTrack}>
        <View style={[styles.facetFill, { width: width as `${number}%` }]} />
      </View>
    </View>
  );
}

function DetailRow({
  title,
  body,
  fontFamily,
}: {
  title: string;
  body: string;
  fontFamily?: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailTitle, fontFamily ? { fontFamily } : null]}>
        {title}
      </Text>
      <Text style={styles.detailBody}>{body}</Text>
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
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  sub: {
    marginTop: 6,
    color: 'rgba(255,250,243,0.82)',
    fontSize: 12,
    lineHeight: 18,
  },
  profileCta: {
    alignSelf: 'flex-start',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,250,243,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  profileCtaText: {
    color: colors.goldSoft,
    fontSize: 11,
    fontWeight: '800',
  },
  heroLegal: {
    marginTop: 8,
    color: 'rgba(255,250,243,0.62)',
    fontSize: 10,
    lineHeight: 14,
  },
  meta: {
    marginTop: 8,
    color: 'rgba(255,250,243,0.72)',
    fontSize: 11,
  },
  path: {
    marginTop: 6,
    color: colors.goldSoft,
    fontSize: 12,
    fontWeight: '700',
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
  facetCard: {
    marginTop: 14,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  sectionKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.crimson,
    marginBottom: 2,
  },
  facetRow: { gap: 4 },
  facetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  facetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  facetScore: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.crimsonDeep,
  },
  facetTrack: {
    height: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  facetFill: {
    height: 4,
    backgroundColor: colors.crimson,
  },
  adviceCard: {
    marginTop: 10,
    backgroundColor: '#FFFBF5',
    borderWidth: 1,
    borderColor: 'rgba(196, 30, 58, 0.15)',
    padding: 14,
  },
  adviceLine: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: colors.ink,
    fontWeight: '600',
  },
  adviceLocked: {
    color: colors.inkFaint,
  },
  caution: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    color: colors.crimsonDeep,
  },
  lockCard: {
    marginTop: 12,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  lockBody: {
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  cta: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.crimson,
    backgroundColor: colors.paper,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.7 },
  ctaText: {
    color: colors.crimson,
    fontWeight: '800',
    fontSize: 13,
  },
  hint: {
    marginTop: 8,
    fontSize: 10,
    color: colors.inkFaint,
    lineHeight: 14,
    textAlign: 'center',
  },
  detailGrid: { marginTop: 12, gap: 8 },
  blockKill: { marginTop: 14 },
  detailRow: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  detailTitle: {
    color: colors.crimson,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  detailBody: {
    marginTop: 6,
    color: colors.ink,
    fontSize: 13,
    lineHeight: 20,
  },
  footerLegal: {
    marginTop: 16,
    fontSize: 10,
    lineHeight: 14,
    color: colors.inkFaint,
    textAlign: 'center',
  },
});
