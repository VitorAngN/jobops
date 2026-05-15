# 05 - DevOps e Infraestrutura

## Ambiente local

Servicos previstos:

```text
api
web
postgres
```

## Docker Compose futuro

```text
api:
  Node.js + TypeScript

web:
  React build servido por Nginx ou Vite dev em local

postgres:
  banco relacional persistente
```

## CI com GitHub Actions

Pipeline inicial:

```text
install
lint
typecheck
test
build
```

## Deploy futuro

Primeira versao de deploy:

- AWS EC2 Ubuntu;
- Docker Compose;
- Nginx como reverse proxy;
- variaveis de ambiente via `.env`;
- PostgreSQL em container ou servico gerenciado futuro.

## Observabilidade futura

- logs estruturados;
- endpoint `/health`;
- metricas basicas de uptime;
- backup do banco;
- runbook de deploy e rollback.

