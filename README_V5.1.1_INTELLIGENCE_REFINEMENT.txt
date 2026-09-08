Σ SIGMA RADAR Fit V5.1.1 — Intelligence Refinement

BASE: V5.1.0 validada.

INSTALAÇÃO
1) Execute supabase/update_v12.sql UMA VEZ.
2) Redeploy da Edge Function coach usando supabase/functions/coach/index.ts.
3) Suba os arquivos do projeto no GitHub Pages.
4) nutrition-label NÃO mudou.

PRINCIPAIS MUDANÇAS
- Home: remove card genérico; Coach AO VIVO assume destaque.
- Hidratação temporal: sem inferir padrão com 0/1 lançamento; respeita tempo desde o último volume; melhora confiança e evita mandar beber imediatamente.
- AO VIVO: ranking/diversidade e análise do impacto de refeição explicitamente não realizada.
- Exercícios: REALIZADO / NÃO FIZ / desconhecido; motivo opcional; alimenta Coach/Radar.
- Pós-treino editável após salvo.
- Coach: impacto semanal automático, atividade complementar + musculação, fadiga/recuperação e progressão nos dois sentidos.
- Perfil: bioimpedância opcional no Progresso.
- Novo Σ Coach • Análise: IMC visual, TMB/gasto diário estimados, gasto estimado do treino e explicação de como o plano alimentar foi calculado.
- Radares/Edge recebem instrução para usar feedback, skips, composição, cargas e hidratação temporal.
- Porções realistas continuam usando as proteções existentes do Sigma.

REGRA CENTRAL
Observar e interpretar pode ser automático. Alterar o plano continua exigindo confirmação do usuário.
