import "dotenv/config";

const port = Number(process.env.PORT ?? 3333);

export const env = {
  port,
  databaseUrl: process.env.DATABASE_URL,
  /** Senha única do app. Sem ela (uso local), a API fica aberta. */
  appPassword: process.env.APP_PASSWORD ?? "",
  /** Segredo para assinar a sessão. */
  sessionSecret: process.env.SESSION_SECRET ?? process.env.APP_PASSWORD ?? "dev",
  /** Token do agendador (GitHub Actions). */
  cronToken: process.env.CRON_TOKEN ?? "",
  /** Endereço do front permitido no CORS (ex.: https://jobops.pages.dev). Vazio = qualquer um. */
  webOrigin: process.env.WEB_ORIGIN ?? "",
};
