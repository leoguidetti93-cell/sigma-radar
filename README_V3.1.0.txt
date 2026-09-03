Σ SIGMA RADAR Fit V3.1.0 — RADAR EVOLUTIVO

Novo ciclo longitudinal do Radar Semanal:
- O fechamento recebe o último weekly_review encerrado.
- Compara treino, alimentação, hidratação e aderência com a semana anterior.
- Recebe também summary, manter, aumentar, reduzir e próximo passo anteriores.
- O Σ Coach é instruído a verificar se as recomendações anteriores melhoraram, pioraram ou ainda não podem ser avaliadas.
- Nova área visual "EVOLUÇÃO DESDE O ÚLTIMO RADAR" com comparação objetiva.
- Cards MANTER / AUMENTAR / REDUZIR agora são solicitados à IA em formato mais curto, até 3 pontos por card.
- Primeira semana continua funcionando normalmente sem comparação inventada.
- Fallback local também inclui comparação quando houver Radar anterior.

INSTALAÇÃO:
1. Substitua os arquivos do site pela V3.1.0.
2. REDEPLOY obrigatório da Edge Function coach usando supabase/functions/coach/index.ts desta versão.
3. Não há SQL novo. update_v7.sql continua sendo o schema atual.

Os weekly_reviews já existentes são aproveitados automaticamente; não é necessário recriar as semanas anteriores.
