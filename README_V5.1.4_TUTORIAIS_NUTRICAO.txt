Σ SIGMA RADAR Fit V5.1.4 — Tutoriais Bíceps/Tríceps + Inteligência Nutricional

BASE
- Construída sobre V5.1.3 enviada/validada pelo usuário.

INSTALAÇÃO
1. Execute supabase/update_v13.sql uma única vez.
2. Redeploy da Edge Function coach usando supabase/functions/coach/index.ts.
3. Suba os arquivos do pacote GITHUB_UPDATE para o repositório, preservando as pastas.
4. Não altere a Edge nutrition-label.

ALTERAÇÕES
- 22 tutoriais novos: Bíceps/Antebraço + Tríceps.
- Rosca testa renomeada para Tríceps testa.
- Rosca 21 recebe orientação detalhada das 3 faixas/21 repetições.
- Sugestão AO VIVO que originou ajuste é marcada como resolvida após aplicação bem-sucedida.
- AO VIVO observa múltiplas edições manuais de refeições e pode sugerir reequilíbrio das restantes.
- Alimentos personalizados agora podem ser marcados como Porção fixa / embalagem inteira.
- Coach, gerador e reorganizador preservam porções fixas; ajuste recai preferencialmente sobre alimentos fracionáveis.
- Compatibilidade: YoPRO, Pro Force e Hydro Protein já cadastrados em ml são marcados como fixos pela migration.

VALIDAÇÃO SUGERIDA
- Pular uma refeição -> aceitar redistribuição -> confirmar que a mesma dica some.
- Cadastrar produto 250 ml como porção fixa -> pedir reorganização -> confirmar que permanece 250 ml (ou múltiplo inteiro), nunca 80 ml.
- Alterar manualmente 2+ refeições -> conferir sugestão de reequilíbrio no AO VIVO.
- Abrir ? de Bíceps/Antebraço e Tríceps e conferir imagem + orientação.
