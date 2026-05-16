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
GET    /api/applications/:id/interactions
POST   /api/applications/:id/interactions
POST   /api/applications/:id/reminders

PATCH  /api/interactions/:id
DELETE /api/interactions/:id

GET    /api/reminders
PATCH  /api/reminders/:id
DELETE /api/reminders/:id

GET    /api/companies
POST   /api/companies
GET    /api/companies/:id

GET    /api/resume-versions
POST   /api/resume-versions
GET    /api/resume-versions/:id

GET    /api/metrics/summary
GET    /api/metrics/by-status
GET    /api/metrics/by-area
GET    /api/metrics/by-platform
GET    /api/metrics/by-resume
```

## Query params de candidaturas

`GET /api/applications` aceita:

```text
search
status
area
level
workMode
sourcePlatform
resumeVersionId
appliedFrom
appliedTo
page
pageSize
sortBy=updatedAt|appliedAt|fitScore|companyName|title
sortOrder=asc|desc
```

Resposta:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

## Regras automaticas

- Ao marcar candidatura como `APPLIED`, a API preenche `appliedAt` quando a data nao foi informada.
- Ao marcar status com retorno, como `HR_INTERVIEW`, `TECH_INTERVIEW`, `REJECTED` ou `OFFER`, a API preenche `lastResponseAt`.
- Ao informar `followUpAt`, a API cria um lembrete pendente ligado a candidatura.

## Seed local

Com Postgres rodando:

```bash
npm run api:prisma:seed
```

## Testes

```bash
npm run api:test
```
