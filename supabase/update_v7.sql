-- Σ SIGMA RADAR Fit V3.0 — fechamentos mensais persistentes
create table if not exists public.monthly_reviews (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 month_start date not null,
 average_score numeric, training_pct numeric, nutrition_pct numeric, hydration_pct numeric,
 weight_delta_kg numeric,
 summary text, evolution_text text, highlight_text text, next_text text,
 details jsonb default '{}'::jsonb,
 created_at timestamptz default now(), updated_at timestamptz default now(),
 unique(user_id,month_start)
);
alter table public.monthly_reviews enable row level security;
drop policy if exists monthly_reviews_own on public.monthly_reviews;
create policy monthly_reviews_own on public.monthly_reviews for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
