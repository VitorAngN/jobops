# JobOps

Gerenciador inteligente de candidaturas para acompanhar vagas, curriculos, contatos, retornos e metricas de busca de emprego.

## Objetivo

O JobOps nasceu para resolver uma dor real: organizar candidaturas de forma profissional e medir o que esta funcionando na busca por vagas.

Em vez de uma planilha solta, o sistema centraliza:

- vagas aplicadas;
- status de cada candidatura;
- curriculo usado;
- contatos com recrutadores;
- follow-ups;
- respostas e rejeicoes;
- metricas por area, plataforma, empresa e curriculo.

## Posicionamento tecnico

Projeto autoral focado em Back-end, Cloud e DevOps:

- API REST com Node.js, TypeScript e Express;
- PostgreSQL com Prisma;
- Frontend em React e TypeScript;
- Docker e Docker Compose para ambiente local;
- GitHub Actions para CI;
- deploy futuro em AWS EC2;
- modulo futuro de IA para analisar descricoes de vaga e sugerir curriculo/mensagem.

## Modulos previstos

1. Dashboard de metricas
2. Cadastro e pipeline de vagas
3. Empresas e contatos
4. Versoes de curriculo
5. Historico de interacoes
6. Lembretes de follow-up
7. Analise de fit com IA

## Estrutura inicial

```text
jobops/
  apps/
    api/        # Backend Node.js/TypeScript
    web/        # Frontend React/TypeScript
  docs/         # Arquitetura, modelagem e planejamento
  infra/        # Docker, CI/CD e deploy
```

## Status

Projeto em fase de MVP inicial com API e interface web.

## Screenshots

Dashboard principal com metricas, cadastro rapido, filtros, tabela de candidaturas e follow-ups:

![Dashboard do JobOps](docs/assets/jobops-dashboard.png)

Painel de detalhes da candidatura com historico de interacoes e lembretes de follow-up:

![Detalhes da candidatura](docs/assets/jobops-detail.png)

## Documentacao tecnica

- [Visao geral](docs/00-visao-geral.md)
- [Modelagem de dados](docs/01-modelagem-dados.md)
- [Roadmap](docs/02-roadmap.md)
- [API design](docs/03-api-design.md)
- [Fluxos de UI](docs/04-ui-fluxos.md)
- [DevOps](docs/05-devops.md)
- [Arquitetura backend](docs/06-backend-architecture.md)
- [Evidencias tecnicas](docs/07-evidencias-tecnicas.md)

## Primeiros comandos

```bash
npm install
docker compose -f infra/docker-compose.yml up -d
npm run api:prisma:generate
npm run api:prisma:migrate
npm run api:prisma:seed
npm run api:test
npm run api:dev
```

API local:

```text
http://localhost:3333/api/health
```

Interface web:

```bash
npm run web:dev
```

```text
http://127.0.0.1:5173
```

## MVP atual

- API Express com TypeScript.
- Prisma schema para candidaturas, empresas, curriculos, interacoes e lembretes.
- Dashboard web com metricas, filtros, cadastro de vaga e tabela de acompanhamento.
- Docker Compose para PostgreSQL local.
- Arquitetura backend em camadas com routes, services, repositories e Prisma ORM.
- GitHub Actions com typecheck e build de API/Web.
- Listagem paginada, ordenavel e filtravel de candidaturas.
- Atualizacao rapida de status e geracao de lembretes de follow-up.
- Painel de detalhes para registrar interacoes, criar follow-ups e concluir lembretes.
- Testes unitarios para regras de lifecycle e paginacao.
