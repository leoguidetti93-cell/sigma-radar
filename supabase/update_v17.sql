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
