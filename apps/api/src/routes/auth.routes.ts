import { Router } from "express";
import { z } from "zod";

import { authEnabled, checkPassword, createSession } from "../middleware/auth.js";
import { AppError } from "../shared/http-errors.js";

export const authRoutes = Router();

authRoutes.get("/status", (_req, res) => {
  res.json({ authRequired: authEnabled() });
});

authRoutes.post("/login", (req, res, next) => {
  const { password } = z.object({ password: z.string() }).parse(req.body);
  if (!authEnabled()) return res.json(createSession());
  if (!checkPassword(password)) return next(new AppError(401, "Unauthorized", "Senha incorreta."));
  res.json(createSession());
});
