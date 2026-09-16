SIGMA RADAR FIT V5.8.0 — REFINO DA IA DA CÂMERA + EXPANSÃO DA BIBLIOTECA

O QUE FOI AJUSTADO
1) IA da foto do prato refinada:
- análise guiada em 2 etapas (leitura visual → tradução para alimento brasileiro);
- redução de falsos positivos absurdos (ex.: fruta em prato salgado);
- suporte a item composto (ex.: frango refogado com tomate);
- orientação para não transformar temperos em porções grandes independentes;
- candidate_names / needs_confirmation / visual_description para revisão mais segura.

2) Front-end da revisão da foto:
- melhor casamento com a biblioteca Sigma usando aliases;
- revisão mostra confiança, possíveis alternativas e itens para confirmar.

3) Biblioteca Sigma expandida:
- alimentos preparados e nomes mais comuns para ajudar o match da câmera;
- aliases adicionados para variações como frango em cubos, arroz integral vermelho, cabotiá, purês etc.
- biblioteca total passou de 729 para 779 itens.

ARQUIVOS ALTERADOS
- app.js
- assets/foods.json
- supabase/functions/meal-photo/index.ts

IMPORTANTE
- Não há migration SQL nesta versão.
- É necessário PUBLICAR novamente a Edge Function meal-photo.
- Depois de subir no GitHub/host, faça Ctrl+F5 para limpar cache.
