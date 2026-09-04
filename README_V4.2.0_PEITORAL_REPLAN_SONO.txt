Σ SIGMA RADAR Fit — V4.2.0
PACOTÃO: REPLANEJAMENTO + SONO + TUTORIAIS DE PEITORAL

BASE
- V4.1.0 já instalada/testada.
- Não há nova migration SQL nesta versão. update_v9.sql continua sendo a migration mais recente.
- A Edge Function nutrition-label NÃO mudou.

O QUE MUDOU

1) HOME DESKTOP
- 5 cards na mesma linha em telas de PC: Treino | Alimentação | Hidratação | Passos | Sono.
- No telefone, os cards permanecem em uma coluna.

2) PERFIL -> REPLANEJAMENTO INTELIGENTE
- Qualquer alteração relevante do Perfil passa a disparar análise de impacto automaticamente.
- O fluxo da tela Perfil chama o mesmo Σ Coach da conversa, sem exigir que o usuário faça um segundo pedido no chat.
- A proposta mostra novos alvos e só é aplicada após confirmação.
- Ao aplicar, recalcula metas, reconstrói próximos planos e preserva histórico concluído.
- O Σ Coach recebe contexto before/after do Perfil.
- Há fallback local caso a IA esteja temporariamente indisponível.

3) ESTRATÉGIA DE EMAGRECIMENTO AGRESSIVA
- Objetivos como "emagrecer rapidamente", "perder gordura rápido" e "déficit calórico agressivo" passam a ser reconhecidos.
- Não existe frase = kcal fixa.
- A IA considera o perfil completo.
- Como referência de estratégia agressiva, o motor local pode usar aproximadamente 1,6 g/kg proteína, 1,0 g/kg carbo e 0,8 g/kg gordura, respeitando pisos do sistema.
- Exemplo matemático de 90 kg: aproximadamente P144 / C90 / G72, perto de 1.600 kcal.

4) SONO NO CONTEXTO GERAL
- Sono habitual do Perfil continua separado da meta inteligente.
- sleep_logs entram no contexto dos Radares semanal e mensal.
- Radar recebe média de sono, média da meta e aderência do sono quando houver registros.
- Comparações entre semanas podem usar o sono salvo no contexto do Radar anterior.
- Radar mensal parcial passa a citar sono no resumo quando houver dado.
- Fallback local do Radar também considera sono.
- Reset de "Dias e rotina" agora também limpa sleep_logs do período selecionado.
- Ausência de sono continua sendo desconhecido, nunca 0h.

5) TREINO
- Removido da tela o botão redundante GERENCIAR ATIVIDADES DA ROTINA.
- Os dados de atividades do Perfil e sua utilização pelo Smart Plan/Coach continuam intactos.
- Mantido + ADICIONAR EXERCÍCIO / ATIVIDADE e todos os filtros validados.

6) LIMPEZA DA BIBLIOTECA DE PEITORAL
Removidos das opções e do catálogo usado pelo Smart Plan/Coach:
- Crossover baixo para cima
- Crossover alto para baixo (equivalente ao cima para baixo)
- Crucifixo inclinado
- Chest press convergente

7) TUTORIAIS VISUAIS — PEITORAL
O botão ? agora abre arte real inicial/final + orientação curta do Σ Coach para 11 exercícios:
- Supino reto
- Supino inclinado
- Supino declinado
- Peck Deck
- Pullover com halter
- Supino máquina
- Crucifixo
- Flexão de braço
- Crossover
- Supino reto com halteres
- Supino inclinado com halteres

As 11 artes aprovadas foram otimizadas para WebP para carregar rápido no site e ficam em assets/exercises/.
Os demais grupos musculares continuam com o placeholder no ? até receberem suas artes.

8) INCLUIR ALIMENTO NO CELULAR
- Modal agora respeita a altura útil da tela.
- Rolagem interna em telas pequenas.
- Botão SALVAR MEU ALIMENTO continua acessível.
- Pequena dica para fotografar a tabela reta/nítida.
- Motor da câmera/IA não foi alterado.

9) RADARES
- Cards curtos continuam como estavam.
- Texto maior continua no DETALHAR.
- A novidade é o sono entrar no contexto/análise, não aumentar os cards.

INSTALAÇÃO
1. Substitua os arquivos do site no GitHub pelos deste pacote.
2. No Supabase, abra Edge Functions > coach.
3. Substitua o conteúdo pelo arquivo:
   supabase/functions/coach/index.ts
   (há uma cópia fácil na raiz: coach_index_V4.2.0.ts)
4. Deploy da função coach.
5. NÃO precisa rodar SQL novo.
6. NÃO precisa mexer na função nutrition-label.

TESTES PRINCIPAIS
- PC: confirmar 5 cards da Home em uma linha.
- Celular: confirmar Home em uma coluna e modal Incluir alimento sem corte.
- Perfil: mudar objetivo/peso-alvo/passos e confirmar que aparece proposta antes->depois e que, após aplicar, kcal/macros realmente mudam quando o novo objetivo justificar.
- Perfil de teste ~90 kg + "emagrecer rapidamente": o sistema não deve ficar preso automaticamente em 2.050 kcal; a proposta deve refletir estratégia mais agressiva quando coerente.
- Sono: fechar Radar com registros de sono e confirmar que a análise menciona recuperação/sono quando relevante.
- Treino > Peitoral: abrir ? nos 11 exercícios e conferir a arte correspondente.
