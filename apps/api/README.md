# JobOps API

Backend do JobOps usando Node.js, TypeScript, Express, Prisma e PostgreSQL.

## Comandos

```bash
npm install
npm run api:prisma:generate
npm run api:typecheck
npm run api:dev
```

## Banco local

Suba o PostgreSQL pela raiz do projeto:

```bash
docker compose -f infra/docker-compose.yml up -d
```

Crie um `.env` em `apps/api` com base em `.env.example`.

## Endpoints principais

```text
GET    /api/health
GET    /api/applications
POST   /api/applications
GET    /api/applications/:id
PATCH  /api/applications/:id
DELETE /api/applications/:id

GET    /api/companies
POST   /api/companies

GET    /api/resume-versions
POST   /api/resume-versions

GET    /api/metrics/summary
GET    /api/metrics/by-status
GET    /api/metrics/by-area
GET    /api/metrics/by-platform
GET    /api/metrics/by-resume
```

