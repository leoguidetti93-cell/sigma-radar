Σ SIGMA RADAR Fit — V5.0.0
COACH AO VIVO + COSTAS + HIDRATAÇÃO HORÁRIA + SONO RADAR + RECALIBRAÇÃO + MOBILE

BASE
- Construído diretamente sobre a V4.2.0 já validada.
- Mantém Peitoral, câmera IA, plano/Score, Profile replan, histórico, atividades e demais comportamentos validados.

1) COSTAS — BIBLIOTECA FINAL COM 9 EXERCÍCIOS
Ficam exatamente:
- Barra fixa
- Cavalinho
- Face pull
- Pull down
- Pulley / puxada alta
- Puxada neutra
- Remada baixa
- Remada curvada
- Serrote

Removidos da biblioteca de Costas:
- Remada cavalinho
- Remada baixa triangulo
- Puxada unilateral (não faz parte dos 9 finais definidos)
- Pulldown braços estendidos

Face Pull foi movido de Ombros para Costas.
As 9 artes anexadas/aprovadas foram otimizadas em WebP e mapeadas individualmente pelo nome normalizado do exercício.
O texto de ORIENTAÇÃO DO Σ COACH continua em HTML abaixo da arte, como no Peitoral.

2) HIDRATAÇÃO COM HORÁRIO
- Cada nova bebida salva consumed_at automaticamente.
- Registros antigos recebem created_at como referência quando possível.
- Lista da hidratação mostra bebida + volume + horário.
- Toast confirma também o horário.
- O Coach recebe os timestamps e pode interpretar distribuição ao longo do dia.

3) Σ COACH AO VIVO — TELA HOJE
- Novo card contextual na Home/Hoje.
- Pode mostrar até 3 sugestões simultâneas, priorizadas.
- Hidratação abaixo do ritmo: pode oferecer +250/+300/etc. ml diretamente.
- Concentração de hidratação à noite: sugere fracionar, sem mandar compensar tudo de uma vez.
- Sono baixo + treino programado: orientação de recuperação/execução.
- Refeição planejada atrasada e ainda não marcada: lembrete cuidadoso, sem afirmar que a pessoa não comeu.
- PASSOS NÃO geram dica ao vivo enquanto forem manuais.
- “Depois” adia a sugestão e persiste no Supabase.
- Dados ausentes continuam desconhecidos, nunca zero.

4) SONO NOS RADARES
- Radar semanal ganha card SONO MÉDIO: realizado / meta inteligente.
- Radar mensal ganha card SONO MÉDIO: realizado / meta inteligente.
- O contexto interpretativo de sono já existente na V4.2 foi preservado.

5) GANHO DE MASSA RECALIBRADO
- Fallback local: manutenção estimada + superávit controlado de ~7,5% como ponto inicial.
- Proteína ~1,8 g/kg e gordura ~0,8 g/kg no fallback; carboidrato completa o restante.
- Peso-alvo NÃO é tratado como peso atual.
- Edge Coach orientado a usar superávit contextual de ~5–10%, evolução, desempenho, aderência e recuperação.
- Evita inflar automaticamente calorias/carboidratos sem justificativa.

6) MOBILE — MODAIS/CARDS ABERTOS
- Regra global para modais no celular, não apenas Incluir alimento.
- Usa 100dvh + safe-area do iPhone.
- Centralização quando couber.
- Scroll interno quando o conteúdo for maior que a tela.
- Ações/rodapés permanecem alcançáveis.
- Abrange modal genérico, Incluir alimento, Concluir dia, Editar perfil, confirmações e demais cards modais que usam as classes-base.
- Desktop preservado.

SQL NOVO
- supabase/update_v10.sql
Cria/adiciona:
- beverage_logs.consumed_at
- live_coach_suggestions + RLS

EDGE FUNCTION
- supabase/functions/coach/index.ts
- cópia na raiz: coach_index_V5.0.0.ts
- nutrition-label NÃO foi alterada.

ORDEM DE INSTALAÇÃO
1. Supabase > SQL Editor: execute supabase/update_v10.sql UMA VEZ.
2. Supabase > Edge Functions > coach: substitua pelo supabase/functions/coach/index.ts e faça Deploy.
3. GitHub: substitua os arquivos do site pelos arquivos deste pacote.
4. Não mexa na Edge Function nutrition-label.

TESTES RECOMENDADOS
- Treino > Costas: confirmar os 9 nomes e abrir ? em todos; conferir imagem e orientação correspondente.
- Confirmar que não aparecem Remada cavalinho, Remada baixa triangulo, Puxada unilateral e Pulldown braços estendidos.
- Hidratação: adicionar água/chá e conferir horário na lista.
- Hoje: com hidratação abaixo do ritmo, conferir card Σ COACH • AO VIVO e testar + água / Depois.
- Radar semanal/mensal: conferir SONO MÉDIO quando houver registros e — quando não houver.
- Perfil: testar objetivo ganhar massa e conferir proposta mais controlada.
- iPhone: abrir Incluir alimento, Concluir dia, Editar perfil e outros modais longos; conferir centralização, rolagem e botões acessíveis.
