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

app.use(errorHandler);
