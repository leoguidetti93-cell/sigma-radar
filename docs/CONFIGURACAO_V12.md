# SIGMA RADAR Fit v1.2 — configuração

## 1. Banco existente
No Supabase > SQL Editor, execute `supabase/update_v2.sql`.
Ele adiciona `custom_foods` e `body_logs` com RLS por usuário.

## 2. IA real do Σ Coach
O frontend nunca recebe a chave da OpenAI.
A IA roda em `supabase/functions/coach/index.ts`.

No Supabase, crie/deploy uma Edge Function chamada `coach` com esse arquivo.
Depois configure o secret `OPENAI_API_KEY` no ambiente da função.

O site usa `supabase.functions.invoke('coach')`.
Se a função ainda não estiver disponível, existe um fallback local para alguns casos, mas a IA completa depende da Edge Function.

## 3. Segurança
- `config.js` contém somente Project URL e Publishable Key do Supabase.
- Nunca coloque `service_role` ou Secret key do Supabase no GitHub.
- Nunca coloque `OPENAI_API_KEY` no GitHub.
- RLS isola perfis, dias, refeições, exercícios, alimentos próprios e peso por usuário.

## 4. Fluxo diário
O botão `CONCLUIR MEU DIA` fica sempre visível.
Ao concluir, o sistema salva exatamente o progresso daquele dia e abre a data seguinte.
O seletor de data permite voltar a um dia anterior que ficou sem registro e preencher os dias em sequência.

## 5. Alimentos
`assets/foods.json` contém 440 itens: 55 em cada uma de 8 categorias.
Os valores são aproximados e devem ser refinados com uma base nutricional oficial antes de produção clínica/comercial em escala.
Alimentos cadastrados pelo usuário ficam em `custom_foods` e aparecem como `MEU ALIMENTO`.
