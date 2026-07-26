import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CalendarMount } from '../components/CalendarMount';
import { DayCommitmentCard } from '../components/DayCommitmentCard';
import { DayMemoCard } from '../components/DayMemoCard';
import { DayPulseCompact } from '../components/DayPulseCompact';
import { Ionicons } from '@expo/vector-icons';
import { ShareDayCard } from '../components/ShareDayCard';
import { UpcomingLunarCard } from '../components/UpcomingLunarCard';
import { GoodDaysModal } from '../components/GoodDaysModal';
import {
  TearablePaper,
  type TearablePaperHandle,
} from '../components/TearablePaper';
import { WidgetTray } from '../components/WidgetTray';
import { useCalendarPages } from '../hooks/useCalendarPages';
import { resolveFlowerFace } from '../lib/flowerFace';
import { shareCapturedView } from '../lib/shareDay';
import { stampInkForSkin } from '../lib/stampInk';
import type { SolarDate } from '../lunar/solar';
import { usePremium } from '../monetization/premium';
import { colors, spacing } from '../theme/tokens';
import { MOOD_STAMPS, PRAISE_STAMPS } from '../types/mood';

const TOOL_ROW_H = 30;

type Fonts = {
  display?: string;
  quote?: string;
  body?: string;
  bodyMedium?: string;
  bodySemi?: string;
  stamp?: string;
};

type Props = {
  fonts?: Fonts;
  selected: SolarDate;
  onChangeSelected: (d: SolarDate) => void;
  onOpenGioList?: () => void;
  onMemoChanged?: () => void;
};

