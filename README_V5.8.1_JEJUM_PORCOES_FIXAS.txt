SIGMA RADAR FIT V5.8.1 — JEJUM INTERMITENTE + PORÇÕES FIXAS

CORREÇÕES DESTA VERSÃO

1) JEJUM INTERMITENTE
- O sistema não comprime mais todas as refeições antigas para dentro da janela alimentar.
- Ao ativar/mudar a janela, as refeições cujo horário-base ficou fora da janela são eliminadas do planejamento.
- As refeições que já cabem na janela são preservadas.
- Calorias e macros passam a ser redistribuídos entre as refeições restantes.
- Exemplo: plano de 6 refeições + janela 10:00–20:00 -> ficam 10:30, 13:00, 16:00 e 19:00; café da manhã e ceia são retirados.

2) EMBALAGENS / PORÇÕES FIXAS
- fixed_portion agora é preservado também quando refeições são salvas/carregadas do banco.
- O recalibrador não escala mais Hydro Protein, YoPRO, barrinhas ou qualquer item marcado como embalagem inteira para valores quebrados.
- Quantidades fixas só podem ser 1x, 2x, 3x... a porção-base cadastrada.
- O editor/manual builder também passa a respeitar múltiplos inteiros.

3) RECALIBRAÇÃO DE CALORIAS + MACROS
- A nova meta considera refeições já concluídas como bloqueadas.
- Recalibra somente refeições ainda abertas.
- Refeições marcadas como não realizadas não recebem redistribuição.
- Ajusta alimentos fracionáveis tentando aproximar simultaneamente calorias, proteína, carboidratos e gordura.
- Porções fixas têm prioridade de preservação mesmo que reste pequena diferença numérica.
- O Coach passa a informar também os totais aproximados do cardápio resultante.

4) Σ COACH
- Prompt reforçado para não comprimir 6 refeições dentro da janela de jejum.
- Prompt reforçado para tratar fixed_portion como restrição obrigatória, não como preferência.

ARQUIVOS ALTERADOS
- app.js
- index.html (cache app.js v5.8.1)
- supabase/functions/coach/index.ts
- README_V5.8.1_JEJUM_PORCOES_FIXAS.txt

IMPORTANTE
- Não há migration SQL nesta versão.
- Reimplante/publice a Edge Function coach após subir os arquivos.
- Depois da atualização, faça Ctrl+F5.
