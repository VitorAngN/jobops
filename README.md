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

Projeto em fase de arquitetura e planejamento.

