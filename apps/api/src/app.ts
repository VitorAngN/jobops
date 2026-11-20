import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error-handler.js";
import { cronRoutes, discoveryRoutes } from "./modules/discovery/discovery.routes.js";
import { applicationsRoutes } from "./routes/applications.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { companiesRoutes } from "./routes/companies.routes.js";
import { healthRoutes } from "./routes/health.routes.js";
import { interactionsRoutes } from "./routes/interactions.routes.js";
import { metricsRoutes } from "./routes/metrics.routes.js";
import { remindersRoutes } from "./routes/reminders.routes.js";
import { resumeVersionsRoutes } from "./routes/resume-versions.routes.js";

export const app = express();

app.use(cors(env.webOrigin ? { origin: env.webOrigin.split(",") } : undefined));
app.use(express.json());

// Abertas
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cron", cronRoutes);

// Protegidas pela senha do app
app.use("/api", requireAuth);
app.use("/api/applications", applicationsRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/resume-versions", resumeVersionsRoutes);
app.use("/api/interactions", interactionsRoutes);
app.use("/api/reminders", remindersRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/discovery", discoveryRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "NotFound", message: "Rota não encontrada." });
});

// Em produção a própria API entrega o site (apps/web/dist): um serviço só, sem CORS.
const webDist = fileURLToPath(new URL("../../web/dist", import.meta.url));
if (existsSync(webDist)) {
  app.use(express.static(webDist, { index: "index.html", maxAge: "1h" }));
}

app.use(errorHandler);
