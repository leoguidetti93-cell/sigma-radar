Σ SIGMA RADAR FIT V6.0.0 — SAÚDE + IA + BIBLIOTECA AMPLIADA

GRANDE ATUALIZAÇÃO V6

1) NOVO MÓDULO SAÚDE / Σ HEALTH RADAR
- Nova aba SAÚDE no menu principal e mobile.
- Registros estruturados de:
  • exames laboratoriais;
  • medicações;
  • suplementos;
  • dores e sintomas;
  • terapias / tratamentos;
  • cirurgias e procedimentos.
- Linha do tempo de saúde.
- Σ HEALTH RADAR com resumo de contexto ativo.
- Catálogo inicial com 132 exames/marcadores pesquisáveis.
- Resultados podem ser numéricos ou textuais.
- Referências são informadas pelo próprio usuário conforme o laboratório; o Sigma não inventa faixa universal.
- RLS: as tabelas de Saúde ficam privadas por usuário no Supabase.

2) INTEGRAÇÃO COM O Σ COACH
- O Coach recebe exames recentes, medicações e suplementos ativos, dores/sintomas, terapias e procedimentos como contexto.
- Dados estruturados de Saúde têm prioridade sobre campos antigos em texto livre quando houver conflito.
- O Coach pode relacionar o contexto de saúde com treino, alimentação e recuperação, porém NÃO diagnostica e NÃO altera prescrição/dose de medicamento.
- Dor/sintoma ativo leva o Coach a uma abordagem mais conservadora para treino.
- Tendências de exames podem ser consideradas respeitando datas e a referência cadastrada do laboratório.
- Novo atalho “Saúde e exames” no painel do Coach.

3) BIBLIOTECA DE ALIMENTOS V6
- Biblioteca total: 1.412 registros.
- V5.8.3 tinha 955 registros; a V6 adiciona 457 alimentos/preparações e aliases de busca.
- Ampliação forte de preparações do dia a dia: grelhados, cozidos, refogados, assados, fritos, air fryer, acebolados, molhos, ensopados, purês, arroz/feijão, massas, cafés, lanches, café da manhã, carnes, frango, pescados, legumes etc.
- Itens TACO/UNICAMP exatos já incorporados anteriormente foram preservados com origem identificada.
- Novas preparações V6 sem composição laboratorial direta ficam marcadas internamente como aproximadas/estimadas e devem ceder ao rótulo/receita específica quando disponível.
- A TBCA foi usada como referência de cobertura e nomenclatura para mapear lacunas; seus dados não foram copiados em massa para o projeto.

4) BUSCA DE ALIMENTOS
- Busca manual e edição de refeições agora consideram nome + aliases.
- Exemplos: “expresso” encontra espresso; “aipim/macaxeira” ajuda a localizar mandioca; variações de cabotiá, frango refogado e arroz vermelho têm aliases.

ARQUIVOS ALTERADOS / NOVOS
- index.html
- style.css
- app.js
- assets/foods.json
- assets/exam_catalog.json [NOVO]
- supabase/update_v17.sql [NOVO]
- supabase/schema.sql
- supabase/functions/coach/index.ts
- README_V6.0.0_SAUDE_IA_BIBLIOTECA.txt

COMO ATUALIZAR UMA INSTALAÇÃO EXISTENTE
1. Suba os arquivos do pacote GITHUB UPDATE mantendo as pastas.
2. No Supabase SQL Editor, execute UMA VEZ: supabase/update_v17.sql
3. Republique a Edge Function: supabase/functions/coach/index.ts
4. Faça Ctrl+F5 no navegador.

IMPORTANTE
- NÃO execute schema.sql sobre o banco existente como atualização; use somente update_v17.sql. O schema.sql foi atualizado apenas para instalações novas.
- A Edge Function meal-photo não mudou nesta V6.
- O primeiro V6 registra exames manualmente. Upload/anexo do PDF/foto original do exame não está incluído nesta versão inicial.
- O módulo Saúde serve como contexto fitness e organização pessoal; não substitui avaliação profissional, diagnóstico ou prescrição.
