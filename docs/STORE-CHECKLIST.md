# Store build checklist — Lịch Cổ Điển

상세 가이드: [`EAS-SETUP.md`](./EAS-SETUP.md) · 실기기 QA: [`DEVICE-QA.md`](./DEVICE-QA.md) · 스토어 문구: [`STORE-LISTING.md`](./STORE-LISTING.md)

## Trước khi EAS / store submit

### Keys & env
- [ ] `EXPO_PUBLIC_RC_IOS_KEY` / `EXPO_PUBLIC_RC_ANDROID_KEY` (RevenueCat)
- [ ] `EXPO_PUBLIC_ADMOB_IOS_REWARDED` / `EXPO_PUBLIC_ADMOB_ANDROID_REWARDED`
- [ ] `EXPO_PUBLIC_PRIVACY_URL` = `https://luwan085-ai.github.io/lich-co-dien/privacy.html`
- [ ] GitHub Pages: repo Settings → Pages → branch `main` → folder `/docs`
- [ ] Cài `react-native-purchases` + `react-native-google-mobile-ads` (EAS native build)
- [ ] Điền body thật trong [`src/monetization/revenueCat.ts`](../src/monetization/revenueCat.ts) và `loadNativeRewarded` ở [`src/monetization/ads.tsx`](../src/monetization/ads.tsx)

### app.json / Expo
- [x] `ios.bundleIdentifier` / `android.package` = `vn.lichcodien.app`
- [x] Display name `Lịch Cổ Điển` + splash `#FDFBF7`
- [x] `expo-notifications` + iOS usage description
- [x] Android `POST_NOTIFICATIONS` (API 33+)
- [x] `eas.json` + npm build scripts
- [ ] `npx eas-cli login` → `npx eas-cli init` → `projectId` thay placeholder
- [ ] Icon / adaptive icon final art (assets hiện có — review trước submit)

### Sản phẩm
- [ ] Premium entitlement `premium`, gói 25.000₫/tháng trên App Store / Play
- [ ] Rewarded unit gắn tử vi (`useRewardedAdGate`)
- [ ] Test: mock mode không còn dùng trên production build có key

### QA máy thật (device) — [`DEVICE-QA.md`](./DEVICE-QA.md)

**Core**
- [ ] Tear lịch trái/phải + hint + Về hôm nay
- [ ] Cam kết / stamp / memo trên tháng
- [ ] Giá vàng + xăng Vùng 1/2 + offline banner
- [ ] Chia sẻ tờ lịch (iOS/Android)
- [ ] Profile → Chính sách bảo mật (URL hoặc modal)

**Giỗ / sinh nhật âm (Sprint 2–3)**
- [ ] Giỗ âm vs Sinh nhật âm chip + lưu / lỗi lưu
- [ ] Tháng: **吉** (giỗ) vs **寿** (sinh nhật) theo âm lịch
- [ ] Danh sách giỗ — badge Giỗ / Sinh nhật
- [ ] Rằm / Mùng Một notification · **7:30 giờ VN** (không phụ thuộc TZ máy)
- [ ] Giỗ & sinh nhật notification · N ngày trước + ngày giỗ
- [ ] **Tap notification** → mở đúng ngày dương trên Hôm nay

## Content / compliance
- [x] Tử vi local packs: ≥5 lines/facet (love/work/money/advice)
- [x] Lucky cặp số 00–99 (Số Đề / Lô Tô) + VN disclaimer + KQXS link
- [ ] Do **not** auto-push Giờ Hoàng Đạo on day-1 — keep for Update #1
- [x] Giỗ lưu lunar intent + nhắc theo âm (`src/lib/gioNotifications.ts`)
- [x] `annivKind` giỗ vs sinh nhật (`src/lib/localMemos.ts`)

### Legal / store copy — [`STORE-LISTING.md`](./STORE-LISTING.md)
- [x] Tên hiển thị: Lịch Cổ Điển
- [ ] Mô tả Việt + screenshot giấy xé
- [ ] Age rating / ads disclosure
- [ ] Host privacy URL công khai ([`privacy.html`](./privacy.html))
