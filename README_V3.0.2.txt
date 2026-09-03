Σ SIGMA RADAR Fit V3.0.2 — HOTFIX NAVEGAÇÃO MOBILE
Corrige o menu inferior/mobile que exibia os botões mas não mudava de área.
Causa: a função go() existia, porém o binding onclick dos botões .nav havia sido perdido na integração da V3.
Correção: binding explícito dos botões .nav[data-v], usando a mesma função go() já usada pelos cards da Home.
Mantém todas as funcionalidades da V3.0.1.
Sem SQL novo. Sem necessidade de novo deploy da Edge Function.
