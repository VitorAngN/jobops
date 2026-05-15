import { Router } from "express";

export const healthRoutes = Router();

healthRoutes.get("/health", (_request, response) => {
  return response.json({
    status: "ok",
    service: "jobops-api",
    timestamp: new Date().toISOString(),
  });
});

