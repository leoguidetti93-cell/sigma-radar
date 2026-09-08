-- Σ SIGMA RADAR Fit V5.0.0
-- Horário de hidratação + estado persistente das sugestões ao vivo do Σ Coach.

alter table public.beverage_logs
  add column if not exists consumed_at timestamptz;

update public.beverage_logs
set consumed_at = coalesce(consumed_at, created_at, now())
where consumed_at is null;

alter table public.beverage_logs
  alter column consumed_at set default now();

create index if not exists beverage_logs_user_consumed_idx
  on public.beverage_logs(user_id, consumed_at desc);

create table if not exists public.live_coach_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  suggestion_date date not null,
  suggestion_key text not null,
  snoozed_until timestamptz,
  acted_at timestamptz,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_id, suggestion_date, suggestion_key)
);

create index if not exists live_coach_suggestions_user_date_idx
  on public.live_coach_suggestions(user_id, suggestion_date);

alter table public.live_coach_suggestions enable row level security;
drop policy if exists live_coach_suggestions_own on public.live_coach_suggestions;
create policy live_coach_suggestions_own on public.live_coach_suggestions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
