SIGMA RADAR FIT — PACOTE DEFINITIVO (V1.3.2)

Inclui:
- Perfil e histórico corporal
- Passos e meta diária
- Progressão de cargas
- Editor completo de refeições com recálculo
- Radar Semanal e Radar Mensal
- Σ Coach via Supabase Edge Function
- Reset de registros por período, com seleção de escopo
- Assets do Σ Coach substituídos por fontes em alta resolução

ATUALIZAÇÃO A PARTIR DA V1.3.1:
1. Suba os arquivos no GitHub.
2. Não há nova migração SQL obrigatória.
3. Não é necessário alterar OPENAI_API_KEY.
4. A Edge Function coach é a mesma da V1.3.1 funcional; redeploy somente se o arquivo remoto estiver diferente.

RESETAR DIAS:
- Perfil > Resetar dias.
- Permite escolher período e tipos de dados.
- Nunca apaga conta, entrevista, metas, plano-base ou alimentos personalizados.
- Ao resetar rotina diária, os reviews semanais derivados são limpos para evitar leitura antiga.
