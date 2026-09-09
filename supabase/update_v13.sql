-- Σ SIGMA RADAR Fit V5.1.4 — porções fixas / embalagens inteiras
-- Execute uma única vez após update_v12.sql.
alter table public.custom_foods add column if not exists fixed_portion boolean not null default false;
comment on column public.custom_foods.fixed_portion is 'Quando true, a porção cadastrada representa uma unidade/embalagem que não deve ser fracionada pelo Coach.';

-- Compatibilidade com produtos já cadastrados antes desta versão.
update public.custom_foods set fixed_portion=true where fixed_portion=false and lower(name) ~ '(yopro|pro force|hydro protein)' and lower(portion_label) ~ '(ml|unid|garrafa|caixa)';
