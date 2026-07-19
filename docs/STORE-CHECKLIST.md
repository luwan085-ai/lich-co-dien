# Store build checklist — Lịch Cổ Điển

## Trước khi EAS / store submit

### Keys & env
- [ ] `EXPO_PUBLIC_RC_IOS_KEY` / `EXPO_PUBLIC_RC_ANDROID_KEY` (RevenueCat)
- [ ] `EXPO_PUBLIC_ADMOB_IOS_REWARDED` / `EXPO_PUBLIC_ADMOB_ANDROID_REWARDED`
- [ ] Cài `react-native-purchases` + `react-native-google-mobile-ads` (EAS native build)
- [ ] Điền body thật trong [`src/monetization/revenueCat.ts`](../src/monetization/revenueCat.ts) và `loadNativeRewarded` ở [`src/monetization/ads.tsx`](../src/monetization/ads.tsx)

### app.json / Expo
- [ ] `ios.bundleIdentifier` / `android.package` 확정
- [ ] Icon, splash, adaptive icon
- [ ] `expo-notifications` plugin (đã có skeleton)
- [ ] Privacy policy URL (giỗ/memo local, ads)

### Sản phẩm
- [ ] Premium entitlement `premium`, gói 25.000₫/tháng trên App Store / Play
- [ ] Rewarded unit gắn tử vi (`useRewardedAdGate`)
- [ ] Test: mock mode không còn dùng trên production build có key

### QA ngắn
- [ ] Tear lịch trái/phải + Về hôm nay
- [ ] Cam kết / stamp / memo / giỗ hiện trên tháng
- [ ] Giá vàng + xăng Vùng 1/2 + offline banner
- [ ] Rằm / Mùng Một notification trên máy thật
- [ ] Chia sẻ tờ lịch (iOS/Android)

### Legal / store copy
- [ ] Tên hiển thị: Lịch Cổ Điển
- [ ] Mô tả Việt + screenshot giấy xé
- [ ] Age rating / ads disclosure
