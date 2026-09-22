Σ SIGMA RADAR FIT V6.1.0
PACOTE VISUAL + MOBILE REDESIGN + Σ COACH VIVO

OBJETIVO DESTA VERSÃO
Dar vida ao personagem e à interface sem alterar as regras de negócio que já estavam estáveis na V6.0.1.
A V6.1.0 é uma atualização de experiência: desktop mais moderno, mobile repensado e o Σ Coach visualmente presente no sistema.

1. Σ COACH VIVO
- O antigo botão largo "Falar com Σ Coach" foi substituído por um Coach flutuante compacto.
- O personagem muda de estado visual conforme o contexto: neutro, feliz, comemorando, atento, analisando, treino, alimentação, hidratação e resumo.
- Movimento natural leve por CSS: flutuação, respiração, halo e sombra dinâmica.
- Balões contextuais aparecem com dados reais do dia e somem automaticamente.
- As falas podem refletir Score, percentual do dia, proteína restante, hidratação, treino, Saúde e tela atualmente aberta.
- Ao tocar no personagem, abre o chat completo.
- Enquanto a IA está processando uma mensagem, o Coach muda para estado de análise/pensamento.

2. COACH AO VIVO / HOME
- Card de sugestões recebeu visual de conversa, personagem contextual e microanimações.
- A sugestão prioritária influencia o estado visual do Coach flutuante.
- Mantém a lógica existente: nenhuma alteração é aplicada sem confirmação.

3. CHAT DO Σ COACH
- Painel redesenhado com identidade do personagem, avatar contextual, cabeçalho premium e mensagens mais leves visualmente.
- Melhor hierarquia visual e experiência mobile em tela cheia.

4. MOBILE REDESENHADO
- Removido o menu horizontal/inferior corrido em telas pequenas.
- Novo botão circular Σ no canto superior esquerdo.
- Toque abre drawer/overlay com todas as áreas do sistema.
- Menu inclui acesso direto ao Coach.
- Mais espaço útil para o conteúdo do aplicativo.
- Ajustes em cards, títulos, Score, macros, Saúde, Perfil, hidratação, ações e formulários.
- Safe areas de iPhone consideradas.

5. DESKTOP / VISUAL GERAL
- Sidebar refinada, com hierarquia, indicadores e microinterações.
- Cards com sombras mais leves, bordas e profundidade modernas.
- Hover e feedback visual em cards acionáveis.
- Transições entre telas e abertura de modais mais suaves.
- Score, Home, progresso, energia, Saúde e Radares visualmente refinados.
- Personagens das telas ganham movimento idle sutil.

6. STORIES / COMPARTILHAMENTO
- Modal de Story ganhou preview vivo do Coach.
- Expressão e fala mudam conforme o Σ Score do dia.
- O arquivo compartilhado continua PNG 9:16 para manter compatibilidade ampla.
- Exportação de Story como vídeo/animação NÃO foi incluída nesta versão; o movimento desta etapa está no preview/interação do site.

ARQUIVOS ALTERADOS
- index.html
- app.js
- style.css
- README_V6.1.0_VISUAL_MOBILE_COACH_VIVO.txt

BANCO / SUPABASE
- Nenhuma migration SQL nova.
- Nenhuma Edge Function precisa ser republicada.
- Não execute schema.sql novamente.

ATUALIZAÇÃO
1. Substitua index.html, app.js e style.css pelos arquivos desta versão.
2. Faça Ctrl + F5 no desktop.
3. No mobile, feche/reabra o navegador/PWA se houver cache antigo.
4. Teste principalmente: menu mobile, Coach flutuante, balões, chat e navegação entre telas.

NOTA DE PERFORMANCE
As animações usam CSS e os assets do Coach já existentes. O sistema também respeita prefers-reduced-motion quando o dispositivo/usuário solicita menos movimento.
