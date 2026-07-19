/**
 * Store identity — keep in sync with app.json ios.bundleIdentifier / android.package.
 * Host docs/PRIVACY.md and paste the public URL into privacyPolicyUrl before submit.
 */
export const storeConfig = {
  displayName: 'Lịch Cổ Điển',
  bundleIdentifier: 'vn.lichcodien.app',
  androidPackage: 'vn.lichcodien.app',
  /** Public HTTPS URL required by App Store / Play. Empty → in-app Privacy modal. */
  privacyPolicyUrl: process.env.EXPO_PUBLIC_PRIVACY_URL ?? '',
  version: '1.0.0',
} as const;
