import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";

export const applicationsRoutes = Router();

const areaSchema = z.enum(["BACKEND", "DEVOPS", "CLOUD", "FULLSTACK", "FRONTEND", "DATA", "SECURITY", "OTHER"]);
const levelSchema = z.enum(["INTERNSHIP", "TRAINEE", "JUNIOR", "MID", "SENIOR", "UNKNOWN"]);
const workModeSchema = z.enum(["REMOTE", "HYBRID", "ONSITE", "UNKNOWN"]);
const contractTypeSchema = z.enum(["INTERNSHIP", "CLT", "PJ", "TEMPORARY", "OTHER", "UNKNOWN"]);
const sourcePlatformSchema = z.enum([
  "LINKEDIN",
  "GUPY",
  "COMPANY_SITE",
  "INDEED",
  "GLASSDOOR",
  "GREENHOUSE",
  "LEVER",
  "ASHBY",
  "REFERRAL",
  "OTHER",
]);
const statusSchema = z.enum([
  "SAVED",
  "APPLIED",
  "RECRUITER_CONTACTED",
  "IN_REVIEW",
  "TEST_SENT",
  "HR_INTERVIEW",
  "TECH_INTERVIEW",
  "WAITING_RESPONSE",
  "REJECTED",
  "GHOSTED",
  "OFFER",
  "ARCHIVED",
]);

