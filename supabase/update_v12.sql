-- Σ SIGMA RADAR Fit V5.1.1 — Intelligence Refinement
-- Execute uma única vez APÓS update_v11.sql.

alter table public.exercise_logs add column if not exists skipped boolean not null default false;
alter table public.exercise_logs add column if not exists skip_reason text;
create index if not exists exercise_logs_user_skipped_idx on public.exercise_logs(user_id, log_date desc, skipped);

alter table public.body_logs add column if not exists waist_cm numeric;
alter table public.body_logs add column if not exists body_fat_pct numeric;
alter table public.body_logs add column if not exists lean_mass_pct numeric;
alter table public.body_logs add column if not exists lean_mass_kg numeric;
alter table public.body_logs add column if not exists body_water_pct numeric;
alter table public.body_logs add column if not exists visceral_fat numeric;
alter table public.body_logs add column if not exists bone_mass_kg numeric;
alter table public.body_logs add column if not exists device_bmr_kcal numeric;

-- A composição corporal é opcional: NULL significa desconhecido, nunca zero.
