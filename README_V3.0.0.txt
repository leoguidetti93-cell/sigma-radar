Σ SIGMA RADAR Fit V3.0.0 — CICLO INTELIGENTE

1. VOLUME DE TREINO INTELIGENTE
- Sessões passam a variar aproximadamente de 4 a 8 exercícios conforme tempo disponível, experiência, frequência semanal e atividades exigentes do mesmo dia.
- Perfil de 60 min normalmente recebe pelo menos 6 exercícios quando coerente.
- V2.2 gerado automaticamente é migrado para as novas sessões V3; planos personalizados do Coach são preservados.

2. AUSÊNCIA COM MOTIVO
- SEM TEMPO / TÔ NA CORRERIA
- DESCANSO
- PREGUIÇA
- O motivo é salvo no activity_logs e no contexto do Coach/Radar.

3. FECHAMENTO SEMANAL
- Semana oficial: segunda a domingo.
- No domingo, após os 7 dias estarem concluídos, habilita ENCERRAR MINHA SEMANA.
- Animação com o Coach/prancheta.
- Consolida todos os dados disponíveis e salva weekly_reviews.
- Histórico de fechamentos permanece consultável.

4. FECHAMENTO MENSAL
- No primeiro acesso de um mês novo, detecta o mês anterior ainda não fechado e gera automaticamente o Radar Mensal.
- Salva em monthly_reviews.

5. Σ COACH
- Edge Function recebeu modo específico weekly/monthly para interpretar de forma integrada treino, alimentação, hidratação, bebidas, atividades, ausências/motivos, passos, peso, cargas, sono e aderência.

INSTALAÇÃO
1. Rode supabase/update_v7.sql UMA VEZ.
2. Faça redeploy da Edge Function coach com supabase/functions/coach/index.ts desta V3.
3. Suba os arquivos do site.
