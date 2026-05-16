# Evidencias tecnicas

Este documento registra comandos e sinais tecnicos usados para validar que o JobOps esta rodando de ponta a ponta em ambiente local.

O objetivo nao e substituir o README, mas concentrar provas reproduziveis de infraestrutura, API, banco de dados, qualidade de codigo e build.

## Stack validada

- Frontend: React, TypeScript e Vite.
- API: Node.js, TypeScript e Express.
- Banco de dados: PostgreSQL 16 via Docker Compose.
- ORM: Prisma.
- Qualidade: TypeScript typecheck, Vitest e build de API/Web.

## Infraestrutura local

Subir o banco:

```bash
docker compose -f infra/docker-compose.yml up -d
```

Verificar containers:

```bash
docker compose -f infra/docker-compose.yml ps
```

Saida esperada:

```text
NAME              IMAGE                SERVICE    STATUS                    PORTS
jobops_postgres   postgres:16-alpine   postgres   Up ... (healthy)          0.0.0.0:5432->5432/tcp
```

No Windows, se `docker` nao estiver no PATH, o comando pode ser executado pelo caminho completo:

```powershell
& 'C:\Program Files\Docker\Docker\resources\bin\docker.exe' compose -f infra/docker-compose.yml ps
```

## Banco e ORM

Gerar Prisma Client:

```bash
npm run api:prisma:generate
```

Aplicar migrations:

```bash
npm run api:prisma:migrate
```

Popular dados iniciais:

```bash
npm run api:prisma:seed
```

Esses comandos validam que:

- o schema Prisma esta consistente;
- a API consegue conectar no PostgreSQL;
- as entidades principais podem ser persistidas;
- o projeto possui dados locais para demonstracao.

## API

Subir a API:

```bash
npm run api:dev
```

Verificar health check:

```powershell
Invoke-RestMethod -Uri http://localhost:3333/api/health -Method Get
```

Saida esperada:

```json
{
  "status": "ok",
  "service": "jobops-api"
}
```

Verificar metricas do dashboard:

```powershell
Invoke-RestMethod -Uri http://localhost:3333/api/metrics/summary -Method Get
```

Exemplo de saida:

```json
{
  "total": 2,
  "appliedLast7Days": 1,
  "responded": 0,
  "interviews": 0,
  "pendingFollowUps": 0,
  "responseRate": 0,
  "interviewRate": 0
}
```

## Interface web

Subir o frontend:

```bash
npm run web:dev
```

Acessar:

```text
http://localhost:5173
```

Fluxos validados visualmente:

- dashboard com metricas principais;
- cadastro rapido de vaga;
- listagem paginada de candidaturas;
- filtros por status, area e busca textual;
- atualizacao rapida de status;
- painel lateral de detalhes;
- historico de interacoes;
- criacao e conclusao de follow-ups.

Screenshots:

- `docs/assets/jobops-dashboard.png`
- `docs/assets/jobops-detail.png`

## Qualidade de codigo

Typecheck de API e Web:

```bash
npm run typecheck
```

Resultado validado:

```text
api:typecheck -> tsc --noEmit
web:typecheck -> tsc --noEmit
```

Testes automatizados:

```bash
npm run test
```

Resultado validado:

```text
Test Files  2 passed (2)
Tests       5 passed (5)
```

Build completo:

```bash
npm run build
```

Resultado validado:

```text
api:build -> tsc -p tsconfig.json
web:build -> tsc -p tsconfig.json && vite build
```

## O que essas evidencias demonstram

- O projeto nao e apenas uma tela estatica.
- Existe banco PostgreSQL real rodando em container.
- A API possui contrato HTTP e health check.
- O dashboard consome metricas reais da API.
- O backend usa ORM, migrations e seed.
- Ha separacao entre API, Web, Infra e Docs.
- O codigo passa por typecheck, testes e build.

## Proximas evidencias uteis

- Pipeline do GitHub Actions rodando no repositorio remoto.
- Deploy em uma instancia Linux com Docker Compose.
- Endpoint publico de health check.
- Print ou log do CI executando typecheck, testes e build.
- Script de backup/exportacao das candidaturas.
