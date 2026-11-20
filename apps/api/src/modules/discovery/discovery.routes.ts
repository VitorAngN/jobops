import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../lib/prisma.js";
import { requireCronToken } from "../../middleware/auth.js";
import { approveJob, runDiscovery } from "./discovery.service.js";
import { importFromUrl } from "./import-url.js";

const SOURCES = ["GUPY", "GREENHOUSE", "LEVER", "ASHBY", "REMOTIVE"] as const;
const words = z.array(z.string().trim().min(1)).default([]);

const profileSchema = z.object({
  name: z.string().trim().min(1),
  active: z.boolean().default(true),
  terms: words,
  keywords: words,
  excludeWords: words,
  locations: words,
  acceptRemote: z.boolean().default(true),
  sources: z.array(z.enum(SOURCES)).default(["GUPY"]),
  minScore: z.number().int().min(0).max(100).default(40),
  companies: z
    .array(z.object({ source: z.enum(["GREENHOUSE", "LEVER", "ASHBY"]), slug: z.string().trim().min(1), name: z.string().trim().min(1) }))
    .default([]),
});

/** Rotas usadas pela tela (protegidas pela sessão). */
export const discoveryRoutes = Router();

discoveryRoutes.get("/profiles", async (_req, res, next) => {
  try {
    res.json(await prisma.searchProfile.findMany({ include: { companies: true }, orderBy: { createdAt: "asc" } }));
  } catch (e) {
    next(e);
  }
});

discoveryRoutes.post("/profiles", async (req, res, next) => {
  try {
    const { companies, ...data } = profileSchema.parse(req.body);
    const profile = await prisma.searchProfile.create({
      data: { ...data, companies: { create: companies } },
      include: { companies: true },
    });
    res.status(201).json(profile);
  } catch (e) {
    next(e);
  }
});

discoveryRoutes.put("/profiles/:id", async (req, res, next) => {
  try {
    const { companies, ...data } = profileSchema.parse(req.body);
    const profile = await prisma.$transaction(async (tx) => {
      await tx.watchedCompany.deleteMany({ where: { profileId: req.params.id } });
      return tx.searchProfile.update({
        where: { id: req.params.id },
        data: { ...data, companies: { create: companies } },
        include: { companies: true },
      });
    });
    res.json(profile);
  } catch (e) {
    next(e);
  }
});

discoveryRoutes.delete("/profiles/:id", async (req, res, next) => {
  try {
    await prisma.searchProfile.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

const listQuery = z.object({
  status: z.enum(["NEW", "APPROVED", "DISCARDED"]).default("NEW"),
  source: z.enum(SOURCES).optional(),
  q: z.string().trim().optional(),
});

discoveryRoutes.get("/jobs", async (req, res, next) => {
  try {
    const { status, source, q } = listQuery.parse(req.query);
    const jobs = await prisma.discoveredJob.findMany({
      where: {
        status,
        ...(source ? { source } : {}),
        ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }] } : {}),
      },
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      take: 200,
    });
    const counts = await prisma.discoveredJob.groupBy({ by: ["status"], _count: true });
    res.json({ jobs, counts: Object.fromEntries(counts.map((c) => [c.status, c._count])) });
  } catch (e) {
    next(e);
  }
});

discoveryRoutes.post("/jobs/:id/approve", async (req, res, next) => {
  try {
    res.status(201).json(await approveJob(prisma, req.params.id));
  } catch (e) {
    next(e);
  }
});

discoveryRoutes.post("/jobs/:id/discard", async (req, res, next) => {
  try {
    res.json(await prisma.discoveredJob.update({ where: { id: req.params.id }, data: { status: "DISCARDED" } }));
  } catch (e) {
    next(e);
  }
});

discoveryRoutes.post("/jobs/:id/restore", async (req, res, next) => {
  try {
    res.json(await prisma.discoveredJob.update({ where: { id: req.params.id }, data: { status: "NEW" } }));
  } catch (e) {
    next(e);
  }
});

discoveryRoutes.post("/run", async (req, res, next) => {
  try {
    const profileId = z.object({ profileId: z.string().optional() }).parse(req.body ?? {}).profileId;
    res.json(await runDiscovery(prisma, { trigger: "manual", profileId }));
  } catch (e) {
    next(e);
  }
});

discoveryRoutes.get("/runs", async (_req, res, next) => {
  try {
    res.json(await prisma.discoveryRun.findMany({ orderBy: { startedAt: "desc" }, take: 10 }));
  } catch (e) {
    next(e);
  }
});

discoveryRoutes.post("/import", async (req, res, next) => {
  try {
    const { url } = z.object({ url: z.string().url() }).parse(req.body);
    res.json(await importFromUrl(url));
  } catch (e) {
    next(e);
  }
});

/** Rota chamada pelo agendador (GitHub Actions), com token próprio. */
export const cronRoutes = Router();

cronRoutes.post("/discovery", requireCronToken, async (_req, res, next) => {
  try {
    res.json(await runDiscovery(prisma, { trigger: "agendada" }));
  } catch (e) {
    next(e);
  }
});
