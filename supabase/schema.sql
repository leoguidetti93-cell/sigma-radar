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
-- Σ SIGMA RADAR Fit V6.0.0 — módulo SAÚDE
-- Dados pessoais de saúde: tabelas privadas por usuário com RLS.

create table if not exists public.health_exam_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_date date not null,
  marker_key text,
  marker_name text not null,
  value_numeric numeric,
  value_text text,
  unit text,
  ref_min numeric,
  ref_max numeric,
  ref_text text,
  fasting boolean,
  lab_name text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.health_medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  dose_value numeric,
  dose_unit text,
  frequency_text text,
  route text,
  start_date date,
  end_date date,
  status text not null default 'active',
  prescribed_by text,
  reason text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.health_supplements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  dose_value numeric,
  dose_unit text,
  frequency_text text,
  start_date date,
  end_date date,
  status text not null default 'active',
  purpose text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.health_symptoms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symptom_date date not null default current_date,
  kind text not null default 'symptom',
  symptom_name text not null,
  body_area text,
  side text,
  severity int,
  description text,
  triggers text,
  status text not null default 'active',
  resolved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint health_symptoms_severity_chk check (severity is null or (severity between 0 and 10))
);

create table if not exists public.health_therapies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  therapy_type text,
  name text not null,
  provider text,
  frequency_text text,
  start_date date,
  end_date date,
  status text not null default 'active',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.health_procedures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  procedure_type text not null default 'procedure',
  name text not null,
  procedure_date date,
  restrictions text,
  exercise_clearance text,
  provider text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists health_exam_results_user_date_idx on public.health_exam_results(user_id, exam_date desc);
create index if not exists health_exam_results_marker_idx on public.health_exam_results(user_id, marker_key, exam_date desc);
create index if not exists health_medications_user_status_idx on public.health_medications(user_id, status);
create index if not exists health_supplements_user_status_idx on public.health_supplements(user_id, status);
create index if not exists health_symptoms_user_status_idx on public.health_symptoms(user_id, status, symptom_date desc);
create index if not exists health_therapies_user_status_idx on public.health_therapies(user_id, status);
create index if not exists health_procedures_user_date_idx on public.health_procedures(user_id, procedure_date desc);

alter table public.health_exam_results enable row level security;
alter table public.health_medications enable row level security;
alter table public.health_supplements enable row level security;
alter table public.health_symptoms enable row level security;
alter table public.health_therapies enable row level security;
alter table public.health_procedures enable row level security;

drop policy if exists health_exam_results_own on public.health_exam_results;
create policy health_exam_results_own on public.health_exam_results for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists health_medications_own on public.health_medications;
create policy health_medications_own on public.health_medications for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists health_supplements_own on public.health_supplements;
create policy health_supplements_own on public.health_supplements for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists health_symptoms_own on public.health_symptoms;
create policy health_symptoms_own on public.health_symptoms for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists health_therapies_own on public.health_therapies;
create policy health_therapies_own on public.health_therapies for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists health_procedures_own on public.health_procedures;
create policy health_procedures_own on public.health_procedures for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