const applicationBodySchema = z.object({
  companyName: z.string().min(1),
  title: z.string().min(1),
  area: areaSchema.default("BACKEND"),
  level: levelSchema.default("INTERNSHIP"),
  workMode: workModeSchema.default("REMOTE"),
  location: z.string().optional(),
  contractType: contractTypeSchema.default("UNKNOWN"),
  sourcePlatform: sourcePlatformSchema.default("LINKEDIN"),
  jobUrl: z.string().url().optional(),
  description: z.string().optional(),
  status: statusSchema.default("SAVED"),
  resumeVersionId: z.string().optional(),
  fitScore: z.number().int().min(0).max(100).optional(),
  foundAt: z.coerce.date().optional(),
  appliedAt: z.coerce.date().optional(),
  lastResponseAt: z.coerce.date().optional(),
  nextAction: z.string().optional(),
  followUpAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

const updateApplicationBodySchema = applicationBodySchema.partial();

const listQuerySchema = z.object({
  status: statusSchema.optional(),
  area: areaSchema.optional(),
  level: levelSchema.optional(),
  workMode: workModeSchema.optional(),
  sourcePlatform: sourcePlatformSchema.optional(),
  resumeVersionId: z.string().optional(),
  search: z.string().optional(),
  appliedFrom: z.coerce.date().optional(),
  appliedTo: z.coerce.date().optional(),
});

applicationsRoutes.get("/", async (request, response, next) => {
  try {
    const query = listQuerySchema.parse(request.query);

    const applications = await prisma.jobApplication.findMany({
      where: {
        status: query.status,
        area: query.area,
        level: query.level,
        workMode: query.workMode,
        sourcePlatform: query.sourcePlatform,
        resumeVersionId: query.resumeVersionId,
        appliedAt:
          query.appliedFrom || query.appliedTo
            ? {
                gte: query.appliedFrom,
                lte: query.appliedTo,
              }
            : undefined,
        OR: query.search
          ? [
              { title: { contains: query.search, mode: "insensitive" } },
              { company: { name: { contains: query.search, mode: "insensitive" } } },
            ]
          : undefined,
      },
      include: {
        company: true,
        resumeVersion: true,
        _count: {
          select: {
            interactions: true,
            reminders: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return response.json(applications);
  } catch (error) {
    return next(error);
  }
});

applicationsRoutes.post("/", async (request, response, next) => {
  try {
    const body = applicationBodySchema.parse(request.body);

    const company = await prisma.company.upsert({
      where: { name: body.companyName },
      update: {},
      create: { name: body.companyName },
    });

    const application = await prisma.jobApplication.create({
      data: {
        companyId: company.id,
        title: body.title,
        area: body.area,
        level: body.level,
        workMode: body.workMode,
        location: body.location,
        contractType: body.contractType,
        sourcePlatform: body.sourcePlatform,
        jobUrl: body.jobUrl,
        description: body.description,
        status: body.status,
        resumeVersionId: body.resumeVersionId,
        fitScore: body.fitScore,
        foundAt: body.foundAt,
        appliedAt: body.appliedAt,
        lastResponseAt: body.lastResponseAt,
        nextAction: body.nextAction,
        followUpAt: body.followUpAt,
        notes: body.notes,
      },
      include: {
        company: true,
        resumeVersion: true,
      },
    });

    return response.status(201).json(application);
  } catch (error) {
    return next(error);
  }
});

applicationsRoutes.get("/:id", async (request, response, next) => {
  try {
    const application = await prisma.jobApplication.findUnique({
      where: { id: request.params.id },
      include: {
        company: true,
        resumeVersion: true,
        interactions: {
          orderBy: { happenedAt: "desc" },
        },
        reminders: {
          orderBy: { dueAt: "asc" },
        },
      },
    });

    if (!application) {
      return response.status(404).json({ error: "ApplicationNotFound" });
    }

    return response.json(application);
  } catch (error) {
    return next(error);
  }
});

applicationsRoutes.patch("/:id", async (request, response, next) => {
  try {
    const body = updateApplicationBodySchema.parse(request.body);

    const company = body.companyName
      ? await prisma.company.upsert({
          where: { name: body.companyName },
          update: {},
          create: { name: body.companyName },
        })
      : null;

    const application = await prisma.jobApplication.update({
      where: { id: request.params.id },
      data: {
        companyId: company?.id,
        title: body.title,
        area: body.area,
        level: body.level,
        workMode: body.workMode,
        location: body.location,
        contractType: body.contractType,
        sourcePlatform: body.sourcePlatform,
        jobUrl: body.jobUrl,
        description: body.description,
        status: body.status,
        resumeVersionId: body.resumeVersionId,
        fitScore: body.fitScore,
        foundAt: body.foundAt,
        appliedAt: body.appliedAt,
        lastResponseAt: body.lastResponseAt,
        nextAction: body.nextAction,
        followUpAt: body.followUpAt,
        notes: body.notes,
      },
      include: {
        company: true,
        resumeVersion: true,
      },
    });

    return response.json(application);
  } catch (error) {
    return next(error);
  }
});

applicationsRoutes.delete("/:id", async (request, response, next) => {
  try {
    await prisma.jobApplication.delete({
      where: { id: request.params.id },
    });

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
});

const interactionBodySchema = z.object({
  type: z.enum(["MESSAGE", "EMAIL", "INTERVIEW", "TEST", "FEEDBACK", "NOTE"]).default("NOTE"),
  contactName: z.string().optional(),
  contactRole: z.string().optional(),
  contactUrl: z.string().url().optional(),
  happenedAt: z.coerce.date().optional(),
  description: z.string().min(1),
});

applicationsRoutes.post("/:id/interactions", async (request, response, next) => {
  try {
    const body = interactionBodySchema.parse(request.body);

    const interaction = await prisma.interaction.create({
      data: {
        applicationId: request.params.id,
        type: body.type,
        contactName: body.contactName,
        contactRole: body.contactRole,
        contactUrl: body.contactUrl,
        happenedAt: body.happenedAt,
        description: body.description,
      },
    });

    return response.status(201).json(interaction);
  } catch (error) {
    return next(error);
  }
});

const reminderBodySchema = z.object({
  title: z.string().min(1),
  dueAt: z.coerce.date(),
  done: z.boolean().default(false),
});

applicationsRoutes.post("/:id/reminders", async (request, response, next) => {
  try {
    const body = reminderBodySchema.parse(request.body);

    const reminder = await prisma.reminder.create({
      data: {
        applicationId: request.params.id,
        title: body.title,
        dueAt: body.dueAt,
        done: body.done,
      },
    });

    return response.status(201).json(reminder);
  } catch (error) {
    return next(error);
  }
});