export function HomeScreen({
  fonts,
  selected,
  onChangeSelected,
  onOpenGioList,
  onMemoChanged,
}: Props) {
  const tearRef = useRef<TearablePaperHandle>(null);
  const shareRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 6,
          duration: 750,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 750,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bounceAnim]);

  const [wishText, setWishText] = useState('');
  const [viewportH, setViewportH] = useState(0);
  const [gioTick, setGioTick] = useState(0);
  const [goodDaysOpen, setGoodDaysOpen] = useState(false);
  const onWishTextChange = useCallback((t: string) => {
    setWishText(t);
  }, []);
  const { stampSkin } = usePremium();
  const inkColor = stampInkForSkin(stampSkin);
  const {
    currentDay,
    todayDay,
    peekDay,
    isToday,
    pageRecord,
    selectedKey,
    goNext,
    goPrev,
    goToday,
    setPraiseStamp,
  } = useCalendarPages({ selected, onChangeSelected });

  const paperFonts = {
    display: fonts?.display,
    quote: fonts?.quote,
    body: fonts?.body,
    bodyMedium: fonts?.bodyMedium,
  };

  const praiseStamped = PRAISE_STAMPS.find(
    (m) => m.id === pageRecord?.praiseStamp,
  );
  const flowerFace = resolveFlowerFace(
    pageRecord?.moodStamp,
    currentDay.dayPathTone,
  );

  const brandWhisper = praiseStamped
    ? {
        line: praiseStamped.lines[0] ?? praiseStamped.labelVi,
        face: flowerFace,
        inkColor,
        fontFamily: fonts?.stamp ?? fonts?.bodySemi,
      }
    : undefined;

  const onShare = async () => {
    const ok = await shareCapturedView(
      shareRef,
      `Lịch Cổ Điển · âm ${currentDay.lunar.day} · ${currentDay.qualityLabel}`,
    );
    if (!ok) {
      Alert.alert('Chưa chia sẻ được', 'Thử lại trên thiết bị thật.');
    }
  };

  return (
    <View
      style={styles.root}
      onLayout={(e) => {
        const h = Math.round(e.nativeEvent.layout.height);
        if (h > 0 && h !== viewportH) setViewportH(h);
      }}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
      >
        {/* First screen = full calendar card + tool row */}
        <View
          style={[
            styles.hero,
            viewportH > 0
              ? { height: Math.max(460, viewportH - 80) }
              : styles.heroFallback,
          ]}
        >
          <View
            style={[
              styles.calendarCard,
              stampSkin === 'gold' && styles.calendarGold,
            ]}
          >
            {stampSkin === 'tape' ? (
              <>
                <View style={[styles.tape, styles.tapeTL]} />
                <View style={[styles.tape, styles.tapeTR]} />
              </>
            ) : null}
            <CalendarMount fontFamily={fonts?.bodySemi} />
            <TearablePaper
              ref={tearRef}
              fill
              day={currentDay}
              todayDay={todayDay}
              peekNext={peekDay('next')}
              peekPrev={peekDay('prev')}
              fonts={paperFonts}
              brandWhisper={brandWhisper}
              onTornNext={goNext}
              onTornPrev={goPrev}
              onTornToday={goToday}
            />
          </View>

          <View style={styles.toolRow}>
            {!isToday ? (
              <Pressable onPress={() => tearRef.current?.tearToToday()}>
                <Text
                  style={[
                    styles.toolPrimary,
                    fonts?.bodySemi ? { fontFamily: fonts.bodySemi } : null,
                  ]}
                >
                  Về hôm nay
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.scrollCue}>
                Gợi ý · Sắp tới · Ý nguyện
              </Text>
            )}
            <Pressable onPress={() => void onShare()}>
              <Text
                style={[
                  styles.toolSecondary,
                  fonts?.bodySemi ? { fontFamily: fonts.bodySemi } : null,
                ]}
              >
                Chia sẻ
              </Text>
            </Pressable>
          </View>

          <Animated.View
            style={[
              styles.floatingScrollWrap,
              { transform: [{ translateY: bounceAnim }] },
            ]}
          >
            <Pressable
              style={styles.floatingChevronBtn}
              onPress={() => {
                const targetY = Math.max(460, viewportH - 80);
                scrollRef.current?.scrollTo({ y: targetY, animated: true });
              }}
              accessibilityLabel="Scroll down"
            >
              <Ionicons name="funnel" size={17} color={colors.goldDark} />
            </Pressable>
          </Animated.View>
        </View>

        <View style={styles.shareCapture}>
          <ShareDayCard
            ref={shareRef}
            day={currentDay}
            face={flowerFace}
            praiseId={pageRecord?.praiseStamp}
            skin={stampSkin}
            fontFamily={fonts?.stamp ?? fonts?.bodySemi}
            displayFont={fonts?.display}
          />
        </View>

        <View style={styles.below}>
          <View style={styles.block}>
            <View style={styles.todayGuide}>
              <Text style={[styles.guideKicker, fonts?.bodySemi ? { fontFamily: fonts.bodySemi } : null]}>
                GỢI Ý HÔM NAY
              </Text>
              <View style={styles.guideRow}>
                <Pressable
                  style={styles.guideItem}
                  onPress={() => setGoodDaysOpen(true)}
                >
                  <Ionicons name="sparkles-outline" size={15} color={colors.crimson} />
                  <Text style={styles.guideText}>Xem ngày tốt ›</Text>
                </Pressable>
                <View style={styles.guideItem}>
                  <Ionicons name="moon-outline" size={15} color={colors.crimson} />
                  <Text style={styles.guideText}>Lưu ngày âm</Text>
                </View>
                <View style={styles.guideItem}>
                  <Ionicons name="share-social-outline" size={15} color={colors.crimson} />
                  <Text style={styles.guideText}>Chia sẻ tờ lịch</Text>
                </View>
              </View>
              <Text style={styles.guideTrust}>
                Thông tin tham khảo theo lịch âm Việt Nam · phong tục có thể khác theo vùng miền.
              </Text>
            </View>
          </View>

          <View style={styles.block}>
            <UpcomingLunarCard
              refreshKey={gioTick}
              fontFamily={fonts?.bodySemi}
              onSelectDay={onChangeSelected}
              onOpenList={onOpenGioList}
            />
          </View>

          <View style={styles.block}>
            <DayPulseCompact day={currentDay} fontFamily={fonts?.bodySemi} />
          </View>

          <View style={styles.block}>
            <DayMemoCard
              dateKey={selectedKey}
              fontFamily={fonts?.bodySemi}
              gioRefreshKey={gioTick}
              onGioChanged={() => {
                setGioTick((n) => n + 1);
                onMemoChanged?.();
              }}
            />
          </View>

          <View style={styles.block}>
            <DayCommitmentCard
              dateKey={selectedKey}
              solar={selected}
              isToday={isToday}
              fontFamily={fonts?.bodySemi}
              onTextChange={onWishTextChange}
              onStamped={setPraiseStamp}
            />
          </View>

          <View style={styles.block}>
            <Text style={[styles.utilKicker, fonts?.bodySemi ? { fontFamily: fonts.bodySemi } : null]}>
              TIỆN ÍCH HÀNG NGÀY
            </Text>
            <WidgetTray fontFamily={fonts?.bodySemi} calendarDay={selected} />
          </View>
        </View>
      </ScrollView>

      <GoodDaysModal
        visible={goodDaysOpen}
        onClose={() => setGoodDaysOpen(false)}
        onSelectDay={onChangeSelected}
        fontFamily={fonts?.bodySemi}
        displayFont={fonts?.display}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.page,
    paddingTop: 0,
    paddingBottom: 28,
  },
  hero: {
    flexDirection: 'column',
    paddingTop: 2,
    paddingBottom: 0,
  },
  heroFallback: {
    minHeight: 540,
  },
  calendarCard: {
    flex: 1,
    borderRadius: 1,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 0,
  },
  calendarGold: {
    borderWidth: 2,
    borderColor: colors.gold,
  },
  tape: {
    position: 'absolute',
    width: 78,
    height: 18,
    backgroundColor: 'rgba(201, 168, 76, 0.5)',
    zIndex: 8,
  },
  tapeTL: { top: 8, left: -10, transform: [{ rotate: '-14deg' }] },
  tapeTR: { top: 12, right: -12, transform: [{ rotate: '12deg' }] },
  toolRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    minHeight: TOOL_ROW_H,
    flexShrink: 0,
  },
  toolPrimary: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.3,
  },
  toolSecondary: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.inkMuted,
    letterSpacing: 0.2,
  },
  scrollCue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkMuted,
    letterSpacing: 0.2,
  },
  shareCapture: {
    position: 'absolute',
    left: 0,
    top: -10000,
    pointerEvents: 'none',
  },
  below: {
    marginTop: 10,
    paddingTop: 4,
  },
  block: {
    marginTop: 8,
  },
  todayGuide: {
    backgroundColor: '#FFFBF5',
    borderWidth: 1,
    borderColor: 'rgba(196, 30, 58, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  guideKicker: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    color: colors.crimson,
    marginBottom: 9,
  },
  guideRow: {
    flexDirection: 'row',
    gap: 8,
  },
  guideItem: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 30, 58, 0.18)',
    backgroundColor: colors.paper,
    paddingHorizontal: 8,
    paddingVertical: 9,
    alignItems: 'center',
    gap: 5,
  },
  guideText: {
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    fontWeight: '800',
    color: colors.inkMuted,
  },
  guideTrust: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(196, 30, 58, 0.14)',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
    color: colors.inkFaint,
  },
  utilKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: colors.inkFaint,
    marginBottom: 6,
    marginLeft: 2,
  },
  floatingScrollWrap: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    zIndex: 20,
  },
  floatingChevronBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9E6',
    borderWidth: 1.5,
    borderColor: '#E8B653',
    shadowColor: '#8B5E00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  chevronStack: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
});
