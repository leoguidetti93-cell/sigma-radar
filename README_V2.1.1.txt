Σ SIGMA RADAR Fit V2.1.1 — correção de reprogramação global

O que mudou:
- Nova ação set_nutrition_plan: calorias + proteína + carboidrato + gordura são salvos juntos.
- Quando a meta calórica muda, as refeições ainda não concluídas do dia são recalibradas e salvas para acompanhar a nova meta.
- O topo da Alimentação mostra as metas persistentes do plano, sem confundir com a soma antiga das refeições.
- batch_actions agora valida cada parte da reprogramação; se algo falhar, o Coach informa execução parcial em vez de afirmar que atualizou tudo.
- Prompt da Edge Function proíbe o Coach de afirmar alteração de nutrição sem enviar a ação executável correspondente.

ATUALIZAÇÃO A PARTIR DA V2.1.0
1. NÃO há SQL novo. O update_v6.sql continua sendo o mais recente.
2. Faça redeploy da Edge Function coach usando supabase/functions/coach/index.ts deste pacote.
3. Suba os arquivos do site.
4. A versão usa cache v=2.1.1.

Teste sugerido:
Peça ao Σ Coach para recalcular/reprogramar calorias, macros, hidratação e treino. Após aprovar, confira se as metas no topo da Alimentação mudam e se as porções/refeições abertas são recalibradas.
