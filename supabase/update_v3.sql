-- SIGMA RADAR FIT V1.3
alter table public.profiles add column if not exists steps_goal integer;
alter table public.body_logs add column if not exists waist_cm numeric;
alter table public.body_logs add column if not exists body_fat_pct numeric;
alter table public.body_logs add column if not exists steps integer;
alter table public.meal_logs add column if not exists deleted boolean default false;
alter table public.daily_logs add column if not exists activity_pct numeric;
create table if not exists public.load_logs (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 log_date date not null, exercise_key text not null, exercise_name text not null, load_kg numeric not null,
 scheme text, created_at timestamptz default now()
);
alter table public.load_logs enable row level security;
drop policy if exists "load_logs own select" on public.load_logs; create policy "load_logs own select" on public.load_logs for select using (auth.uid()=user_id);
drop policy if exists "load_logs own insert" on public.load_logs; create policy "load_logs own insert" on public.load_logs for insert with check (auth.uid()=user_id);
drop policy if exists "load_logs own update" on public.load_logs; create policy "load_logs own update" on public.load_logs for update using (auth.uid()=user_id);
drop policy if exists "load_logs own delete" on public.load_logs; create policy "load_logs own delete" on public.load_logs for delete using (auth.uid()=user_id);
