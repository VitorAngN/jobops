import type { DiscoverySource, PrismaClient, SourcePlatform } from "@prisma/client";

import { rankResumes } from "../resumes/match.js";
import { scoreJob } from "./score.js";
import { SOURCES, type ExternalJob } from "./sources/index.js";

const SOURCE_TO_PLATFORM: Record<DiscoverySource, SourcePlatform> = {
  GUPY: "GUPY",
  GREENHOUSE: "GREENHOUSE",
  LEVER: "LEVER",
  ASHBY: "ASHBY",
  REMOTIVE: "OTHER",
  SOLIDES: "SOLIDES",
  HIMALAYAS: "HIMALAYAS",
  GITHUB: "GITHUB",
  SMARTRECRUITERS: "SMARTRECRUITERS",
};

const STALE_DAYS = 30;

const ATS: DiscoverySource[] = ["GREENHOUSE", "LEVER", "ASHBY", "SMARTRECRUITERS"];
/** Fontes que não dependem dos termos (trazem tudo e a pontuação filtra): uma chamada por execução. */
const TERMLESS: DiscoverySource[] = ["REMOTIVE", "GITHUB"];

export type RunSummary = { runId: string; found: number; created: number; errors: string[] };

/** Roda todos os perfis ativos (ou só um) e guarda as vagas novas que passaram da nota mínima. */
export async function runDiscovery(
  db: PrismaClient,
  options: { trigger: string; profileId?: string; fetcher?: typeof fetch },
): Promise<RunSummary> {
  const run = await db.discoveryRun.create({ data: { trigger: options.trigger } });
  const profiles = await db.searchProfile.findMany({
    where: { active: true, ...(options.profileId ? { id: options.profileId } : {}) },
    include: { companies: true },
  });

  const errors: string[] = [];
  let found = 0;
  let created = 0;
  // Mesma fonte + mesmos termos em buscas diferentes = uma chamada só (a Remotive limita chamadas por dia).
  const cache = new Map<string, Promise<ExternalJob[]>>();

  for (const profile of profiles) {
    for (const sourceId of profile.sources) {
      const companies = profile.companies.filter((c) => c.source === sourceId);
      if (ATS.includes(sourceId) && companies.length === 0) continue;

      let jobs: ExternalJob[];
      try {
        const input = { terms: TERMLESS.includes(sourceId) ? [] : profile.terms, companies: companies.map(({ slug, name }) => ({ slug, name })) };
        const key = `${sourceId}:${JSON.stringify(input)}`;
        if (!cache.has(key)) cache.set(key, SOURCES[sourceId].search(input, options.fetcher));
        jobs = await cache.get(key)!;
      } catch (error) {
        errors.push(`${profile.name} · ${sourceId}: ${(error as Error).message}`);
        continue;
      }
      found += jobs.length;

      for (const job of jobs) {
        const { score, reasons, excluded } = scoreJob(job, profile);
        if (excluded || score < profile.minScore) continue;
        const result = await db.discoveredJob.createMany({
          data: [{ ...job, profileId: profile.id, score, scoreReasons: reasons }],
          skipDuplicates: true,
        });
        created += result.count;
      }
    }
  }

  // Vagas novas paradas há mais de 30 dias provavelmente já fecharam: saem da caixa de entrada.
  await db.discoveredJob.updateMany({
    where: { status: "NEW", createdAt: { lt: new Date(Date.now() - STALE_DAYS * 86_400_000) } },
    data: { status: "DISCARDED" },
  });

  await db.discoveryRun.update({
    where: { id: run.id },
    data: { finishedAt: new Date(), found, created, errors },
  });
  return { runId: run.id, found, created, errors };
}

/**
 * Aprovar = virar candidatura com status "Salva" (cria a empresa se ainda não existir).
 * A área vem da busca que achou a vaga, e o currículo sugerido é o mais aderente.
 */
export async function approveJob(db: PrismaClient, id: string) {
  return db.$transaction(async (tx) => {
    const job = await tx.discoveredJob.findUniqueOrThrow({ where: { id }, include: { profile: { select: { area: true } } } });
    if (job.applicationId) return tx.jobApplication.findUniqueOrThrow({ where: { id: job.applicationId } });

    const resumes = await tx.resumeVersion.findMany({ select: { id: true, name: true, content: true } });
    const best = rankResumes(`${job.title}\n${job.description ?? ""}`, resumes)[0];

    const company = await tx.company.upsert({
      where: { name: job.company },
      update: {},
      create: { name: job.company },
    });
    const application = await tx.jobApplication.create({
      data: {
        companyId: company.id,
        title: job.title,
        area: job.profile?.area ?? "BACKEND",
        resumeVersionId: best?.id,
        level: job.level,
        workMode: job.workMode,
        location: job.location,
        contractType: job.level === "INTERNSHIP" ? "INTERNSHIP" : "UNKNOWN",
        sourcePlatform: SOURCE_TO_PLATFORM[job.source],
        jobUrl: job.url,
        description: job.description,
        fitScore: job.score,
        foundAt: job.createdAt,
        status: "SAVED",
      },
    });
    await tx.discoveredJob.update({ where: { id }, data: { status: "APPROVED", applicationId: application.id } });
    return application;
  });
}
