# Σ SIGMA RADAR Fit — V2.1.0

A V2.1 amplia o Σ Coach de editor do dia para planejador de rotina multi-dia.

## Memória operacional
A migration `update_v6.sql` cria `coach_messages`. A Edge Function lê as mensagens recentes, ações aplicadas, planos próximos e logs antes de responder. A instrução central é não perguntar novamente dados já disponíveis no contexto.

## Outras atividades
O perfil passa a armazenar `other_activities_text` e `other_activities`. A tela de Treino permite gerenciar atividade, frequência, duração e dias preferidos. O `workout_plans` passa a ter `activities` por data e `activity_logs` registra execução real.

## Reprogramação multi-dia
A ação `reprogram_schedule` grava vários `workout_plans` de uma vez. A ação `update_other_activities` altera a rotina-base. As duas podem ser combinadas em `batch_actions` sob uma única aprovação.

## Ordem de atualização
1. Rodar `supabase/update_v6.sql`.
2. Fazer deploy da nova `supabase/functions/coach/index.ts`.
3. Publicar site V2.1.0.
