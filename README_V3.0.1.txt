Σ SIGMA RADAR Fit V3.0.1 — HOTFIX LOGIN
Corrige regressão da V3.0.0 que removeu acidentalmente funções do bloco de evolução/perfil/Coach do app.js.
Sintoma principal: login falhava com "loadEvolutionData is not defined".
Também foram restauradas as demais funções do mesmo bloco para evitar erros posteriores em Perfil, Alimentação e Σ Coach.
Mantém todas as funcionalidades da V3.0.0.
Banco: update_v7.sql continua válido; não há SQL novo.
Edge Function: mantém a mesma da V3.0.0; não precisa novo deploy se ela já foi implantada.
