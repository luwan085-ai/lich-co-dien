/**
 * Store keys / product IDs — fill before EAS production build.
 * Until keys are set, Premium + rewarded use local mock (AsyncStorage / overlay).
 */
export const monetizationConfig = {
  revenueCat: {
    iosApiKey: process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '',
    androidApiKey: process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? '',
    entitlementId: 'premium',
    monthlyPackageId: '$rc_monthly',
  },
  admob: {
    iosRewardedUnitId: process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED ?? '',
    androidRewardedUnitId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED ?? '',
    /** Google sample rewarded unit for debug builds */
    testRewardedUnitId: 'ca-app-pub-3940256099942544/5224354917',
  },
  priceLabel: '25.000₫/tháng',
} as const;

export function isRevenueCatConfigured(): boolean {
  return Boolean(
    monetizationConfig.revenueCat.iosApiKey ||
      monetizationConfig.revenueCat.androidApiKey,
  );
}

export function isAdMobConfigured(): boolean {
  return Boolean(
    monetizationConfig.admob.iosRewardedUnitId ||
      monetizationConfig.admob.androidRewardedUnitId,
  );
}

export type PurchaseBackend = 'mock' | 'revenuecat';
export type AdBackend = 'mock' | 'admob';

export function purchaseBackend(): PurchaseBackend {
  return isRevenueCatConfigured() ? 'revenuecat' : 'mock';
}

export function adBackend(): AdBackend {
  return isAdMobConfigured() ? 'admob' : 'mock';
}
