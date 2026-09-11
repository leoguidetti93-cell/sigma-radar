-- Σ SIGMA RADAR Fit V5.4.0 — jejum estruturado no perfil
alter table public.profiles add column if not exists fasting_mode text not null default 'none';
alter table public.profiles add column if not exists fasting_window_start time;
alter table public.profiles add column if not exists fasting_window_end time;
alter table public.profiles add column if not exists fasting_days text[] not null default '{}';

-- Normalização conservadora para perfis existentes.
update public.profiles set fasting_mode='none' where fasting_mode is null or fasting_mode not in ('none','intermittent','full_days');
update public.profiles set fasting_days='{}' where fasting_days is null;
