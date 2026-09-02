-- Σ SIGMA RADAR Fit v1.4.3
-- Bebidas detalhadas, qualidade da hidratação e contexto para o Σ Coach.

create extension if not exists "pgcrypto";

create table if not exists public.beverage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  beverage_type text not null,
  beverage_label text not null,
  volume_ml numeric not null check (volume_ml > 0),
  hydration_counts boolean not null default false,
  quality_group text not null default 'beyond',
  source text not null default 'manual',
  created_at timestamptz default now()
);

create index if not exists beverage_logs_user_date_idx on public.beverage_logs(user_id, log_date);

alter table public.beverage_logs enable row level security;
drop policy if exists beverage_logs_own on public.beverage_logs;
create policy beverage_logs_own on public.beverage_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.daily_logs add column if not exists beyond_hydration_ml numeric default 0;
alter table public.daily_logs add column if not exists beverage_quality_pct numeric default 100;
