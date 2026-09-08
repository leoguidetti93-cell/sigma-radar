-- Σ SIGMA RADAR Fit V5.1.0 — Coach Intelligence
-- Execute uma única vez APÓS update_v10.sql (V5.0 já validada).

-- Três estados de refeição: realizada / não realizada / desconhecida.
alter table public.meal_logs add column if not exists skipped boolean not null default false;
create index if not exists meal_logs_user_skipped_idx on public.meal_logs(user_id, log_date desc, skipped);

-- Percepção pós-treino para leitura longitudinal do Σ Coach.
create table if not exists public.workout_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  feeling text not null check (feeling in ('ÓTIMO','BOM','CANSADO','COM DOR','MUITO DIFÍCIL')),
  detail text,
  completed_exercises integer,
  planned_exercises integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, log_date)
);
create index if not exists workout_feedback_user_date_idx on public.workout_feedback(user_id, log_date desc);
alter table public.workout_feedback enable row level security;
drop policy if exists workout_feedback_own on public.workout_feedback;
create policy workout_feedback_own on public.workout_feedback for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
