Σ SIGMA RADAR Fit — V5.7.0
ANÁLISE DE PRATO POR IA

NOVO
• Editar refeição > 📷 ANALISAR PRATO
• Câmera ou escolha de foto
• IA identifica alimentos visíveis e estima quantidades
• Cruzamento automático com a biblioteca do Sigma quando há correspondência confiável
• Kcal e macros recalculados pela biblioteca; IA funciona como fallback para itens não encontrados
• Confiança por item + observação geral
• Revisão de nome e quantidade antes de incluir
• Nenhuma foto altera a refeição sem confirmação do usuário
• Foto é reduzida no navegador antes do envio para diminuir peso/latência

SUPABASE
• Nova Edge Function: meal-photo
• Não há SQL novo
• Deploy necessário: supabase functions deploy meal-photo
• Usa a mesma OPENAI_API_KEY já configurada nas demais funções de IA

NÃO ALTERADO
• coach
• nutrition-label
• banco/tabelas/RLS
