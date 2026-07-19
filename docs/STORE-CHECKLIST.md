# Store build checklist — Lịch Cổ Điển

## Trước khi EAS / store submit

### Keys & env
- [ ] `EXPO_PUBLIC_RC_IOS_KEY` / `EXPO_PUBLIC_RC_ANDROID_KEY` (RevenueCat)
- [ ] `EXPO_PUBLIC_ADMOB_IOS_REWARDED` / `EXPO_PUBLIC_ADMOB_ANDROID_REWARDED`
- [ ] `EXPO_PUBLIC_PRIVACY_URL` — host [`docs/PRIVACY.md`](./PRIVACY.md) rồi dán URL
- [ ] Cài `react-native-purchases` + `react-native-google-mobile-ads` (EAS native build)
- [ ] Điền body thật trong [`src/monetization/revenueCat.ts`](../src/monetization/revenueCat.ts) và `loadNativeRewarded` ở [`src/monetization/ads.tsx`](../src/monetization/ads.tsx)

### app.json / Expo
- [x] `ios.bundleIdentifier` / `android.package` = `vn.lichcodien.app`
- [x] Display name `Lịch Cổ Điển` + splash `#FDFBF7`
- [x] `expo-notifications` + iOS usage description
- [x] `eas.json` skeleton
- [ ] Thay `extra.eas.projectId` sau `eas init`
- [ ] Icon / adaptive icon final art (assets hiện có — review trước submit)

### Sản phẩm
- [ ] Premium entitlement `premium`, gói 25.000₫/tháng trên App Store / Play
- [ ] Rewarded unit gắn tử vi (`useRewardedAdGate`)
- [ ] Test: mock mode không còn dùng trên production build có key

### QA máy thật (device)
- [ ] Tear lịch trái/phải + hint + Về hôm nay
- [ ] Cam kết / stamp / memo / giỗ hiện trên tháng (lặp theo âm)
- [ ] Giá vàng + xăng Vùng 1/2 + offline banner
- [ ] Rằm / Mùng Một notification · **7:30 giờ VN** (không phụ thuộc TZ máy)
- [ ] Giỗ âm notification · bật trong Cá nhân sau khi đánh dấu giỗ
- [ ] Chia sẻ tờ lịch (iOS/Android)
- [ ] Profile → Chính sách bảo mật (modal hoặc URL)

## Content / compliance
- [x] Tử vi local packs: ≥5 lines/facet (love/work/money/advice)
- [x] Vietlott block shows VN disclaimer (giải trí · trách nhiệm · dưới 18)
- [ ] Do **not** auto-push Giờ Hoàng Đạo on day-1 — keep for Update #1
- [x] Giỗ lưu lunar intent + nhắc theo âm (`src/lib/gioNotifications.ts`)

### Legal / store copy
- [x] Tên hiển thị: Lịch Cổ Điển
- [ ] Mô tả Việt + screenshot giấy xé
- [ ] Age rating / ads disclosure
- [ ] Host privacy URL công khai
