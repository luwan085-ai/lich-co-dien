import { useRef } from 'react';
import { useFonts } from 'expo-font';
import {
  NotoSerif_400Regular_Italic,
  NotoSerif_700Bold,
} from '@expo-google-fonts/noto-serif';
import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_700Bold,
} from '@expo-google-fonts/be-vietnam-pro';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from './src/components/BottomNav';
import { CalendarMount } from './src/components/CalendarMount';
import {
  TearablePaper,
  type TearablePaperHandle,
} from './src/components/TearablePaper';
import { WidgetTray } from './src/components/WidgetTray';
import { useCalendarPages } from './src/hooks/useCalendarPages';
import { colors, spacing } from './src/theme/tokens';

function HomeScreen() {
  const tearRef = useRef<TearablePaperHandle>(null);
  const {
    currentDay,
    todayDay,
    peekDay,
    isToday,
    goNext,
    goPrev,
    goToday,
  } = useCalendarPages();

  const [fontsLoaded] = useFonts({
    NotoSerif_700Bold,
    NotoSerif_400Regular_Italic,
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_700Bold,
  });

  const fonts = fontsLoaded
    ? {
        display: 'NotoSerif_700Bold',
        quote: 'NotoSerif_400Regular_Italic',
        body: 'BeVietnamPro_400Regular',
        bodyMedium: 'BeVietnamPro_500Medium',
        bodySemi: 'BeVietnamPro_700Bold',
      }
    : undefined;

  const paperFonts = {
    display: fonts?.display,
    quote: fonts?.quote,
    body: fonts?.body,
    bodyMedium: fonts?.bodyMedium,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarCard}>
          <CalendarMount fontFamily={fonts?.bodySemi} />
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
        </View>

        {!isToday ? (
          <Pressable
            style={styles.todayChip}
            onPress={() => tearRef.current?.tearToToday()}
          >
            <Text
              style={[
                styles.todayChipText,
                fonts?.bodySemi ? { fontFamily: fonts.bodySemi } : null,
              ]}
            >
              ✦ Về hôm nay ✦
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.trayWrap}>
          <WidgetTray fontFamily={fonts?.bodySemi} />
        </View>
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={styles.navSafe}>
        <BottomNav fontFamily={fonts?.bodySemi} />
      </SafeAreaView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <HomeScreen />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paperDeep,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.paperDeep,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.page,
    paddingTop: 8,
    paddingBottom: 16,
  },
  calendarCard: {
    borderRadius: 1,
    overflow: 'hidden',
  },
  todayChip: {
    alignSelf: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.crimson,
    backgroundColor: colors.paper,
  },
  todayChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.crimson,
    letterSpacing: 0.6,
  },
  trayWrap: {
    marginTop: 12,
  },
  navSafe: {
    backgroundColor: colors.white,
  },
});
