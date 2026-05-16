# 06 - Arquitetura Backend

## Decisao atual

O backend evoluiu para uma arquitetura em camadas:

```text
routes -> services -> repositories -> Prisma ORM -> PostgreSQL
```

## Responsabilidades

### Routes

- Recebem HTTP.
- Validam entrada com Zod.
- Delegam regras para services.
- Nao devem conter regra de negocio complexa.

### Services

- Coordenam casos de uso.
- Garantem regras de fluxo.
- Disparam erros de dominio, como `NotFoundError`.
- Podem combinar mais de um repository.

### Repositories

- Isolam consultas Prisma.
- Concentram includes, filtros e ordenacoes.
- Usam transacoes quando uma operacao envolve mais de uma entidade.

### Prisma ORM

- Modela entidades e relacionamentos.
- Mantem migrations versionadas.
- Garante consistencia entre codigo TypeScript e banco.

## Por que isso ajuda no portifolio

- Mostra que o projeto nao e so CRUD solto.
- Permite crescer para autenticacao, testes, cache e filas sem reescrever tudo.
- Facilita manutencao quando a UI ganhar kanban, graficos e automacoes.

## Proximas evolucoes tecnicas

- Testes de integracao por rota.
- Auth com usuario real.
- Observabilidade com logs estruturados.
- CI com typecheck, build e testes.
