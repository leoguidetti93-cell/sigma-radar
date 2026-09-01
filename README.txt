SIGMA RADAR Fit v1.2 — Σ COACH + SUPABASE + IA READY

PRINCIPAIS ALTERAÇÕES
- Entrevista: uma pergunta por vez, sem rolagem de conversa.
- Σ Coach: biblioteca visual separada em PNG e aplicada por contexto.
- Concluir Meu Dia: sempre visível, mesmo com treino/refeições/água pendentes.
- Conclusão do dia salva o resultado real e abre automaticamente o próximo dia.
- Seletor de data para preencher dias anteriores e depois seguir em sequência.
- Alimentação: 440 alimentos (55 por categoria) + pesquisa + macros + porções.
- + Incluir alimento: cadastra alimento personalizado e salva no Supabase por usuário.
- Criar refeição: nome, horário, alimentos e macros.
- Score mede aderência ao plano, não simplesmente ingestão baixa.
- Σ Coach: preparado para IA real via Supabase Edge Function `coach`.
- IA recebe perfil, plano, dia, refeições, treino e histórico; pode sugerir ações que o usuário confirma.
- Ações já preparadas: ajustar calorias, hidratação, refeição/compensação e registrar peso.
- Banco: nova migration `supabase/update_v2.sql`.

SUPABASE
O config.js já contém o Project URL e a Publishable Key configurados anteriormente.
Depois de subir no GitHub, execute `supabase/update_v2.sql` e configure a Edge Function conforme `docs/CONFIGURACAO_V12.md`.

IMPORTANTE
A OPENAI_API_KEY fica SOMENTE como secret da Edge Function. Nunca no frontend/GitHub.
