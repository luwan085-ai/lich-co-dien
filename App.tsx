import { useEffect, useRef, useState } from 'react';
import { useFonts } from 'expo-font';
import { Mali_700Bold } from '@expo-google-fonts/mali';
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
import { AppState, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav, type TabId } from './src/components/BottomNav';
import { HomeScreen } from './src/screens/HomeScreen';
import { HoroscopeScreen } from './src/screens/HoroscopeScreen';
import { MonthCalendarScreen } from './src/screens/MonthCalendarScreen';
import { GioListScreen } from './src/screens/GioListScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { StepsScreen } from './src/screens/StepsScreen';
import type { SolarDate } from './src/lunar/solar';
import { isSameSolar } from './src/lunar/solar';
import { getVietnamSolarToday } from './src/lunar/vietnamTime';
import {
  loadRamNotifEnabled,
  scheduleRamNotifications,
} from './src/lib/ramNotifications';
import {
  loadGioNotifEnabled,
  rescheduleGioIfEnabled,
  scheduleGioNotifications,
} from './src/lib/gioNotifications';
import { PremiumProvider } from './src/monetization/premium';
import { colors } from './src/theme/tokens';

function AppShell() {
  const [tab, setTab] = useState<TabId>('today');
  const [selected, setSelected] = useState<SolarDate>(() =>
    getVietnamSolarToday(),
  );
  const [showSteps, setShowSteps] = useState(false);
  const [showGioList, setShowGioList] = useState(false);
  const todayRef = useRef<SolarDate>(getVietnamSolarToday());

  useEffect(() => {
    void (async () => {
      try {
        // Do NOT markVisit here — Month tab reads last visit then marks.
        if (await loadRamNotifEnabled()) {
          await scheduleRamNotifications();
        }
        if (await loadGioNotifEnabled()) {
          await scheduleGioNotifications();
        }
      } catch {
        // Storage / notifications can fail on web or denied perms
      }
    })();
  }, []);

  /** When VN calendar day rolls (or app returns from background), refresh “today”. */
  useEffect(() => {
    const syncToday = () => {
      const next = getVietnamSolarToday();
      const prevToday = todayRef.current;
      if (isSameSolar(prevToday, next)) return;
      todayRef.current = next;
      setSelected((sel) => (isSameSolar(sel, prevToday) ? next : sel));
      void (async () => {
        try {
          if (await loadRamNotifEnabled()) {
            await scheduleRamNotifications();
          }
          await rescheduleGioIfEnabled();
        } catch {
          // notifications can fail on denied perms
        }
      })();
    };

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncToday();
    });
    const id = setInterval(syncToday, 60_000);
    return () => {
      sub.remove();
      clearInterval(id);
    };
  }, []);

  const [fontsLoaded] = useFonts({
    NotoSerif_700Bold,
    NotoSerif_400Regular_Italic,
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_700Bold,
    Mali_700Bold,
  });

  const fonts = fontsLoaded
    ? {
        display: 'NotoSerif_700Bold',
        quote: 'NotoSerif_400Regular_Italic',
        body: 'BeVietnamPro_400Regular',
        bodyMedium: 'BeVietnamPro_500Medium',
        bodySemi: 'BeVietnamPro_700Bold',
        /** Handwriting with full VN diacritics (Cô / Thầy) */
        stamp: 'Mali_700Bold',
      }
    : undefined;

  const onPressTab = (id: TabId) => {
    setShowSteps(false);
    setShowGioList(false);
    setTab(id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.body}>
        {showSteps ? (
          <StepsScreen
            fontFamily={fonts?.bodySemi}
            displayFont={fonts?.display}
            onBack={() => setShowSteps(false)}
          />
        ) : null}
        {showGioList ? (
          <GioListScreen
            fontFamily={fonts?.bodySemi}
            displayFont={fonts?.display}
            onBack={() => setShowGioList(false)}
            onSelectDay={(day) => {
              setSelected(day);
              setShowGioList(false);
              setTab('today');
            }}
          />
        ) : null}
        {!showSteps && !showGioList && tab === 'today' ? (
          <HomeScreen
            fonts={fonts}
            selected={selected}
            onChangeSelected={setSelected}
            onOpenGioList={() => setShowGioList(true)}
          />
        ) : null}
        {!showSteps && !showGioList && tab === 'month' ? (
          <MonthCalendarScreen
            fontFamily={fonts?.bodySemi}
            displayFont={fonts?.display}
            selected={selected}
            onSelectDay={(day) => {
              setSelected(day);
              setTab('today');
            }}
          />
        ) : null}
        {!showSteps && !showGioList && tab === 'horoscope' ? (
          <HoroscopeScreen
            fontFamily={fonts?.bodySemi}
            displayFont={fonts?.display}
          />
        ) : null}
        {!showSteps && !showGioList && tab === 'profile' ? (
          <ProfileScreen
            fontFamily={fonts?.bodySemi}
            stampFont={fonts?.stamp}
            onOpenSteps={() => setShowSteps(true)}
            onOpenGioList={() => setShowGioList(true)}
          />
        ) : null}
      </View>
      <SafeAreaView edges={['bottom']} style={styles.navSafe}>
        <BottomNav
          active={tab}
          fontFamily={fonts?.bodySemi}
          onPressTab={onPressTab}
        />
      </SafeAreaView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <PremiumProvider>
          <AppShell />
        </PremiumProvider>
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
  body: {
    flex: 1,
  },
  navSafe: {
    backgroundColor: colors.white,
  },
});
