# 05 - DevOps e Infraestrutura

## Ambiente local

Servicos previstos:

```text
api
web
postgres
```

## Docker Compose local

```text
postgres:
  PostgreSQL 16
  porta 5432
  usuario jobops
  banco jobops
```

Arquivo atual: `infra/docker-compose.yml`.

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
