# 실기기 QA 체크리스트 — Lịch Cổ Điển

> **목적:** 스토어 제출 전 iOS/Android 실기기에서 한 바퀴 돌리기  
> **환경:** Expo Go **아님** — `eas build --profile preview` APK/IPA 권장 (알림·공유·권한 검증)  
> **기록:** 각 항목 `[ ]` → `[x]` / 이슈는 하단 **로그**에 날짜·기기·OS 적기

---

## 0. 준비

| 항목 | iOS | Android |
|------|-----|---------|
| 빌드 | `npm run build:preview:ios` | `npm run build:preview:android` |
| 알림 권한 | 설정 → Lịch Cổ Điển → 알림 ON | 앱 첫 실행 시 허용 |
| 테스트 TZ | **기기 시간대를 VN이 아닌 곳(예: UTC+9)으로 바꿔도** 07:30 VN에 오는지 확인 | 동일 |
| 네트워크 | Wi‑Fi ON → 비행기 모드 전환 각 1회 | 동일 |

---

## 1. 홈 · 일력 (HÔM NAY)

- [ ] 앱 실행 → 오늘 **양력 큰 숫자** = 베트남 오늘(`Asia/Ho_Chi_Minh`)과 일치
- [ ] `Ngày Hoàng Đạo` / `Nên` · `Kiêng` 한 줄 요약 표시
- [ ] **좌 스와이프** → 찢김 + 사운드 + (가능하면) 햅틱 → **다음날**으로 전환
- [ ] **우 스와이프** → **어제**로 전환 (찢김 없이)
- [ ] 오늘이 아닐 때 `Về hôm nay` → 찢김 연출로 오늘 복귀
- [ ] `Chia sẻ tờ lịch` → 이미지 생성 + OS 공유 시트 열림
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
- [ ] 행 탭 → HÔM NAY 해당 날짜

---

## 3. 알림 (07:30 giờ Việt Nam)

> Cá nhân에서 각 토글 ON 후 **1–2분 내** 예약 확인: iOS 설정 → 알림 → 예약 / Android 알림 채널

### Rằm / Mùng Một

- [ ] Cá nhân → Rằm/Mùng Một 알림 ON
- [ ] 예약된 알림 시각 = **다음 Rằm 또는 Mùng 1** 아침 **07:30 VN** (기기 TZ와 무관)
- [ ] 알림 탭 → 앱 열림 (홈)

### Giỗ & Sinh nhật âm

- [ ] Giỗ 1건 + Sinh nhật 1건 저장
- [ ] Cá nhân → **Nhắc Giỗ âm lịch** ON
- [ ] **당일 07:30 VN** 알림 — Giỗ: `Giỗ · âm …` / Sinh nhật: `Sinh nhật · âm …`
- [ ] **N일 전** (Cá nhân에서 1/3/7일 선택) 07:30 VN 알림
- [ ] **알림 탭** → HÔM NAY **해당 양력일**로 이동 (Sprint 3)
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

---

## 알려진 제한 (Day‑1 의도)

- Giờ Hoàng Đạo **아침 푸시** — Update #1 (자동 푸시 안 함)
- RevenueCat / AdMob — 키 없으면 mock
- OS 홈 화면 위젯 — 미구현

---

*스토어 제출 전 [`STORE-CHECKLIST.md`](./STORE-CHECKLIST.md)와 함께 사용.*
