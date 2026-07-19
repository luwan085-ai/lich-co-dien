import { useEffect, useState } from 'react';
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
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav, type TabId } from './src/components/BottomNav';
import { HomeScreen } from './src/screens/HomeScreen';
import { HoroscopeScreen } from './src/screens/HoroscopeScreen';
import { MonthCalendarScreen } from './src/screens/MonthCalendarScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { StepsScreen } from './src/screens/StepsScreen';
import type { SolarDate } from './src/lunar/solar';
import { solarKey } from './src/lunar/solar';
import { getVietnamSolarToday } from './src/lunar/vietnamTime';
import {
  loadRamNotifEnabled,
  scheduleRamNotifications,
} from './src/lib/ramNotifications';
import {
  loadGioNotifEnabled,
  scheduleGioNotifications,
} from './src/lib/gioNotifications';
import { markVisitToday } from './src/lib/visits';
import { PremiumProvider } from './src/monetization/premium';
import { colors } from './src/theme/tokens';

function AppShell() {
  const [tab, setTab] = useState<TabId>('today');
  const [selected, setSelected] = useState<SolarDate>(() =>
    getVietnamSolarToday(),
  );
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    void (async () => {
      const today = getVietnamSolarToday();
      await markVisitToday(solarKey(today));
      if (await loadRamNotifEnabled()) {
        await scheduleRamNotifications();
      }
      if (await loadGioNotifEnabled()) {
        await scheduleGioNotifications();
      }
    })();
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
        {!showSteps && tab === 'today' ? (
          <HomeScreen
            fonts={fonts}
            selected={selected}
            onChangeSelected={setSelected}
          />
        ) : null}
        {!showSteps && tab === 'month' ? (
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
        {!showSteps && tab === 'horoscope' ? (
          <HoroscopeScreen
            fontFamily={fonts?.bodySemi}
            displayFont={fonts?.display}
          />
        ) : null}
        {!showSteps && tab === 'profile' ? (
          <ProfileScreen
            fontFamily={fonts?.bodySemi}
            onOpenSteps={() => setShowSteps(true)}
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
