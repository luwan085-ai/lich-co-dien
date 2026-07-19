import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { monetizationConfig, purchaseBackend } from './config';
import {
  configurePurchases,
  purchaseMonthlyViaStore,
  restorePurchasesViaStore,
} from './revenueCat';

export type StampSkin = 'classic' | 'gold' | 'tape';

const PREMIUM_KEY = 'lich_premium_v1';
const SKIN_KEY = 'lich_stamp_skin_v1';

type PremiumContextValue = {
  ready: boolean;
  isPremium: boolean;
  priceLabel: string;
  /** mock until RC keys land */
  purchaseMode: 'mock' | 'revenuecat';
  stampSkin: StampSkin;
  purchaseMonthly: () => Promise<boolean>;
  restore: () => Promise<boolean>;
  setPremiumMock: (on: boolean) => Promise<void>;
  setStampSkin: (skin: StampSkin) => Promise<void>;
};

const PremiumContext = createContext<PremiumContextValue | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [stampSkin, setStampSkinState] = useState<StampSkin>('classic');
  const mode = purchaseBackend();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await configurePurchases();
        const [prem, skin] = await Promise.all([
          AsyncStorage.getItem(PREMIUM_KEY),
          AsyncStorage.getItem(SKIN_KEY),
        ]);
        if (cancelled) return;
        setIsPremium(prem === '1');
        if (skin === 'gold' || skin === 'tape' || skin === 'classic') {
          setStampSkinState(skin);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistPremium = useCallback(async (on: boolean) => {
    setIsPremium(on);
    await AsyncStorage.setItem(PREMIUM_KEY, on ? '1' : '0');
  }, []);

  const setStampSkin = useCallback(async (skin: StampSkin) => {
    setStampSkinState(skin);
    await AsyncStorage.setItem(SKIN_KEY, skin);
  }, []);

  const purchaseMonthly = useCallback(async () => {
    if (mode === 'revenuecat') {
      const snap = await purchaseMonthlyViaStore();
      if (snap) {
        await persistPremium(snap.isPremium);
        return snap.isPremium;
      }
    }
    await persistPremium(true);
    return true;
  }, [mode, persistPremium]);

  const restore = useCallback(async () => {
    if (mode === 'revenuecat') {
      const snap = await restorePurchasesViaStore();
      if (snap) {
        await persistPremium(snap.isPremium);
        return snap.isPremium;
      }
    }
    const raw = await AsyncStorage.getItem(PREMIUM_KEY);
    const on = raw === '1';
    setIsPremium(on);
    return on;
  }, [mode, persistPremium]);

  const value = useMemo(
    () => ({
      ready,
      isPremium,
      priceLabel: monetizationConfig.priceLabel,
      purchaseMode: mode,
      stampSkin: isPremium ? stampSkin : 'classic',
      purchaseMonthly,
      restore,
      setPremiumMock: persistPremium,
      setStampSkin,
    }),
    [
      ready,
      isPremium,
      mode,
      stampSkin,
      purchaseMonthly,
      restore,
      persistPremium,
      setStampSkin,
    ],
  );

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return ctx;
}
