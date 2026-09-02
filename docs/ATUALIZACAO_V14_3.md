# Σ SIGMA RADAR Fit — V1.4.3

## O que mudou

### Σ Coach — executor real do plano
O Coach agora pode propor e, após aprovação, executar mudanças reais em:
- calorias e macros;
- meta de hidratação;
- peso e meta de passos;
- refeições: adicionar/remover/substituir alimento, mudar quantidade/horário/nome, criar/excluir/pular refeição;
- treino: adicionar/remover/substituir exercício, mudar séries/repetições/descanso/carga e ordem;
- mover o treino para outro dia;
- registrar bebidas;
- aplicar conjuntos de ações em uma única proposta.

A confirmação de sucesso só acontece após o executor produzir uma alteração real e o Supabase aceitar o salvamento.

### Correção do caso “Aveia”
A busca do executor não depende mais de igualdade literal. Por exemplo, “Aveia” consegue localizar “Aveia em flocos”. Se o alimento não for encontrado, a ação falha com mensagem de erro em vez de fingir que foi aplicada.

### Hidratação + bebidas
Conta diretamente para HIDRATAÇÃO DO DIA:
- Água
- Chá
- Suco natural

Fica separado em ALÉM DA HIDRATAÇÃO:
- Refrigerante zero
- Refrigerante comum
- Suco industrializado
- Cerveja
- Outra bebida alcoólica
- Outra bebida

Os registros detalhados alimentam os Radares semanal/mensal, o contexto do Coach e a qualidade comportamental usada no Σ Score.

## Instalação
1. Execute `supabase/update_v5.sql` no SQL Editor do Supabase.
2. Atualize/deploy a Edge Function `coach` usando `supabase/functions/coach/index.ts`.
3. Mantenha `OPENAI_API_KEY` configurada nos Secrets da função. Não coloque essa chave no frontend.
4. Depois publique os arquivos do site normalmente no GitHub Pages.

## Compatibilidade
- Preserva contas, perfil, alimentos personalizados, refeições, cargas e histórico existente.
- Registros antigos de água continuam em `daily_logs.water_l`.
- Ao começar a usar o registro detalhado de bebidas num dia antigo, o site cria uma linha de saldo anterior para não perder a hidratação já registrada naquele dia.
