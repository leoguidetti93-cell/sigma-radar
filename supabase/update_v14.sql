-- SIGMA RADAR Fit V5.2.0 — atividades com estado explícito
alter table public.activity_logs add column if not exists skipped boolean not null default false;
alter table public.activity_logs add column if not exists skip_reason text;
create index if not exists activity_logs_user_date_status_idx on public.activity_logs(user_id, log_date, completed, skipped);
