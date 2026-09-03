Σ SIGMA RADAR Fit V2.2.0 — PLANEJAMENTO INTELIGENTE

PRINCIPAIS MUDANÇAS
- Remove o treino inicial estático universal.
- Gera rotina semanal conforme frequência de musculação:
  2 dias: Full Body A/B
  3 dias: Full Body A/B/C
  4 dias: Upper/Lower A/B
  5 dias: Push/Pull/Legs + Upper/Lower
  6 dias: Push/Pull/Legs 2x
- Ajusta volume inicial por experiência e tempo disponível.
- Adapta exercícios para academia vs. ambiente sem máquinas.
- Salva a semana em workout_plans e preserva planos personalizados do Coach.
- Detecta planos legados estáticos e os substitui pela nova semana.
- Yoga/Pilates/cardio/sauna passam a aparecer DENTRO da rotina de treino, sem bloco separado.
- Yoga/Pilates tendem a dias sem musculação; sauna/cardio são coordenados com a semana.
- Dias sem sessão mostram recuperação.
- Botão de ausência muda conforme academia ou outra atividade.
- Alimentação não inclui Whey automaticamente quando o perfil declarou não usar suplementos.
- Prompt do Σ Coach atualizado para seguir a mesma lógica de personalização.

ATUALIZAÇÃO
- Sem SQL novo: update_v6.sql continua sendo o mais recente.
- IMPORTANTE: redeploy da Edge Function supabase/functions/coach/index.ts recomendado/necessário para o Coach usar as novas regras.
- Subir todos os arquivos do site.

OBSERVAÇÃO
Este é um motor de planejamento de fitness do produto; não substitui avaliação clínica ou profissional presencial quando necessária.
