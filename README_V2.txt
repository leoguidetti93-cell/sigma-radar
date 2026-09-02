Σ SIGMA RADAR Fit — V2.0.0
Performance Intelligence

BASE
- Consolidada a partir da V1.4.3.
- Mantém alimentação corrigida, imagens, mobile, Σ Coach flutuante, bebidas, Radar e Score.

CORREÇÃO CENTRAL DA V2
- Corrige respostas do Σ Coach que apareciam como JSON bruto na conversa.
- Frontend agora interpreta/desembrulha respostas estruturadas mesmo quando chegam serializadas como texto.
- Edge Function ganhou parsing robusto e evita devolver JSON inteiro dentro de `message`.
- Propostas complexas voltam ao fluxo correto:
  Coach responde -> proposta formatada -> usuário confirma -> executor altera -> Supabase salva -> interface recalcula -> Coach confirma sucesso.
- Executores da V1.4.3 foram preservados (alimentação, refeições, treino, água/bebidas, metas, peso e passos).

ATUALIZAÇÃO PARA QUEM JÁ ESTÁ NA V1.4.3
1. NÃO rode SQL novamente. O update_v5.sql já é suficiente.
2. Atualize/deploy novamente a Edge Function `coach` usando:
   supabase/functions/coach/index.ts
3. Suba os arquivos do site no GitHub Pages normalmente.
4. Faça um recarregamento completo no navegador/celular. A V2 usa cache-busting v=2.0.0.

TESTE RECOMENDADO
- Peça ao Coach uma alteração de refeição, por exemplo:
  "reduza a banana do lanche da tarde e acrescente aveia"
- A resposta deve aparecer como conversa normal.
- Deve abrir uma proposta de confirmação.
- Após confirmar, a refeição real deve mudar e os macros devem ser recalculados.

IMPORTANTE
A confirmação de sucesso só ocorre depois da execução/salvamento da ação correspondente.
