# 실기기 QA 체크리스트 — Lịch Cổ Điển

> **목적:** 스토어 제출 전 iOS/Android 실기기에서 한 바퀴 돌리기  
> **환경:** Expo Go **아님** — `eas build --profile preview` APK/IPA 권장 (알림·공유·권한 검증)  
> **기록:** 각 항목 `[ ]` → `[x]` / 실패는 아래 **실패 로그 템플릿**으로 남기기  
> **현재 단계:** 무료 v1.0 코드 1차 마감 → **preview 빌드 → 실기 QA → 실패만 수정** → AdMob/RevenueCat

---

## 0. 준비

| 항목 | iOS | Android |
|------|-----|---------|
| 빌드 | `npm run build:preview:ios` | `npm run build:preview:android` |
| 알림 권한 | 설정 → Lịch Cổ Điển → 알림 ON | 앱 첫 실행 시 허용 |
| 테스트 TZ | **기기 시간대를 VN이 아닌 곳(예: UTC+9)으로 바꿔도** 07:30 VN에 오는지 확인 | 동일 |
| 네트워크 | Wi‑Fi ON → 비행기 모드 전환 각 1회 | 동일 |

### QA 전 한 번만 확인

**Giỗ 알림을 빨리 검증하려면**

- Giỗ는 **저장한 양력일의 음력(월/일)** 기준으로 매년 재예약됩니다.
- **당일 알림:** 오늘 양력일 = 올해 giỗ 음력일이 겹치는 날에 HÔM NAY → GHI CHÚ → Giỗ âm 저장 → Cá nhân에서 알림 ON → 당일 07:30 VN (이미 지났으면 다음 해).
- **1일 전 알림:** Cá nhân → `1 ngày trước` 선택 → **다모레**가 giỗ 음력일인 항목을 만들면 **내일** 07:30 VN에 “1 ngày 전” 알림이 옵니다. (THÁNG에서 음력일 확인 후 해당 양력일에 저장)
- 토글 ON 직후: iOS **설정 → 알림 → 예약된 알림** / Android **알림 채널·예약**에서 건수·시각 확인.

**Rằm / Mùng Một이 멀 때**

- 스케줄러는 **앞으로 60일** 안의 Mùng 1 / Rằm (15)만 예약합니다.
- 가장 가까운 1일 또는 15일 음력일까지 기다리거나, QA는 “예약 목록에 다음 Rằm/Mùng 1이 07:30 VN으로 잡혔는지”만 먼저 확인하고, **도착 테스트**는 그 날짜에 재검.

**Android 배터리**

- 설정 → 앱 → Lịch Cổ Điển → **배터리 최적화 제외**(또는 unrestricted) 권장. 최적화 ON이면 07:30 VN 알림이 밀릴 수 있음.

**iOS 재시작**

- 권한 허용 → **앱 강제 종료 후 재실행** → 예약 알림이 유지되는지 (설정 → 알림 → 예약).

**권한 거부/허용**

- 거부 시 Cá nhân 토글 → Alert 안내 확인 → 설정에서 허용 후 토글 OFF→ON → `schedule` 건수 > 0.

---

## 1. 홈 · 일력 (HÔM NAY)

- [ ] 앱 실행 → 오늘 **양력 큰 숫자** = 베트남 오늘(`Asia/Ho_Chi_Minh`)과 일치
- [ ] `Ngày Hoàng Đạo` / `Nên` · `Kiêng` 한 줄 요약 표시
- [ ] **좌 스와이프** → 찢김 + 사운드 + (가능하면) 햅틱 → **다음날**으로 전환
- [ ] **우 스와이프** → **어제**로 전환 (찢김 없이)
- [ ] 오늘이 아닐 때 `Về hôm nay` → 찢김 연출로 오늘 복귀
- [ ] `Chia sẻ tờ lịch` → 이미지 생성 + OS 공유 시트 · **갤러리 저장/공유** 확인
- [ ] `Sắp tới` 카드 — Rằm/Mùng Một + 개인 giỗ/생일 혼합 표시
- [ ] `Sắp tới` → `Tất cả ›` → Danh sách giỗ & sinh nhật 화면

---

## 2. Giỗ / Sinh nhật âm (Sprint 2–3)

### 입력 (GHI CHÚ / GIỖ LỄ)

- [ ] `Giỗ âm` 칩 선택 → 저장 → `Giỗ âm dd/mm` 힌트 + `Lần tới: … · Còn N ngày`
- [ ] `Sinh nhật âm` 칩 선택 → 저장 → `Sinh nhật âm dd/mm` 힌트
- [ ] 같은 칩 다시 탭 → 기념일 해제
- [ ] 저장 실패 시뮬 (저장 공간 부족 등) → `Chưa lưu được` + Alert (가능한 경우)

### 월간 (THÁNG)

