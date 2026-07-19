import { useCallback, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CalendarMount } from '../components/CalendarMount';
import { DayCommitmentCard } from '../components/DayCommitmentCard';
import { DayInsightCard } from '../components/DayInsightCard';
import { DayMemoCard } from '../components/DayMemoCard';
import { MoodStampPicker } from '../components/MoodStampPicker';
import { PraiseStampPicker } from '../components/PraiseStampPicker';
import { ShareDayCard } from '../components/ShareDayCard';
import {
  TearablePaper,
  type TearablePaperHandle,
} from '../components/TearablePaper';
import { WidgetTray } from '../components/WidgetTray';
import { VnTeacherStamp } from '../components/VnTeacherStamp';
import { useCalendarPages } from '../hooks/useCalendarPages';
import { resolveFlowerFace } from '../lib/flowerFace';
import { shareCapturedView } from '../lib/shareDay';
import { stampInkForSkin } from '../lib/stampInk';
import type { SolarDate } from '../lunar/solar';
import { usePremium } from '../monetization/premium';
import { colors, spacing } from '../theme/tokens';
import { MOOD_STAMPS, PRAISE_STAMPS } from '../types/mood';

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
};

export function HomeScreen({ fonts, selected, onChangeSelected }: Props) {
  const tearRef = useRef<TearablePaperHandle>(null);
  const shareRef = useRef<View>(null);
  const [wishText, setWishText] = useState('');
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
    setMoodStamp,
    setPraiseStamp,
  } = useCalendarPages({ selected, onChangeSelected });

  const paperFonts = {
    display: fonts?.display,
    quote: fonts?.quote,
    body: fonts?.body,
    bodyMedium: fonts?.bodyMedium,
  };

  const moodStamped = MOOD_STAMPS.find((m) => m.id === pageRecord?.moodStamp);
  const praiseStamped = PRAISE_STAMPS.find(
    (m) => m.id === pageRecord?.praiseStamp,
  );
  const flowerFace = resolveFlowerFace(
    pageRecord?.moodStamp,
    currentDay.dayPathTone,
  );

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
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
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
          day={currentDay}
          todayDay={todayDay}
          peekNext={peekDay('next')}
          peekPrev={peekDay('prev')}
          fonts={paperFonts}
          onTornNext={goNext}
          onTornPrev={goPrev}
          onTornToday={goToday}
        />
        {moodStamped ? (
          <View
            style={[styles.pageStampMood, { borderColor: moodStamped.color }]}
          >
            <Text
              style={[styles.pageStampChar, { color: moodStamped.color }]}
            >
              {moodStamped.char}
            </Text>
          </View>
        ) : null}
        {praiseStamped ? (
          <View style={styles.pageStampPraiseWrap}>
            <VnTeacherStamp
              praiseId={praiseStamped.id}
              size="md"
              inkSeed={pageRecord?.praiseInkSeed ?? 42}
              rotate={praiseStamped.tilt}
              fontFamily={fonts?.stamp ?? fonts?.bodySemi}
              face={flowerFace}
              inkColor={inkColor}
            />
          </View>
        ) : null}
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
          <View />
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

      <View style={styles.block}>
        <DayInsightCard day={currentDay} fontFamily={fonts?.bodySemi} compact />
      </View>

      <View style={styles.block}>
        <DayMemoCard dateKey={selectedKey} fontFamily={fonts?.bodySemi} />
      </View>

      <View style={styles.block}>
        <MoodStampPicker
          selected={pageRecord?.moodStamp}
          fontFamily={fonts?.bodySemi}
          onPick={setMoodStamp}
        />
      </View>

      <View style={styles.block}>
        <PraiseStampPicker
          selected={pageRecord?.praiseStamp}
          inkSeed={pageRecord?.praiseInkSeed}
          fontFamily={fonts?.bodySemi}
          stampFont={fonts?.stamp}
          face={flowerFace}
          inkColor={inkColor}
          onPick={setPraiseStamp}
        />
      </View>

      <View style={styles.block}>
        <WidgetTray
          fontFamily={fonts?.bodySemi}
          calendarDay={selected}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.page,
    paddingTop: 8,
    paddingBottom: 20,
  },
  calendarCard: {
    borderRadius: 1,
    overflow: 'hidden',
    position: 'relative',
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
  pageStampMood: {
    position: 'absolute',
    right: 22,
    bottom: 58,
    width: 52,
    height: 52,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251,246,236,0.75)',
    transform: [{ rotate: '-12deg' }],
    zIndex: 5,
    pointerEvents: 'none',
  },
  pageStampPraiseWrap: {
    position: 'absolute',
    left: 10,
    bottom: 48,
    zIndex: 5,
    pointerEvents: 'none',
    maxWidth: '70%',
  },
  pageStampChar: {
    fontSize: 26,
    fontWeight: '800',
  },
  toolRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    minHeight: 20,
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
  shareCapture: {
    position: 'absolute',
    left: 0,
    top: -10000,
    pointerEvents: 'none',
  },
  block: {
    marginTop: 8,
  },
});
