Σ SIGMA RADAR Fit — V2.1.0

BASE
Esta versão parte da V2.0.0 validada e mantém alimentação, hidratação/bebidas, imagens, Σ Score, radares e executores já existentes.

PRINCIPAIS NOVIDADES
1. Entrevista inicial: nova pergunta “Além da musculação, quais atividades você pratica ou gostaria de incluir na sua rotina?”
2. Atividades da rotina: caminhada, esteira, corrida, bicicleta, elíptico, natação, futebol, funcional, CrossFit, luta, yoga/pilates, sauna e atividades livres.
3. Tela Treino: seção “Além da musculação” com gerenciamento de atividade, frequência, duração e dias preferidos.
4. Atividades podem fazer parte do plano diário e ser concluídas como os exercícios.
5. Σ Score/Radar: atividades planejadas passam a participar da aderência de treino; Radar semanal e mensal conseguem registrar atividades extras concluídas.
6. Memória do Σ Coach: nova tabela de mensagens permite que a IA leia a conversa recente e evite repetir perguntas já respondidas.
7. Planejamento multi-dia: o Coach pode propor e, após aprovação, gravar treinos/atividades em vários dias de uma única vez.
8. Nova ação update_other_activities: o Coach pode atualizar as atividades que o usuário pratica.
9. Nova ação reprogram_schedule: permite reprogramar uma semana ou conjunto de datas com sessões diferentes.
10. O Coach recebe planos próximos, atividades recentes e biblioteca de exercícios ao raciocinar.

ATUALIZAÇÃO OBRIGATÓRIA
1. Supabase > SQL Editor: execute `supabase/update_v6.sql` UMA VEZ.
2. Supabase > Edge Functions > coach: substitua pelo arquivo `supabase/functions/coach/index.ts` desta V2.1.0 e faça Deploy.
3. Não altere a OPENAI_API_KEY.
4. Depois suba os arquivos do site ao GitHub/hosting.
5. A versão usa cache-busting v=2.1.0.

PARA CONTAS EXISTENTES
Não é preciso refazer a entrevista. Vá em TREINO > “GERENCIAR ATIVIDADES” e cadastre caminhada, esteira, sauna etc.

TESTES RECOMENDADOS
A) Criar uma conta nova e confirmar a nova pergunta na entrevista.
B) Em conta existente, cadastrar Caminhada 3x/sem 30 min, Esteira 2x/sem 25 min e Sauna 2x/sem 15 min.
C) Conversar com o Coach em sequência:
   “Não fui à academia ontem e hoje não vou conseguir.”
   “Vou quinta, sexta e sábado.”
   “Academia completa, quero três treinos diferentes, incluindo pernas.”
   O Coach não deve voltar a perguntar quais são os dias ou o local; deve montar uma proposta multi-dia.
D) Testar:
   “Gostaria de reprogramar meu plano. Notei que não tenho caminhadas, esteira e sauna incluídas na minha rotina e são coisas que eu pratico.”
   O Coach pode atualizar as atividades e propor nova programação para aprovação.

OBSERVAÇÃO
Mudanças relevantes continuam exigindo aprovação do usuário antes de serem gravadas. Medicamentos permanecem somente como contexto; o Coach não altera tratamento ou dose.
