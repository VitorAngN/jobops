import { describe, expect, it } from "vitest";

import { scoreJob, type ScoreProfile } from "./score.js";
import type { ExternalJob } from "./sources/types.js";

const profile: ScoreProfile = {
  terms: ["estágio back-end", "estágio desenvolvimento"],
  keywords: ["node", "typescript", "postgres", "docker"],
  excludeWords: ["sênior", "vendas"],
  locations: ["Londrina", "Curitiba"],
  acceptRemote: true,
};

const job = (over: Partial<ExternalJob> = {}): ExternalJob => ({
  source: "GUPY",
  externalId: "1",
  title: "Estágio Back-end",
  company: "Acme",
  location: "Curitiba, Paraná",
  workMode: "HYBRID",
  level: "INTERNSHIP",
  url: "https://acme.gupy.io/jobs/1",
  description: "Node, TypeScript e Postgres.",
  publishedAt: new Date("2026-11-18"),
  ...over,
});

const now = new Date("2026-11-20");

describe("scoreJob", () => {
  it("dá nota alta para estágio que bate com o perfil", () => {
    const r = scoreJob(job(), profile, now);
    expect(r.excluded).toBe(false);
    expect(r.score).toBeGreaterThanOrEqual(90);
    expect(r.reasons.join(" ")).toContain("estágio back-end");
  });

  it("elimina palavra proibida no título, ignorando acento", () => {
    const r = scoreJob(job({ title: "Desenvolvedor Senior Node" }), profile, now);
    expect(r).toMatchObject({ excluded: true, score: 0 });
  });

  it("penaliza vaga presencial fora das cidades escolhidas", () => {
    const longe = scoreJob(job({ location: "Fortaleza, CE", workMode: "ONSITE" }), profile, now);
    const perto = scoreJob(job(), profile, now);
    expect(longe.score).toBeLessThan(perto.score - 30);
  });

  it("não confunde palavra dentro de outra (node ≠ nodemon)", () => {
    const r = scoreJob(job({ description: "nodemon" }), { ...profile, keywords: ["node"] }, now);
    expect(r.reasons.join(" ")).not.toContain("Palavras-chave");
  });

  it("nunca passa de 0 a 100", () => {
    const r = scoreJob(job({ level: "SENIOR", title: "Staff Engineer", workMode: "ONSITE", location: "Recife" }), profile, now);
    expect(r.score).toBe(0);
  });
});
