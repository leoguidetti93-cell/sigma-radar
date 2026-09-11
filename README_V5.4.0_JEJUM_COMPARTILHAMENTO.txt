Σ SIGMA RADAR Fit — V5.4.0

NOVIDADES
- MEUS ALIMENTOS no topo de Alimentação, com editar/excluir.
- Modal de alimento com rolagem interna no desktop 100%.
- Jejum na entrevista inicial e Perfil > Dados e objetivo:
  * Não faço jejum
  * Jejum intermitente com janela alimentar
  * Até 2 dias de jejum completo por semana, não consecutivos
- Inteligência de jejum integrada a cardápio, treino, hidratação, sono/recuperação, AO VIVO e Σ Coach.
- Dia de jejum completo planejado não perde aderência de alimentação por ausência de refeições.
- Treinos/atividades automáticos não são colocados em dia de jejum completo; o Coach pode reorganizar a semana com contexto.
- Correção geral do ciclo da sugestão de refeição pulada no AO VIVO.
- Treino: botão COMPARTILHAR TREINO / PDF. Gera ficha semanal personalizada sem carga.
- Hoje: após concluir o dia, opção de gerar Story 9:16 com Σ Coach, Σ Score, treino, alimentação e hidratação.
- Imagens de atividades continuam fora desta versão.

INSTALAÇÃO
1. Execute supabase/update_v16.sql uma única vez.
2. Redeploy da Edge Function supabase/functions/coach/index.ts.
3. Suba os arquivos do pacote GitHub preservando as pastas.

OBSERVAÇÃO
A ficha PDF e o Story são a primeira versão visual para validação e refinamento nas próximas rodadas.
