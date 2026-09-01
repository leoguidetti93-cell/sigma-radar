create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  sex text, age int, height_cm numeric,
  current_weight_kg numeric, target_weight_kg numeric,
  goal_text text, training_days text[] default '{}',
  minutes_per_session int, experience text,
  medications_text text, supplements_text text,
  meals_per_day int, current_water_l numeric, sleep_hours numeric,
  onboarding_complete boolean default false,
  calorie_target int, protein_target int, carbs_target int, fat_target int,
  water_target_l numeric, score int default 70,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null, training_pct numeric default 0, nutrition_pct numeric default 0,
  hydration_pct numeric default 0, water_l numeric default 0, score int, status text,
  created_at timestamptz default now(), updated_at timestamptz default now(), unique(user_id,log_date)
);

create table if not exists public.exercise_logs (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 log_date date not null, exercise_key text not null, exercise_name text not null, completed boolean default false,
 sets jsonb default '[]'::jsonb, notes text, created_at timestamptz default now(), unique(user_id,log_date,exercise_key)
);

create table if not exists public.meal_logs (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 log_date date not null, meal_key text not null, meal_name text not null, meal_time time, completed boolean default false,
 foods jsonb default '[]'::jsonb, kcal numeric default 0, protein_g numeric default 0, carbs_g numeric default 0, fat_g numeric default 0,
 created_at timestamptz default now(), unique(user_id,log_date,meal_key)
);

create table if not exists public.coach_actions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 action_type text not null, payload jsonb not null default '{}'::jsonb, status text default 'applied', created_at timestamptz default now()
);

create table if not exists public.weekly_reviews (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 week_start date not null, average_score numeric, training_pct numeric, nutrition_pct numeric, hydration_pct numeric,
 summary text, keep_text text, increase_text text, reduce_text text, proposed_changes jsonb, user_approved boolean,
 created_at timestamptz default now(), unique(user_id,week_start)
);

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.meal_logs enable row level security;
alter table public.coach_actions enable row level security;
alter table public.weekly_reviews enable row level security;

drop policy if exists profiles_own on public.profiles;
create policy profiles_own on public.profiles for all using(auth.uid()=id) with check(auth.uid()=id);
drop policy if exists daily_own on public.daily_logs;
create policy daily_own on public.daily_logs for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists exercise_own on public.exercise_logs;
create policy exercise_own on public.exercise_logs for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists meal_own on public.meal_logs;
create policy meal_own on public.meal_logs for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists coach_own on public.coach_actions;
create policy coach_own on public.coach_actions for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists weekly_own on public.weekly_reviews;
create policy weekly_own on public.weekly_reviews for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
