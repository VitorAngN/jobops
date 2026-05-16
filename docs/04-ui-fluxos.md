# 04 - UI e Fluxos

## Navegacao principal

```text
Dashboard
Vagas
Empresas
Curriculos
Contatos
Metricas
Configuracoes
```

## Dashboard

Cards principais:

- Total de candidaturas
- Aplicacoes nos ultimos 7 dias
- Taxa de resposta
- Taxa de entrevista
- Follow-ups pendentes
- Tempo medio ate retorno

Graficos:

- Vagas por status
- Vagas por area
- Vagas por plataforma
- Retornos por curriculo

## MVP implementado

Primeira versao do `apps/web`:

- cards de metricas principais;
- graficos simples por status e area;
- formulario para cadastrar candidatura;
- filtros por texto, status e area;
- ordenacao por data, fit, empresa e cargo;
- tabela paginada com empresa, vaga, status editavel, fit, data, proxima acao e link;
- exportacao da lista filtrada em CSV ou Excel;
- painel de follow-ups ativos;
- painel lateral de detalhes com historico de interacoes;
- edicao completa e exclusao de candidatura pelo painel lateral;
- criacao manual de interacoes e follow-ups;
- conclusao de lembretes pela interface;
- CRUD visual de empresas;
- CRUD visual de versoes de curriculo;
- feedback visual para erros, carregamento e operacoes concluidas;
- integracao direta com a API em `/api/applications` e `/api/metrics/summary`.

## Tela de vagas

Modos de visualizacao:

- tabela;
- kanban por status.

Filtros:

- status;
- area;
- nivel;
- modalidade;
- plataforma;
- curriculo usado;
- data de aplicacao;
- busca textual.

## Formulario de vaga

Campos essenciais:

```text
empresa
cargo
area
nivel
modalidade
localidade
tipo de contrato
link da vaga
plataforma
descricao
curriculo usado
status
data de aplicacao
proxima acao
data de follow-up
observacoes
```

## Fluxo principal

1. Usuario encontra uma vaga.
2. Cadastra vaga como `SAVED`.
3. Aplica e muda para `APPLIED`.
4. Registra curriculo usado.
5. Se mandar mensagem, registra interacao.
6. Se receber retorno, atualiza status.
7. Se nao receber, cria follow-up.
8. Dashboard atualiza metricas.
9. Usuario exporta a lista para CSV/Excel quando quiser revisar ou guardar backup.
