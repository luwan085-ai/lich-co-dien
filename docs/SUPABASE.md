# Supabase 연결 (간단 가이드)

## 1. 새 Supabase 프로젝트
다른 계정으로 프로젝트 1개 생성 (2개 제한 우회용).

## 2. SQL 실행
Dashboard → **SQL Editor** → New query →  
`supabase/migrations/20260718_mood_stamps.sql` 내용 붙여넣고 **Run**.

## 3. 키 넣기
Dashboard → **Project Settings → API**

- Project URL
- Publishable key (또는 Legacy **anon** key)

프로젝트 루트 `.env` 파일:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxx
```

`.env` 는 git에 올리지 않습니다. (`.gitignore` 처리됨)

## 4. 확인
앱 재시작 후 `Supabase: connected` 상태면 OK.