- [ ] Giỗ 저장 후 **THÁNG** 탭 → 해당 **음력일** 양력 칸에 **吉** + 빨간 하단선
- [ ] Sinh nhật 저장 → 같은 음력일에 **寿** + 금색 하단선
- [ ] 범례: `Giỗ âm` / `Sinh nhật` 표시
- [ ] 칸 탭 → HÔM NAY 해당 양력일로 이동

### 목록 (Cá nhân → Danh sách)

- [ ] `Giỗ` / `Sinh nhật` 배지 구분
- [ ] D-day · 다음 양력일 정확
- [ ] 행 탭 / **Sửa** / **Xóa** → HÔM NAY 이동 · 삭제 후 목록·알림 갱신

---

## 3. 알림 (07:30 giờ Việt Nam)

> Cá nhân에서 각 토글 ON 후 **1–2분 내** 예약 확인: iOS 설정 → 알림 → 예약 / Android 알림 채널

### Rằm / Mùng Một

- [ ] Cá nhân → Rằm/Mùng Một 알림 ON
- [ ] 예약된 알림 시각 = **다음 Rằm 또는 Mùng 1** 아침 **07:30 VN** (기기 TZ와 무관)
- [ ] **알림 탭** → HÔM NAY **해당 양력일**로 이동

### Giỗ & Sinh nhật âm

- [ ] Giỗ 1건 + Sinh nhật 1건 저장
- [ ] Cá nhân → **Nhắc Giỗ âm lịch** ON
- [ ] **당일 07:30 VN** 알림 — Giỗ: `Giỗ · âm …` / Sinh nhật: `Sinh nhật · âm …`
- [ ] **1일 전** (무료: 0/1일만 · Premium: 3/7일) 07:30 VN 알림
- [ ] **알림 탭** → HÔM NAY **해당 양력일**로 이동
- [ ] 메모 수정 / giỗ 삭제 → 재스케줄 (중복 알림 없음)
- [ ] 앱 종료 후 **VN 날짜 넘김**(또는 24h+) → 백그라운드 복귀 시 오늘 날짜·알림 갱신

---

## 4. Cá nhân · 기타

- [ ] `Chính sách bảo mật` — URL 설정 시 브라우저 / 미설정 시 인앱 모달
- [ ] Cam kết / mood 도장 — 저장 후 날짜 넘기면 해당일 복원
- [ ] Tiện ích — 금/기름 로드 · offline 배너(펼침 시)
- [ ] Tử vi — 스크롤·탭 정상 (mock 광고 오버레이 OK)

---

## 5. 회귀 · 성능

- [ ] 콜드 스타트 < 3초 (중급 기기 기준)
- [ ] 탭 전환(HÔM NAY ↔ THÁNG ↔ CÁ NHÂN) 프레임 드롭 없음
- [ ] 10회 연속 tear-off 크래시 없음
- [ ] 다크모드 / 큰 글씨(iOS Dynamic Type) — 레이아웃 깨짐 기록

---

## QA 로그

| 날짜 | 기기 | OS | 빌드 | 결과 | 이슈 |
|------|------|-----|------|------|------|
| | | | preview # | PASS / FAIL | |

### 실패 로그 템플릿 (FAIL 시 복사)

```text
[FAIL] Giỗ 1 ngày trước
Device: Pixel 7 / Android 15
Device TZ: Korea (UTC+9)
App build: preview android 1.0.0 (EAS build #___)
Expected: 07:30 VN notification
Actual: no notification / arrived at 09:30 KR
Steps:
1. Cá nhân → Nhắc Giỗ ON, 1 ngày trước
2. Hôm nay → Giỗ âm 저장 (âm …)
3. …
Scheduled count: ___ (getAllScheduledNotificationsAsync / iOS 예약)
Screenshot: (optional)
```

**우선순위 (승부)** — 이 순서로 PASS 먼저:

1. Giỗ 당일 / 1일 전 · 07:30 VN  
2. Rằm / Mùng Một · 07:30 VN  
3. 알림 탭 → HÔM NAY 해당일  
4. 권한 거부 / 허용 · 토글 복구  
5. 비-VN TZ에서도 07:30 VN  
6. Chia sẻ 이미지 저장/공유  

---

## 알려진 제한 (Day‑1 의도)

- Giờ Hoàng Đạo **아침 푸시** — Update #1 (자동 푸시 안 함)
- RevenueCat / AdMob — **QA 통과 후** 연동 (현재 mock Premium / mock rewarded)
- OS 홈 화면 위젯 — 미구현
- Tử vi `todayKey` — 탭을 연 채 VN 자정 넘기면 unlock·점수 갱신 지연 (후속 패치)
- 무료 giỗ **5건** = 음력일 기준 중복 제거 (`listUniqueGio`) — 가족 “5명”이 아니라 “5 음력일”

---

*스토어 제출 전 [`STORE-CHECKLIST.md`](./STORE-CHECKLIST.md)와 함께 사용.*
