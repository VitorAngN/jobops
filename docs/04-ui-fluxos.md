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

