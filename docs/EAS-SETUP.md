# EAS 빌드 · 스토어 제출 가이드

## 1. Expo 계정

```bash
cd "/Users/namgyeongmin/Desktop/일력"
npm install
npx eas-cli login
```

브라우저 또는 이메일로 Expo 계정 로그인.

## 2. EAS 프로젝트 연결

```bash
npx eas-cli init
```

성공하면 `app.json` → `expo.extra.eas.projectId`가 실제 UUID로 채워짐.  
커밋 후 push.

## 3. Privacy URL (스토어 필수)

1. GitHub → **luwan085-ai/lich-co-dien** → Settings → Pages  
2. Source: **Deploy from branch** · Branch `main` · Folder **`/docs`**  
3. 배포 후 URL: `https://luwan085-ai.github.io/lich-co-dien/privacy.html`

로컬 `.env` (git에 올리지 않음):

```bash
cp .env.example .env
# 편집:
EXPO_PUBLIC_PRIVACY_URL=https://luwan085-ai.github.io/lich-co-dien/privacy.html
```

EAS 빌드 시 [expo.dev](https://expo.dev) 프로젝트 **Environment variables**에도 동일 키 추가.

## 4. 프리뷰 빌드 (실기기 QA용)

```bash
# Android APK (내부 배포)
npm run build:preview:android

# iOS (Apple Developer + 등록된 기기 필요)
npm run build:preview:ios
```

빌드 완료 후 Expo 대시보드에서 QR/링크로 설치 → [`DEVICE-QA.md`](./DEVICE-QA.md) 체크.

## 5. 프로덕션 빌드 · 제출

```bash
npm run build:production:android
npm run build:production:ios

# 스토어 업로드 (자격 증명 설정 후)
npx eas-cli submit -p android --latest
npx eas-cli submit -p ios --latest
```

### 사전 준비

| 플랫폼 | 필요 |
|--------|------|
| iOS | Apple Developer ($99/년), App Store Connect 앱, 번들 ID `vn.lichcodien.app` |
| Android | Play Console ($25), 패키지 `vn.lichcodien.app` |

스토어 문구 초안: [`STORE-LISTING.md`](./STORE-LISTING.md)

## 6. 수익화 (선택 · Day‑1 이후 가능)

`.env` / EAS env:

- `EXPO_PUBLIC_RC_IOS_KEY` / `EXPO_PUBLIC_RC_ANDROID_KEY`
- `EXPO_PUBLIC_ADMOB_IOS_REWARDED` / `EXPO_PUBLIC_ADMOB_ANDROID_REWARDED`

네이티브 모듈 추가 후 **새 EAS 빌드** 필요 (`react-native-purchases`, `react-native-google-mobile-ads`).

---

*체크리스트: [`STORE-CHECKLIST.md`](./STORE-CHECKLIST.md)*
