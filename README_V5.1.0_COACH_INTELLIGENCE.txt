Σ SIGMA RADAR Fit — V5.1.0 COACH INTELLIGENCE
Base: V5.0.0 validada pelo usuário.

INSTALAÇÃO
1) Supabase > SQL Editor: execute supabase/update_v11.sql UMA VEZ.
2) Supabase > Edge Functions > coach: substitua index.ts por supabase/functions/coach/index.ts e faça Deploy.
   nutrition-label NÃO mudou.
3) GitHub/site: substitua os arquivos do projeto pelos deste pacote.

PRINCIPAIS MUDANÇAS
- Coach entende intenção livre com mais robustez e tenta reparar automaticamente respostas fora do JSON esperado.
- Pedidos estruturados de treino/nutrição passam a usar contexto de semana, alimentos personalizados e histórico recente.
- Alimentos personalizados podem ser incorporados como preferência recorrente ao plano após confirmação.
- Coach observa padrões de refeições, ações, feedback pós-treino, sono e hidratação.
- AO VIVO detecta refeições puladas recorrentes e alimentos adicionados repetidamente (quando houver histórico suficiente).
- Hidratação AO VIVO considera total, horário, tamanho dos lançamentos, intervalo, ritmo e risco de compensação noturna.
- Refeições têm 3 estados: realizada / NÃO FIZ / desconhecida.
- Pós-treino: ao concluir todos os exercícios, card pergunta ÓTIMO / BOM / CANSADO / COM DOR / MUITO DIFÍCIL.
- Feedback fica persistido e entra no contexto longitudinal do Coach.
- Nenhuma alteração estrutural é aplicada sem confirmação do usuário.

TESTES DE ACEITAÇÃO RECOMENDADOS
A) "Coach, consegue adequar melhor meu cardápio? Tenho à disposição YoPRO, Pro Force, Hydro Protein... dá pra incluir em algumas refeições"
B) "Coach divide meu treino de hoje em peitoral, tríceps e ombros"
   Esperado: entender o pedido, avaliar impacto nos próximos treinos e propor reorganização coerente para confirmação.
C) Marcar uma refeição como NÃO FIZ; ela não deve continuar aparecendo como pendente no AO VIVO.
D) Concluir todos os exercícios; deve abrir o feedback pós-treino.
E) Registrar hidratação em pequenos volumes e horários diferentes; AO VIVO deve avaliar ritmo/distribuição, não apenas total.
