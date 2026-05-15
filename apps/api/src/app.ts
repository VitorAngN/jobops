import cors from "cors";
import express from "express";

import { errorHandler } from "./middleware/error-handler.js";
import { applicationsRoutes } from "./routes/applications.routes.js";
import { companiesRoutes } from "./routes/companies.routes.js";
import { healthRoutes } from "./routes/health.routes.js";
import { metricsRoutes } from "./routes/metrics.routes.js";
import { resumeVersionsRoutes } from "./routes/resume-versions.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/resume-versions", resumeVersionsRoutes);
app.use("/api/metrics", metricsRoutes);

app.use(errorHandler);

