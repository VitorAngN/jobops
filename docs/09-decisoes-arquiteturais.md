# 09 - Decisoes Arquiteturais

Este documento registra decisoes importantes para nao perder contexto entre sessoes de desenvolvimento.

## ADR-001 - Monorepo com API e Web

Decisao: manter `apps/api` e `apps/web` no mesmo repositorio.

Motivo:

- facilita evoluir contrato de API e UI juntos;
- simplifica scripts de build, typecheck e teste;
- deixa o projeto mais apresentavel como produto completo.

Consequencias:

- exige cuidado com workspaces npm;
- CI deve validar API e Web.

## ADR-002 - API Express em camadas

Decisao: usar camadas `routes -> services -> repositories -> Prisma`.

Motivo:

- evita regra de negocio espalhada em rotas;
- facilita teste de services e repositories;
- prepara o sistema para autenticar usuarios, auditar eventos e adicionar IA.

Consequencias:

- ha mais arquivos do que em um CRUD simples;
- nomes e responsabilidades precisam ser mantidos consistentes.

## ADR-003 - PostgreSQL com Prisma

Decisao: usar PostgreSQL via Docker Compose e Prisma ORM.

Motivo:

- banco relacional combina com candidaturas, empresas, curriculos e historico;
- Prisma gera tipos fortes e migrations versionadas;
- Docker deixa o ambiente local reproduzivel.

Consequencias:

- para rodar localmente, Docker precisa estar disponivel;
- o Prisma Client precisa ser gerado apos instalar dependencias.

## ADR-004 - Desktop como extra, nao como substituto

Decisao: manter o modo desktop como extra opcional na branch/clone `jobops-desktop`.

Motivo:

- a versao web continua sendo a base principal;
- o desktop melhora a experiencia local sem mudar o produto;
- reduz risco de quebrar o MVP web.

Consequencias:

- o desktop ainda depende do stack local por baixo;
- documentacao deve deixar claro que e um modo extra.

## ADR-005 - IA como modulo futuro

Decisao: nao acoplar IA ao MVP atual.

Motivo:

- o MVP precisa primeiro registrar dados confiaveis;
- IA sera mais util quando houver descricoes, curriculos e historico suficiente;
- evita gastar tempo em automacao antes de fechar o fluxo principal.

Possiveis casos de uso:

- extrair tecnologias da descricao da vaga;
- calcular fit score;
- sugerir curriculo;
- gerar mensagem para recrutador;
- apontar lacunas de estudo.
