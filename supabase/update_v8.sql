-- Σ SIGMA RADAR Fit V4.0.0 — planejamento persistente e preferências vivas
alter table public.profiles add column if not exists food_preferences jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists plan_revision int not null default 1;
alter table public.profiles add column if not exists plan_updated_at timestamptz;
alter table public.profiles add column if not exists goal_phase_started_at date;

create table if not exists public.nutrition_plan_rules (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 rule_type text not null,
 from_value text,
 to_value text,
 payload jsonb not null default '{}'::jsonb,
 active boolean not null default true,
 created_at timestamptz default now(),
 updated_at timestamptz default now()
);
create index if not exists nutrition_plan_rules_user_idx on public.nutrition_plan_rules(user_id,active);
alter table public.nutrition_plan_rules enable row level security;
drop policy if exists nutrition_plan_rules_own on public.nutrition_plan_rules;
create policy nutrition_plan_rules_own on public.nutrition_plan_rules for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
