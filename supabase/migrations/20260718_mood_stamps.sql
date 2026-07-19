-- Mood stamps for Lịch Cổ Điển (device-scoped until auth lands)
create table if not exists public.mood_stamps (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  solar_date date not null,
  mood text not null check (mood in ('happy', 'calm', 'angry', 'sad', 'jackpot')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (device_id, solar_date)
);

create index if not exists mood_stamps_device_date_idx
  on public.mood_stamps (device_id, solar_date desc);

alter table public.mood_stamps enable row level security;

-- Temporary open policies for MVP (tighten with auth later)
drop policy if exists "mood_stamps_select" on public.mood_stamps;
drop policy if exists "mood_stamps_insert" on public.mood_stamps;
drop policy if exists "mood_stamps_update" on public.mood_stamps;

create policy "mood_stamps_select"
  on public.mood_stamps for select
  to anon, authenticated
  using (true);

create policy "mood_stamps_insert"
  on public.mood_stamps for insert
  to anon, authenticated
  with check (true);

create policy "mood_stamps_update"
  on public.mood_stamps for update
  to anon, authenticated
  using (true)
  with check (true);
