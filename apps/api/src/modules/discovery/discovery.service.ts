import type { DiscoverySource, PrismaClient, SourcePlatform } from "@prisma/client";

import { scoreJob } from "./score.js";
import { SOURCES, type ExternalJob } from "./sources/index.js";

const SOURCE_TO_PLATFORM: Record<DiscoverySource, SourcePlatform> = {
  GUPY: "GUPY",
  GREENHOUSE: "GREENHOUSE",
  LEVER: "LEVER",
  ASHBY: "ASHBY",
  REMOTIVE: "OTHER",
};

const ATS: DiscoverySource[] = ["GREENHOUSE", "LEVER", "ASHBY"];

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

  for (const profile of profiles) {
    for (const sourceId of profile.sources) {
      const companies = profile.companies.filter((c) => c.source === sourceId);
      if (ATS.includes(sourceId) && companies.length === 0) continue;

      let jobs: ExternalJob[];
      try {
        jobs = await SOURCES[sourceId].search({ terms: profile.terms, companies }, options.fetcher);
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

  await db.discoveryRun.update({
    where: { id: run.id },
    data: { finishedAt: new Date(), found, created, errors },
  });
  return { runId: run.id, found, created, errors };
}

/** Aprovar = virar candidatura com status "Salva" (cria a empresa se ainda não existir). */
export async function approveJob(db: PrismaClient, id: string) {
  return db.$transaction(async (tx) => {
    const job = await tx.discoveredJob.findUniqueOrThrow({ where: { id } });
    if (job.applicationId) return tx.jobApplication.findUniqueOrThrow({ where: { id: job.applicationId } });

    const company = await tx.company.upsert({
      where: { name: job.company },
      update: {},
      create: { name: job.company },
    });
    const application = await tx.jobApplication.create({
      data: {
        companyId: company.id,
        title: job.title,
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
