# Deploy gratuito e privado

Um serviço só no Render entrega a API e o site. O banco fica no Neon. Um workflow do GitHub Actions roda a busca de vagas todo dia.

| Peça | Serviço | Custo |
| --- | --- | --- |
| API + site | Render (Web Service, plano Free) | grátis; dorme após 15 min sem uso e acorda em ~1 min |
| Banco | Neon (Postgres, plano Free) | grátis; 0,5 GB |
| Busca diária | GitHub Actions (`busca-diaria.yml`) | grátis |

## 1. Banco (Neon)

O projeto já está ligado ao Neon (`neon.ts` e a pasta `.neon`, que fica fora do Git).

1. `neon env pull` grava em `.env.local` as duas conexões:
   - `DATABASE_URL`: com pooler (endereço com `-pooler`), usada pela API.
   - `DATABASE_URL_UNPOOLED`: direta, usada pelo Prisma Migrate.
2. Esses dois valores vão para as variáveis do Render.

## 2. Servidor (Render)

1. Em render.com: **New → Blueprint**, escolha o repositório `jobops`. O `render.yaml` já configura tudo.
2. Preencha as variáveis pedidas:
   - `DATABASE_URL` e `DATABASE_URL_UNPOOLED`: as duas do Neon.
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
| `DATABASE_URL` | conexão com o Postgres (no Neon, a com pooler) |
| `DATABASE_URL_UNPOOLED` | conexão direta, para as migrations (no Postgres local, igual à de cima) |
| `APP_PASSWORD` | senha única do app; vazia = sem login (só para uso local) |
| `SESSION_SECRET` | assina a sessão (30 dias) |
| `CRON_TOKEN` | protege `POST /api/cron/discovery` |
| `GITHUB_TOKEN` | opcional: token do GitHub (só leitura) para a fonte "Comunidades"; sem ele o limite é 60 consultas por hora |
| `WEB_ORIGIN` | só se o site ficar em outro domínio (CORS) |
