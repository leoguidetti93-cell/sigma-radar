Σ SIGMA RADAR Fit — V5.6.0

Atualizações:
- Radar semanal/mensal: modal de fechamento responsivo no mobile, com scroll interno e altura baseada na viewport.
- Σ Coach: retry automático da Edge Function, erro real/curto em vez do fallback antigo de “Edge não configurada”, e orientação reforçada para reequilíbrio após edições manuais de refeições.
- Corrigida referência interna da Edge para nutrition_rules.
- Histórico corporal: mostra somente dias com dados reais de Registrar evolução; linhas criadas apenas por passos não aparecem mais.
- Story: data deslocada discretamente para a esquerda.
- Biblioteca de alimentos ampliada com alimentos cotidianos (bacon, linguiças, embutidos, frango com/sem pele, mais queijos, cafés, pães, lanches, molhos, sobremesas etc.).
- Regras vegetariana/vegana atualizadas para novos alimentos de origem animal/carnes.

Instalação:
- Não há SQL novo.
- Substitua os arquivos do pacote GitHub preservando as pastas.
- Faça redeploy da Edge Function supabase/functions/coach/index.ts.
