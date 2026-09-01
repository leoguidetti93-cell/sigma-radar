-- SIGMA RADAR Fit v1.2 - migration for an existing project
create extension if not exists "pgcrypto";

create table if not exists public.custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  portion_label text not null,
  kcal numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.body_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  weight_kg numeric,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, log_date)
);

alter table public.custom_foods enable row level security;
alter table public.body_logs enable row level security;

drop policy if exists custom_foods_own on public.custom_foods;
create policy custom_foods_own on public.custom_foods for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists body_logs_own on public.body_logs;
create policy body_logs_own on public.body_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
