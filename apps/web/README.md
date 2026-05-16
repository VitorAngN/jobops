# JobOps Web

Interface web do JobOps para registrar candidaturas, acompanhar status, filtrar vagas e visualizar metricas do funil.

## Fluxos implementados

- Cadastro de candidatura.
- Filtros, ordenacao e paginacao.
- Atualizacao rapida de status.
- Painel de detalhes da candidatura.
- Registro de interacoes com recrutadores.
- Criacao e conclusao de follow-ups.

## Rodar localmente

```bash
npm install
npm run web:dev
```

Por padrao, o frontend espera a API em:

```text
http://localhost:3333/api
```

Para mudar, crie um `.env` em `apps/web`:

```bash
VITE_API_URL=http://localhost:3333/api
```
