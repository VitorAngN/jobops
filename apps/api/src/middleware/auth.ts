import { createHmac, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";

import { env } from "../config/env.js";
import { AppError } from "../shared/http-errors.js";

const SESSION_DAYS = 30;

const sign = (payload: string) => createHmac("sha256", env.sessionSecret).update(payload).digest("base64url");

function sameText(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const authEnabled = () => env.appPassword.length > 0;

export function checkPassword(password: string) {
  return authEnabled() && sameText(password, env.appPassword);
}

/** Sessão sem estado: "expiraEm.assinatura". */
export function createSession(now = Date.now()) {
  const expires = String(now + SESSION_DAYS * 86_400_000);
  return { token: `${expires}.${sign(expires)}`, expiresAt: new Date(Number(expires)) };
}

export function validSession(token: string, now = Date.now()) {
  const [expires, signature] = token.split(".");
  if (!expires || !signature) return false;
  return sameText(signature, sign(expires)) && Number(expires) > now;
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!authEnabled()) return next();
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
  if (token && validSession(token)) return next();
  next(new AppError(401, "Unauthorized", "Faça login."));
};

export const requireCronToken: RequestHandler = (req, _res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
  if (env.cronToken && token && sameText(token, env.cronToken)) return next();
  next(new AppError(401, "Unauthorized", "Token do agendador inválido."));
};
