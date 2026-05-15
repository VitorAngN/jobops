# JobOps Web

Interface web do JobOps para registrar candidaturas, acompanhar status, filtrar vagas e visualizar metricas do funil.

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
