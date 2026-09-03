Σ SIGMA RADAR Fit V4.0.1 — EDGE FUNCTION HOTFIX

Corrige falha de deploy da função coach da V4.0.0.

Causas encontradas:
1. As linhas de definição de replace_food_permanently e replan_profile ficaram fora da string SYSTEM, gerando erro de parse TypeScript.
2. O destructuring já esperava weeklyReviewsRes, mas a consulta weekly_reviews ainda não havia sido adicionada ao Promise.all.

Correções:
- Tipos 17 e 18 movidos corretamente para dentro do prompt SYSTEM.
- Consulta weekly_reviews adicionada ao Promise.all.
- Memória semanal recente continua ativa no Coach.

Instalação:
- Se update_v8.sql já foi executado, NÃO rode novamente por causa deste hotfix.
- Substitua apenas a Edge Function coach pelo index.ts corrigido e faça Deploy updates.
- O site V4.0.0 pode permanecer como está.
