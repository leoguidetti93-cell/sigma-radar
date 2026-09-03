Σ SIGMA RADAR Fit V4.0.0 — PACOTÃO INTERATIVO

Principais mudanças:
- Σ Coach: substituição permanente de alimento ("definitivamente/daqui pra frente") com regra persistente.
- Coach usa Radars semanais recentes como memória ativa no dia a dia.
- Plano alimentar varia por data mantendo as metas nutricionais e respeita regras permanentes.
- Biblioteca de alimentos ampliada de 440 para 490 itens curados nesta etapa (sem inflar com duplicatas artificiais). A estrutura aceita expansão contínua.
- Biblioteca de exercícios ampliada; mais variações de peito, costas, ombros, braços e pernas.
- Atividades da rotina podem ser incluídas manualmente no treino do dia.
- Radar semanal: cards compactos + DETALHAR.
- Hoje: passos registrados diretamente no card, com mini roda percentual.
- Perfil: objetivo, peso-alvo, meta de passos, sono, medicamentos, suplementos, dias, tempo, equipamentos e preferências alimentares editáveis.
- Mudança estrutural de perfil gera proposta de replanejamento preservando histórico.
- Radar mensal: 8 cards (4+4), passos médios/dia, hidratação e além da hidratação em média diária.
- Radar mensal distingue leitura PARCIAL de FECHADA.
- Card verde do Σ Coach no rodapé do Radar parcial com ações clicáveis para melhorar o restante do mês.
- Cards mensais com DETALHAR.

INSTALAÇÃO OBRIGATÓRIA:
1. Execute supabase/update_v8.sql UMA VEZ.
2. Redeploy da Edge Function coach usando supabase/functions/coach/index.ts desta versão.
3. Publique os arquivos do site.
4. Faça hard refresh/limpe cache se necessário.

IMPORTANTE:
- update_v8 não apaga histórico.
- weekly_reviews/monthly_reviews existentes são preservados.
- O banco continua tratando dados ausentes como desconhecidos, nunca zero.
- Valores nutricionais da biblioteca são aproximados/protótipo; alimentos customizados continuam disponíveis.
