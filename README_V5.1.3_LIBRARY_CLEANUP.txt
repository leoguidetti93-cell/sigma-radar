SIGMA RADAR FIT V5.1.3 — LIBRARY CLEANUP

Base: V5.1.2 UX Refinement.

Alterações:
- Bíceps/antebraço: remove 7 exercícios redundantes e adiciona Rosca 21.
- Tríceps: remove Tríceps testa na polia e Tríceps francês unilateral.
- Ombros: remove Crucifixo inverso máquina, Elevação lateral máquina e Desenvolvimento Arnold.
- Pernas: remove Agachamento búlgaro (todas ocorrências), Panturrilha no leg press e duplicidades/variações redundantes:
  Agachamento hack duplicado, Leg press horizontal, Cadeira flexora duplicada,
  Stiff com halteres e Elevação pélvica máquina.
- Mantidos como formas unificadas: Agachamento Hack, Leg press, Mesa/cadeira flexora,
  Stiff / RDL e Elevação pélvica / Hip thrust.
- Fallbacks automáticos que apontavam para Agachamento búlgaro foram corrigidos.
- Peitoral, Costas e Atividades não foram alterados.
- Histórico existente não é apagado.
- Sem SQL novo e sem redeploy de Edge Function.

Biblioteca final dos grupos alterados:
Bíceps + antebraço: 12
Tríceps: 10
Ombros: 8
Pernas: 13

Rosca 21 fica sem tutorial nesta etapa; imagem especial de 3 fases será tratada na próxima fase de imagens.
