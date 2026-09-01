SIGMA RADAR FIT V1.3.1

Correção:
- Editar Perfil agora usa UPDATE seguro para o perfil existente.
- Registrar evolução salva peso, cintura, gordura e passos com erro visível.
- Atualização de peso pelo Coach também usa UPDATE seguro.
- Suporta vírgula ou ponto nos valores numéricos.
- update_v3_1.sql garante as colunas e força atualização do cache do PostgREST.

Instalação:
1. Subir os arquivos do pacote no GitHub.
2. Supabase SQL Editor: executar supabase/update_v3_1.sql uma vez.
3. A Edge Function coach não mudou nesta correção; não é necessário redeploy dela.
