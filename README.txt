SIGMA RADAR Fit — SUPABASE READY

ESTA VERSÃO JÁ FOI PREPARADA PARA:
- Supabase Auth: cadastro, login, sessão e logout.
- Dados isolados por usuário com Row Level Security (RLS).
- Perfil e onboarding salvos no banco.
- Registros diários de treino, alimentação, hidratação e Σ Score.
- Histórico semanal.
- Ações executáveis do Σ Coach, como reduzir calorias, aumentar hidratação e registrar novo peso.
- Entrevista em uma pergunta por vez: aparece → responde → some → próxima.
- Número de refeições respeita a escolha da entrevista.
- Motor de calorias revisado: perda de gordura recebe déficit inicial e proteína alta; GLP-1 informado é usado apenas como contexto de apetite/tolerância e para evitar meta inicial excessiva, nunca para orientar dose.
- Biblioteca de 50+ alimentos com macros.
- Criar refeição com nome, horário, quantidades e totais.
- Biblioteca de imagens/poses do Σ Coach em assets/coach/.

PARA ATIVAR O SUPABASE (FAREMOS JUNTOS):
1. Criar o projeto.
2. SQL Editor → executar supabase/schema.sql.
3. Authentication → configurar confirmação de e-mail conforme desejado.
4. Copiar Project URL e a chave anon/publishable.
5. Colar em config.js.
6. Subir os arquivos no GitHub Pages.

SEGURANÇA:
Nunca use service_role no navegador. O frontend usa apenas anon/publishable key + RLS.

CNAME já está configurado para www.sigmaradar.com.br
