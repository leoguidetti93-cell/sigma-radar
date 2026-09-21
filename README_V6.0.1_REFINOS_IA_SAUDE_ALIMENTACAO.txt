SIGMA RADAR FIT V6.0.1 — REFINOS IA, SAÚDE E ALIMENTAÇÃO

BASE
- Atualização incremental sobre a V6.0.0.
- Não cria tabelas novas e não exige SQL adicional.

1) RESTRIÇÕES ALIMENTARES POR CATEGORIA
- “Carne vermelha / bovina” agora bloqueia também cortes e preparações bovinas (patinho, picanha, alcatra, maminha, filé mignon, acém, coxão, lagarto, bife, carne moída bovina etc.).
- “Carne suína / porco” bloqueia também lombo, pernil, bisteca, bacon, panceta, torresmo, calabresa, presunto, salame, mortadela e preparações suínas.
- Quando uma proteína animal bloqueada sai de um plano onívoro, o gerador tenta substituí-la por proteína permitida coerente, priorizando frango e peixes.
- O executor do Σ Coach também impede inclusão de alimento que conflite com as preferências atuais.
- Ao carregar o dia atual, refeições ainda abertas são saneadas contra as restrições salvas; refeições concluídas/histórico não são reescritas.

2) REFEIÇÕES SEM REDUNDÂNCIA AUTOMÁTICA
- Geração/reorganização automática não deve colocar duas opções da família “iogurte” na mesma refeição (ex.: iogurte natural + iogurte de morango / YoPRO / Skyr).
- Se o Coach trocar/adicionar um iogurte, a opção anterior da mesma família é substituída em vez de duplicada.
- Alterações manuais conscientes do usuário continuam editáveis na tela.

3) Σ HEALTH RADAR — EVOLUÇÃO DE EXAMES
- Exames com mais de uma coleta ganham botão EVOLUÇÃO.
- Histórico visual com gráfico por data, variação e tendência (alta / queda / estabilidade).
- Cada coleta preserva e exibe sua própria referência.
- Resultados dentro da faixa, mas nos ~15% mais próximos do limite inferior/superior, são destacados como “DENTRO • PRÓXIMO AO LIMITE ...”.
- Isso é sinalização matemática e não diagnóstico.
- O Σ Coach recebeu a mesma regra e considera tendência + proximidade dos limites sem inventar referência universal.

4) FOTO DO PRATO — SEGUNDA ETAPA COM A BIBLIOTECA SIGMA
Novo fluxo:
FOTO → IA VISUAL → TOP 5 CANDIDATOS DA BIBLIOTECA → SEGUNDA DECISÃO VISUAL → ALIMENTO SIGMA → REVISÃO DO USUÁRIO.
- A primeira análise descreve o que realmente vê.
- O site encontra até 5 candidatos na biblioteca (1.412 alimentos/preparações).
- A Edge Function meal-photo recebe a mesma foto + candidatos e escolhe o candidato mais coerente, ou nenhum se a correspondência for ruim.
- Se a segunda etapa falhar, o sistema mantém o fluxo anterior como fallback.

5) CACHE
- foods.json, app.js e style.css atualizados para V6.0.1 para não depender de Ctrl+F5 em futuras cargas.

ARQUIVOS ALTERADOS
- index.html
- app.js
- style.css
- supabase/functions/coach/index.ts
- supabase/functions/meal-photo/index.ts
- README_V6.0.1_REFINOS_IA_SAUDE_ALIMENTACAO.txt

INSTALAÇÃO
1. Substitua os arquivos acima mantendo as pastas.
2. Republique a Edge Function: coach
3. Republique a Edge Function: meal-photo
4. Não execute SQL novo nesta versão.
5. Faça uma atualização forçada da página uma vez após o deploy (Ctrl+F5).

TESTES PRIORITÁRIOS
- Perfil: evitar “carne vermelha/bovina” + “carne suína” e salvar; confirmar que patinho e suínos somem e entram frango/peixe.
- Conferir lanches: apenas uma opção de iogurte por refeição gerada automaticamente.
- Saúde: cadastrar duas ou mais coletas do mesmo marcador e abrir EVOLUÇÃO.
- Foto: testar prato conhecido e observar “refinado com biblioteca Sigma” na revisão.
