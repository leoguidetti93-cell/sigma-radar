# Σ SIGMA RADAR Fit — V2.0.0

Versão consolidada para uso, baseada na V1.4.3.

## Correção do Σ Coach

A V2 corrige o caso em que uma resposta estruturada da Edge Function era exibida como JSON bruto no chat. A proteção foi aplicada em duas camadas:

- **Frontend:** normaliza respostas que chegam como objeto, JSON em string ou JSON aninhado em `message`/`proposal`.
- **Edge Function:** faz extração e parsing robustos antes de devolver a resposta ao navegador e desembrulha JSON serializado dentro de `message`.

O fluxo esperado volta a ser: mensagem → análise → proposta → confirmação → execução real → persistência → atualização visual.

## Banco

Nenhuma migration adicional é necessária para atualizar da V1.4.3 para a V2. O `update_v5.sql` permanece a migration mais recente.
