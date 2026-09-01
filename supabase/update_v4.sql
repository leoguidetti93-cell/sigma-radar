-- SIGMA RADAR FIT V1.4 — treino inteligente e contexto de ambiente
alter table public.profiles add column if not exists training_location text;
alter table public.profiles add column if not exists equipment_text text;
create table if not exists public.workout_plans (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 plan_date date not null,
 exercises jsonb not null default '[]'::jsonb,
 created_at timestamptz default now(),
 updated_at timestamptz default now(),
 unique(user_id, plan_date)
);
alter table public.workout_plans enable row level security;
drop policy if exists "workout_plans own select" on public.workout_plans; create policy "workout_plans own select" on public.workout_plans for select using (auth.uid()=user_id);
drop policy if exists "workout_plans own insert" on public.workout_plans; create policy "workout_plans own insert" on public.workout_plans for insert with check (auth.uid()=user_id);
drop policy if exists "workout_plans own update" on public.workout_plans; create policy "workout_plans own update" on public.workout_plans for update using (auth.uid()=user_id);
drop policy if exists "workout_plans own delete" on public.workout_plans; create policy "workout_plans own delete" on public.workout_plans for delete using (auth.uid()=user_id);
notify pgrst, 'reload schema';
