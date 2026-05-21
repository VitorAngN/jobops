# 11 - Memoria de Projeto

Este arquivo serve como resumo rapido para retomar o JobOps em novas sessoes.

## Identidade

Nome: JobOps.

Proposta: CRM pessoal para busca de emprego, focado em candidaturas, curriculos, interacoes, follow-ups e metricas.

Perfil tecnico que o projeto quer demonstrar:

- Back-end;
- Cloud;
- DevOps;
- dados;
- futura IA aplicada.

## Estado atual

- Monorepo npm com `apps/api` e `apps/web`.
- API Express + TypeScript.
- Prisma + PostgreSQL.
- Frontend React + TypeScript + Vite.
- Docker Compose com PostgreSQL local.
- Modo desktop extra com Electron no clone/branch `extra/desktop-app`.

## Fluxos implementados

- Dashboard com metricas.
- Cadastro e listagem de candidaturas.
- Filtros e ordenacao.
- Atualizacao rapida de status.
- Painel de detalhes.
- Interacoes.
- Follow-ups.
- CRUD de empresas.
- CRUD de curriculos.
- Exportacao CSV/Excel.

## Comandos importantes

```bash
npm install
npm run api:prisma:generate
npm run typecheck
npm run build
npm run test
```

Modo desktop extra:

```bash
npm run extra:desktop:start
npm run extra:desktop:shortcut
```

## Decisoes recentes

- A versao desktop deve ser extra opcional, nao substituta da web.
- A documentacao deve funcionar como fonte de verdade do projeto.
- Obsidian sera usado como memoria/graph de conhecimento do projeto.

## Proximas prioridades sugeridas

1. Kanban de candidaturas.
2. Historico automatico de status.
3. Backup/importacao de dados.
4. Notificacoes de follow-up.
5. Empacotamento desktop mais independente.

## Onde olhar primeiro

- `README.md`
- `docs/INDEX.md`
- `docs/10-backlog-priorizado.md`
- `apps/web/src/App.tsx`
- `apps/api/src/app.ts`
- `apps/api/prisma/schema.prisma`
