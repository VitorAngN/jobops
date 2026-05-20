const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");

const rootDir = path.resolve(__dirname, "..", "..");
const logPath = path.join(rootDir, "jobops-desktop.log");
const apiUrl = "http://127.0.0.1:3333/api/health";
const webUrl = "http://127.0.0.1:5173";
const databaseUrl = "postgresql://jobops:jobops@localhost:5432/jobops?schema=public";

const childProcesses = new Set();
let mainWindow;
let isQuitting = false;
let postgresStarted = false;

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(logPath, line, "utf8");
}

function run(command, options = {}) {
  log(`RUN ${command}`);

  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      cwd: rootDir,
      env: {
        ...process.env,
        PORT: "3333",
        DATABASE_URL: databaseUrl,
        VITE_API_URL: "http://127.0.0.1:3333/api",
        ...options.env,
      },
      shell: true,
      windowsHide: true,
    });

    child.stdout.on("data", (data) => log(`[${command}] ${data.toString().trimEnd()}`));
    child.stderr.on("data", (data) => log(`[${command}] ${data.toString().trimEnd()}`));

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed (${code}): ${command}`));
    });
  });
}

async function commandSucceeds(command) {
  try {
    await run(command);
    return true;
  } catch {
    return false;
  }
}

function startDockerDesktop() {
  const candidates = [
    "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe",
    path.join(process.env.LOCALAPPDATA || "", "Docker", "Docker Desktop.exe"),
  ];
  const dockerDesktopPath = candidates.find((candidate) => candidate && fs.existsSync(candidate));

  if (!dockerDesktopPath) {
    throw new Error("Docker Desktop nao foi encontrado. Instale/abra o Docker Desktop antes de iniciar o JobOps.");
  }

  log(`START Docker Desktop: ${dockerDesktopPath}`);
  const child = spawn(dockerDesktopPath, [], {
    detached: true,
    stdio: "ignore",
    windowsHide: false,
  });
  child.unref();
}

async function ensureDockerReady() {
  if (await commandSucceeds("docker info")) return;

  setLoading("Abrindo Docker Desktop...");
  startDockerDesktop();

  const startedAt = Date.now();
  while (Date.now() - startedAt < 180000) {
    if (await commandSucceeds("docker info")) return;
    await new Promise((resolve) => setTimeout(resolve, 3500));
  }

  throw new Error("Docker Desktop demorou demais para iniciar. Abra o Docker Desktop e tente novamente.");
}

function startProcess(name, command) {
  log(`START ${name}: ${command}`);

  const child = spawn(command, {
    cwd: rootDir,
    env: {
      ...process.env,
      PORT: "3333",
      DATABASE_URL: databaseUrl,
      VITE_API_URL: "http://127.0.0.1:3333/api",
    },
    shell: true,
    windowsHide: true,
  });

  childProcesses.add(child);
  child.stdout.on("data", (data) => log(`[${name}] ${data.toString().trimEnd()}`));
  child.stderr.on("data", (data) => log(`[${name}] ${data.toString().trimEnd()}`));
  child.on("exit", (code) => {
    childProcesses.delete(child);
    log(`${name} exited with code ${code}`);
  });

  return child;
}

function waitFor(url, timeoutMs = 45000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });

      request.on("error", retry);
      request.setTimeout(1500, () => {
        request.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }

      setTimeout(attempt, 750);
    };

    attempt();
  });
}

function loadingHtml(message) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>JobOps</title>
  <style>
    body {
      height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      background: #0b0f12;
      color: #f6f2eb;
      font-family: Inter, Segoe UI, Arial, sans-serif;
    }
    main {
      width: min(520px, 86vw);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 24px;
      padding: 32px;
      background: rgba(255,255,255,.04);
      box-shadow: 0 30px 90px rgba(0,0,0,.36);
    }
    h1 { margin: 0 0 10px; font-size: 42px; letter-spacing: -0.06em; }
    p { margin: 0; color: #b9b0a5; line-height: 1.5; }
    .bar { height: 6px; margin-top: 26px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.1); }
    .bar span { display: block; width: 42%; height: 100%; border-radius: inherit; background: #f6f2eb; animation: move 1.2s ease-in-out infinite alternate; }
    @keyframes move { from { transform: translateX(0); } to { transform: translateX(140%); } }
  </style>
</head>
<body>
  <main>
    <h1>JobOps</h1>
    <p>${message}</p>
    <div class="bar"><span></span></div>
  </main>
</body>
</html>`;
}

function setLoading(message) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHtml(message))}`);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1040,
    minHeight: 720,
    backgroundColor: "#0b0f12",
    title: "JobOps",
    autoHideMenuBar: true,
    show: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  setLoading("Preparando banco, API e interface. Isso pode levar alguns segundos.");
}

async function bootstrap() {
  try {
    setLoading("Subindo PostgreSQL no Docker...");
    await ensureDockerReady();
    await run("docker compose -f infra/docker-compose.yml up -d postgres");
    postgresStarted = true;

    setLoading("Preparando Prisma e banco de dados...");
    await run("npm run api:prisma:generate");
    await run("npx prisma migrate deploy --schema apps/api/prisma/schema.prisma");
    await run("npm run api:prisma:seed");

    setLoading("Iniciando API do JobOps...");
    startProcess("api", "npm run api:dev");
    await waitFor(apiUrl);

    setLoading("Abrindo interface do JobOps...");
    startProcess("web", "npm run web:dev");
    await waitFor(webUrl);

    await mainWindow.loadURL(webUrl);
  } catch (error) {
    log(`BOOTSTRAP ERROR ${error.stack || error.message}`);
    setLoading(
      "Nao consegui iniciar o JobOps. Confira se o Docker Desktop esta aberto e veja o arquivo jobops-desktop.log na pasta do projeto.",
    );
    dialog.showErrorBox("JobOps", error.message);
  }
}

function killProcessTree(child) {
  if (!child.pid || child.killed) return;

  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      windowsHide: true,
      stdio: "ignore",
    });
    return;
  }

  child.kill("SIGTERM");
}

async function shutdown() {
  if (isQuitting) return;
  isQuitting = true;

  for (const child of [...childProcesses]) {
    killProcessTree(child);
  }

  if (postgresStarted) {
    try {
      await run("docker compose -f infra/docker-compose.yml stop postgres");
    } catch (error) {
      log(`POSTGRES STOP ERROR ${error.message}`);
    }
  }
}

app.whenReady().then(() => {
  createWindow();
  bootstrap();
});

app.on("before-quit", (event) => {
  if (isQuitting) return;
  event.preventDefault();
  shutdown().finally(() => app.quit());
});

app.on("window-all-closed", () => {
  app.quit();
});
