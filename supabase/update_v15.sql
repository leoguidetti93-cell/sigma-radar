-- Σ SIGMA RADAR Fit V5.3.0 — alimentos editáveis, compatibilidade vegana e porções antigas
alter table public.custom_foods add column if not exists contains_animal_products boolean not null default false;

-- Produtos lácteos/proteicos já cadastrados antes desta opção.
update public.custom_foods set contains_animal_products=true where lower(name) ~ '(yopro|pro force|hydro protein|whey|iogurte|leite|queijo|cottage|caseina)';

-- Hydro Protein usado no Sigma: garrafa inteira de 500 ml, não fracionável.
update public.custom_foods set portion_label='500 ml', fixed_portion=true, contains_animal_products=true where lower(name) ~ 'hydro protein';
