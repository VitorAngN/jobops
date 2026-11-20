# Deploy gratuito e privado

Um serviço só no Render entrega a API e o site. O banco fica no Neon. Um workflow do GitHub Actions roda a busca de vagas todo dia.

| Peça | Serviço | Custo |
| --- | --- | --- |
| API + site | Render (Web Service, plano Free) | grátis; dorme após 15 min sem uso e acorda em ~1 min |
| Banco | Neon (Postgres, plano Free) | grátis; 0,5 GB |
| Busca diária | GitHub Actions (`busca-diaria.yml`) | grátis |

## 1. Banco (Neon)

1. Crie um projeto em neon.tech (região mais próxima: São Paulo, se disponível, ou US East).
2. Copie a *connection string* (com `?sslmode=require`).

## 2. Servidor (Render)

1. Em render.com: **New → Blueprint**, escolha o repositório `jobops`. O `render.yaml` já configura tudo.
2. Preencha as variáveis pedidas:
   - `DATABASE_URL`: a string do Neon.
   - `APP_PASSWORD`: a senha para entrar no app.
   - `CRON_TOKEN`: um texto longo aleatório (ex.: gere com `openssl rand -hex 32`).
   - `SESSION_SECRET` é gerado sozinho.
3. O build roda as migrations. O app fica em `https://jobops-xxxx.onrender.com`.

## 3. Busca diária (GitHub Actions)

No repositório: **Settings → Secrets and variables → Actions**, crie:

- `JOBOPS_URL`: o endereço do Render, sem `/` no fim.
- `CRON_TOKEN`: o mesmo valor do Render.

Para testar na hora: **Actions → Busca diária de vagas → Run workflow**.

## Variáveis de ambiente

| Variável | Para quê |
| --- | --- |
| `DATABASE_URL` | conexão com o Postgres |
| `APP_PASSWORD` | senha única do app; vazia = sem login (só para uso local) |
| `SESSION_SECRET` | assina a sessão (30 dias) |
| `CRON_TOKEN` | protege `POST /api/cron/discovery` |
| `WEB_ORIGIN` | só se o site ficar em outro domínio (CORS) |
