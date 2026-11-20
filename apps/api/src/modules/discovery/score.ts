import type { ApplicationLevel } from "@prisma/client";

import { fold } from "./sources/normalize.js";
import type { ExternalJob } from "./sources/types.js";

export type ScoreProfile = {
  terms: string[];
  keywords: string[];
  excludeWords: string[];
  locations: string[];
  acceptRemote: boolean;
};

export type ScoreResult = { score: number; reasons: string[]; excluded: boolean };

const LEVEL_POINTS: Record<ApplicationLevel, number> = {
  INTERNSHIP: 30,
  TRAINEE: 25,
  JUNIOR: 20,
  UNKNOWN: 5,
  MID: -20,
  SENIOR: -60,
};

const LEVEL_NAMES: Record<ApplicationLevel, string> = {
  INTERNSHIP: "estágio",
  TRAINEE: "trainee",
  JUNIOR: "júnior",
  MID: "pleno",
  SENIOR: "sênior",
  UNKNOWN: "não informado",
};

/** Junta variações da mesma palavra (estagiária, estagiário, estágio → estagio). */
const stem = (text: string) => fold(text).replace(/\bestagi\w*/g, "estagio").replace(/\bdesenvolvedor\w*/g, "desenvolvedor");

const has = (haystack: string, word: string) => {
  const w = fold(word).trim();
  return w.length > 0 && new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).test(haystack);
};

/** Nota de 0 a 100 e os motivos (aparecem na triagem). */
export function scoreJob(job: ExternalJob, profile: ScoreProfile, now = new Date()): ScoreResult {
  const title = stem(job.title);
  const body = `${title} ${fold(job.description ?? "")}`;
  const reasons: string[] = [];

  const blocked = profile.excludeWords.find((w) => has(title, w));
  if (blocked) return { score: 0, reasons: [`Contém "${blocked}" no título`], excluded: true };

  let score = 0;

  const level = LEVEL_POINTS[job.level];
  score += level;
  if (job.level !== "UNKNOWN") reasons.push(`Nível: ${LEVEL_NAMES[job.level]} (${level > 0 ? "+" : ""}${level})`);

  const termHit = profile.terms.find((t) => stem(t).split(/\s+/).every((p) => has(title, p)));
  if (termHit) {
    score += 25;
    reasons.push(`Título bate com "${termHit}" (+25)`);
  }

  const kw = profile.keywords.filter((k) => has(body, k));
  if (kw.length) {
    const pts = Math.min(30, kw.length * 6);
    score += pts;
    reasons.push(`Palavras-chave: ${kw.slice(0, 6).join(", ")} (+${pts})`);
  }

  const place = fold(job.location ?? "");
  if (job.workMode === "REMOTE") {
    if (profile.acceptRemote) {
      score += 15;
      reasons.push("Remota (+15)");
    }
  } else if (profile.locations.some((l) => has(place, l))) {
    score += 15;
    reasons.push(`Local aceito: ${job.location} (+15)`);
  } else if (profile.locations.length && job.location) {
    score -= 25;
    reasons.push(`Fora das cidades escolhidas: ${job.location} (-25)`);
  }

  if (job.publishedAt) {
    const days = (now.getTime() - job.publishedAt.getTime()) / 86_400_000;
    if (days <= 7) {
      score += 5;
      reasons.push("Publicada nesta semana (+5)");
    } else if (days > 45) {
      score -= 10;
      reasons.push("Publicada há mais de 45 dias (-10)");
    }
  }

  return { score: Math.max(0, Math.min(100, score)), reasons, excluded: false };
}
