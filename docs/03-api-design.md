# 03 - API Design

## Base URL

```text
/api
```

## Endpoints MVP

### Health

```http
GET /health
```

Retorna status da API.

### Applications

```http
GET /applications
POST /applications
GET /applications/:id
PATCH /applications/:id
DELETE /applications/:id
```

Filtros previstos no `GET /applications`:

```text
status
area
level
workMode
sourcePlatform
companyId
resumeVersionId
appliedFrom
appliedTo
search
page
pageSize
sortBy
sortOrder
```

### Companies

```http
GET /companies
POST /companies
GET /companies/:id
PATCH /companies/:id
DELETE /companies/:id
```

### Resume Versions

```http
GET /resume-versions
POST /resume-versions
PATCH /resume-versions/:id
DELETE /resume-versions/:id
```

### Interactions

```http
GET /applications/:applicationId/interactions
POST /applications/:applicationId/interactions
PATCH /interactions/:id
DELETE /interactions/:id
```

### Reminders

```http
GET /reminders
POST /applications/:applicationId/reminders
PATCH /reminders/:id
DELETE /reminders/:id
```

Filtros previstos no `GET /reminders`:

```text
done
due=overdue|today|upcoming
```

### Metrics

```http
GET /metrics/summary
GET /metrics/by-status
GET /metrics/by-area
GET /metrics/by-platform
GET /metrics/by-resume
```

## Regras iniciais

- Uma candidatura pertence a uma empresa.
- Uma candidatura pode ou nao estar associada a uma versao de curriculo.
- Uma candidatura pode ter varias interacoes.
- Uma candidatura pode ter varios lembretes.
- Status deve ser controlado por enum para manter metricas consistentes.
- Operacoes que unem empresa e candidatura devem ser transacionais.
- Rotas HTTP devem chamar services, e services devem usar repositories baseados em Prisma.
