import { useCallback, useRef, useState } from 'react';
import {
  Alert,
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
import { ShareDayCard } from '../components/ShareDayCard';
import { UpcomingLunarCard } from '../components/UpcomingLunarCard';
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
};

export function HomeScreen({
  fonts,
  selected,
  onChangeSelected,
  onOpenGioList,
}: Props) {
  const tearRef = useRef<TearablePaperHandle>(null);
  const shareRef = useRef<View>(null);
  const [wishText, setWishText] = useState('');
  const [viewportH, setViewportH] = useState(0);
  const [gioTick, setGioTick] = useState(0);
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
              ? { height: viewportH }
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
            <CalendarMount wishText={wishText} fontFamily={fonts?.bodySemi}>
              <DayCommitmentCard
                dateKey={selectedKey}
                solar={selected}
                isToday={isToday}
                fontFamily={fonts?.bodySemi}
                embedded
                onTextChange={onWishTextChange}
                onStamped={setPraiseStamp}
              />
            </CalendarMount>
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
              <Text style={styles.scrollCue}>Vuốt lên · sắp tới & giỗ</Text>
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
              onGioChanged={() => setGioTick((n) => n + 1)}
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
    fontSize: 12,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.3,
  },
  toolSecondary: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.inkFaint,
    letterSpacing: 0.2,
  },
  scrollCue: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.inkFaint,
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
  utilKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: colors.inkFaint,
    marginBottom: 6,
    marginLeft: 2,
  },
});
