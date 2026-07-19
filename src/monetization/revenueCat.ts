/**
 * RevenueCat adapter stub.
 * When EXPO_PUBLIC_RC_* keys are set and `react-native-purchases` is installed,
 * replace the bodies of configure / purchase / restore with Purchases SDK calls.
 */
import { Platform } from 'react-native';
import {
  isRevenueCatConfigured,
  monetizationConfig,
  purchaseBackend,
} from './config';

export type EntitlementSnapshot = {
  isPremium: boolean;
  backend: 'mock' | 'revenuecat';
};

export async function configurePurchases(): Promise<void> {
  if (purchaseBackend() !== 'revenuecat') return;
  // Placeholder for:
  // import Purchases from 'react-native-purchases';
  // const key = Platform.OS === 'ios'
  //   ? monetizationConfig.revenueCat.iosApiKey
  //   : monetizationConfig.revenueCat.androidApiKey;
  // Purchases.configure({ apiKey: key });
  void Platform;
  void monetizationConfig;
}

export async function purchaseMonthlyViaStore(): Promise<EntitlementSnapshot | null> {
  if (!isRevenueCatConfigured()) return null;
  // Placeholder: Purchases.getOfferings() → purchasePackage(monthly)
  return null;
}

export async function restorePurchasesViaStore(): Promise<EntitlementSnapshot | null> {
  if (!isRevenueCatConfigured()) return null;
  // Placeholder: Purchases.restorePurchases() → entitlements.active[premium]
  return null;
}
