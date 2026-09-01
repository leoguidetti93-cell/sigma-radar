# Σ SIGMA RADAR Fit V1.3

## Atualização do banco
1. Supabase > SQL Editor.
2. Execute `supabase/update_v3.sql` uma única vez.
3. Mantenha a Edge Function `coach` existente e substitua o código pelo novo `supabase/functions/coach/index.ts`, depois Deploy updates.
4. O secret `OPENAI_API_KEY` já configurado no projeto deve permanecer.

## O que entrou
- Perfil progressivo/opcional + sair da conta.
- Histórico de peso, cintura, gordura corporal e passos.
- Meta de passos na entrevista (opcional).
- Registro de cargas por exercício.
- Radar Mensal tolerante a dados ausentes.
- Editor de refeições: horário, quantidade, adicionar/remover/substituir alimento e excluir refeição.
- Totais diários recalculados a partir dos alimentos.
- Executor do Σ Coach usa operações estruturadas para refeições; frases livres não viram alimentos.

## Regra de dados
Campo não preenchido = informação indisponível, nunca zero. O sistema continua funcionando com os dados disponíveis.
