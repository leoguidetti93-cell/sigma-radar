Σ SIGMA RADAR Fit — V5.2.0
Base: V5.1.4 FULL COMPACT enviada e validada pelo usuário.
IMPORTANTE: o app.js desta base foi preservado como base funcional; a biblioteca foi normalizada sem reconstruir a lista e sem reintroduzir itens removidos.

INSTALAÇÃO
1) Supabase SQL Editor: execute UMA VEZ supabase/update_v14.sql
2) Supabase Edge Functions: redeploy da função coach usando supabase/functions/coach/index.ts deste pacote
3) GitHub/site: substitua os arquivos do site pelos deste pacote
4) Não é necessário alterar a função nutrition-label.

ALTERAÇÕES
- Ombros: 7 tutoriais visuais adicionados: Desenvolvimento com barra, Desenvolvimento com halteres, Elevação frontal, Elevação lateral, Elevação unilateral na polia, Remada alta e Voador invertido.
- Elevação lateral na polia removida da biblioteca. Elevação unilateral na polia mantida.
- IMC: classificação OMS adulta com 6 faixas visuais; 25,0–29,9 = Sobrepeso; 30–34,9 = Obesidade I; 35–39,9 = II; >=40 = III.
- Estratégia energética: texto passa a refletir o déficit/superávit realmente calculado entre gasto estimado e meta, evitando chamar diferenças elevadas de “moderadas”.
- Perfil/onboarding: Estilo alimentar (Clássica/dia a dia, Completa/variada, Vegetariana, Vegana) e lista “Alimentos que não quero no meu plano”.
- Inteligência alimentar: preferências entram na geração do cardápio e no contexto do Coach. Vegetarianismo/veganismo bloqueiam grupos incompatíveis no plano automático; alimentos explicitamente evitados não entram no plano automático.
- Biblioteca alimentar expandida de 607 para 643 itens úteis, mantendo valores como aproximados no protótipo.
- Mantida a regra de porção fixa/embalagem da V5.1.4: itens fixos não devem ser quebrados em volumes impraticáveis em reorganizações automáticas.
- Atividades: agora participam do resumo TREINO/ATIVIDADES e fechamento do dia.
- Atividades: EDITAR, NÃO FIZ e botão ? adicionados.
- Atividades: estado explícito concluída / não fiz / desconhecida; migration v14 adiciona skipped e skip_reason.
- Coach/Radar recebem atividades não realizadas e seus motivos.
- Sauna classificada como RECUPERAÇÃO COMPLEMENTAR; não é tratada como musculação/cardio nem como prova de queima de gordura.
- O resumo usa exercícios + atividades do plano vigente do dia, importante quando o treino é reorganizado no mesmo dia.
- Botão ? de atividades já funciona; enquanto as imagens específicas de ATIVIDADES não forem produzidas, mostra “tutorial visual em preparação”.

NÃO REFEITO NESTA VERSÃO
- Correção de repetição da sugestão AO VIVO após reequilibrar: já vinha da V5.1.4.
- Detecção de alterações manuais do cardápio: já vinha da V5.1.4.
