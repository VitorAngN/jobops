# 08 - Extra: Aplicativo Desktop

## Objetivo

O modo desktop e um extra opcional do JobOps. Ele nao substitui a versao web principal. A ideia e permitir que o sistema seja aberto como um aplicativo comum no Windows, por um atalho na Area de Trabalho.

## O que foi implementado

- Wrapper Electron em `apps/desktop/main.cjs`.
- Script de inicializacao em `scripts/start-jobops-desktop.ps1`.
- Script para criar atalho em `scripts/install-desktop-shortcut.ps1`.
- Atalho `JobOps.lnk` na Area de Trabalho do Windows.
- Scripts npm:
  - `npm run extra:desktop:start`
  - `npm run extra:desktop:shortcut`
  - aliases: `desktop:start` e `desktop:shortcut`

## Como funciona

Ao iniciar o app:

1. Abre uma janela Electron propria.
2. Tenta verificar se o Docker Desktop esta ativo.
3. Se necessario, tenta iniciar o Docker Desktop.
4. Sobe o PostgreSQL com `docker compose`.
5. Gera Prisma Client.
6. Aplica migrations com `prisma migrate deploy`.
7. Executa seed inicial.
8. Inicia a API em `http://127.0.0.1:3333`.
9. Inicia a web em `http://127.0.0.1:5173`.
10. Carrega a interface dentro da janela.

## Dependencias

- Node.js instalado.
- Docker Desktop instalado.
- Dependencias do projeto instaladas com `npm install`.

## Comandos

Criar atalho:

```bash
npm run extra:desktop:shortcut
```

Abrir app pelo terminal:

```bash
npm run extra:desktop:start
```

## Logs

O launcher grava logs em:

```text
jobops-desktop.log
```

Use esse arquivo para diagnosticar:

- Docker fechado ou nao encontrado;
- erro ao subir PostgreSQL;
- migration falhando;
- API indisponivel;
- Vite indisponivel.

## Limites atuais

- Ainda nao gera instalador `.exe`.
- Ainda depende de Node.js e Docker Desktop instalados.
- Ainda usa Vite em modo desenvolvimento por baixo.
- O PostgreSQL fica em Docker Compose local.

## Proximas melhorias

- Empacotar com `electron-builder`.
- Usar build estatico da web no Electron.
- Rodar API compilada em vez de `tsx watch`.
- Criar icone proprio do JobOps.
- Criar instalador Windows.
- Investigar banco local sem Docker para uma versao mais independente.
