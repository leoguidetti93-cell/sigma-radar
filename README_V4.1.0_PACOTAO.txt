Σ SIGMA RADAR Fit V4.1.0 — PACOTÃO SONO + TREINO UNIFICADO + FOTO IA

BASE: V4.0.3.

ALTERAÇÕES
1. HOME / HOJE
- 5 cards: Treino, Alimentação, Hidratação, Passos e Sono.
- Layout responsivo para PC e celular.
- Sono diário em horas, com mini-ring de aderência.
- Ausência de sono = desconhecido, não zero.

2. SONO INTELIGENTE
- Sono médio informado no perfil continua sendo estado atual.
- Plano calcula uma meta inteligente separada (adultos, rotina, treino/atividades).
- Sono entra no Σ Score quando existe registro.
- Coach recebe histórico de sono e deve considerar recuperação.
- Nova tabela sleep_logs.

3. TREINO / ATIVIDADES
- Removido o botão separado “Adicionar atividade ao treino de hoje”.
- “Adicionar exercício / atividade” reúne musculação e atividades.
- Filtros: Todos, Peitoral, Costas, Bíceps, Tríceps, Ombros, Pernas, Atividades.
- Atividades continuam podendo ser definidas no onboarding/rotina e distribuídas automaticamente.
- Parâmetros dinâmicos: musculação (séries/reps/descanso/carga); cardio (tempo/distância); sauna (sessões/tempo); aulas/outros (duração/observações).

4. “?” NOS EXERCÍCIOS
- Cards de musculação já possuem “?”.
- Modal/tutorial já está preparado.
- Nesta versão NÃO há imagens de execução ainda. Elas serão produzidas/aprovadas por grupo muscular depois.

5. CADASTRO DE ALIMENTO POR FOTO
- “Incluir alimento” permite Manual ou Foto da tabela.
- No celular, Foto usa câmera traseira quando suportado.
- Nova Edge Function nutrition-label lê porção, kcal, proteína, carboidratos e gordura.
- IA apenas preenche; usuário confere e salva.
- OPENAI_API_KEY continua somente no Supabase.

6. REPLANEJAMENTO DE PERFIL
- Mudança estrutural recalcula metas nutricionais e planos futuros, em vez de apenas salvar o perfil.
- Histórico anterior é preservado.

INSTALAÇÃO
A) GitHub/site: subir todos os arquivos do pacote.
B) Supabase SQL Editor: executar supabase/update_v9.sql UMA VEZ.
C) Supabase Edge Functions:
   - manter/deployar coach usando supabase/functions/coach/index.ts desta versão;
   - criar/deployar a nova função nutrition-label com supabase/functions/nutrition-label/index.ts.
D) A secret OPENAI_API_KEY que já existe para o Coach pode ser reutilizada pela nutrition-label.

TESTAR
- PC e celular.
- Registrar sono e conferir %/Score.
- Filtros do catálogo.
- Adicionar Esteira/Sauna pelo mesmo botão de exercícios.
- Clicar “?” em exercício de musculação.
- Fotografar uma tabela nutricional e CONFERIR os campos antes de salvar.
- Alterar objetivo/meta no Perfil e confirmar o replanejamento.
