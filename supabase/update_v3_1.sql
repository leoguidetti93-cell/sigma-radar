-- SIGMA RADAR FIT V1.3.1 - correção de salvamento / garantia de colunas
alter table public.profiles add column if not exists steps_goal integer;
alter table public.body_logs add column if not exists waist_cm numeric;
alter table public.body_logs add column if not exists body_fat_pct numeric;
alter table public.body_logs add column if not exists steps integer;
notify pgrst, 'reload schema';
