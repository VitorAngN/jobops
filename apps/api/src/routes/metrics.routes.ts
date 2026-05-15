import { Router } from "express";
import { ApplicationStatus } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

export const metricsRoutes = Router();

const responseStatuses: ApplicationStatus[] = [
  "TEST_SENT",
  "HR_INTERVIEW",
  "TECH_INTERVIEW",
  "WAITING_RESPONSE",
  "REJECTED",
  "OFFER",
];
const interviewStatuses: ApplicationStatus[] = ["HR_INTERVIEW", "TECH_INTERVIEW", "OFFER"];

metricsRoutes.get("/summary", async (_request, response, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [total, appliedLast7Days, responded, interviews, pendingFollowUps] = await Promise.all([
      prisma.jobApplication.count(),
      prisma.jobApplication.count({
        where: {
          appliedAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      prisma.jobApplication.count({
        where: {
          status: {
            in: responseStatuses,
          },
        },
      }),
      prisma.jobApplication.count({
        where: {
          status: {
            in: interviewStatuses,
          },
        },
      }),
      prisma.reminder.count({
        where: {
          done: false,
          dueAt: {
            lte: new Date(),
          },
        },
      }),
    ]);

    return response.json({
      total,
      appliedLast7Days,
      responded,
      interviews,
      pendingFollowUps,
      responseRate: total > 0 ? Number(((responded / total) * 100).toFixed(2)) : 0,
      interviewRate: total > 0 ? Number(((interviews / total) * 100).toFixed(2)) : 0,
    });
  } catch (error) {
    return next(error);
  }
});

metricsRoutes.get("/by-status", async (_request, response, next) => {
  try {
    const result = await prisma.jobApplication.groupBy({
      by: ["status"],
      _count: { status: true },
      orderBy: { status: "asc" },
    });

    return response.json(result.map((item) => ({ status: item.status, total: item._count.status })));
  } catch (error) {
    return next(error);
  }
});

metricsRoutes.get("/by-area", async (_request, response, next) => {
  try {
    const result = await prisma.jobApplication.groupBy({
      by: ["area"],
      _count: { area: true },
      orderBy: { area: "asc" },
    });

    return response.json(result.map((item) => ({ area: item.area, total: item._count.area })));
  } catch (error) {
    return next(error);
  }
});

metricsRoutes.get("/by-platform", async (_request, response, next) => {
  try {
    const result = await prisma.jobApplication.groupBy({
      by: ["sourcePlatform"],
      _count: { sourcePlatform: true },
      orderBy: { sourcePlatform: "asc" },
    });

    return response.json(result.map((item) => ({ platform: item.sourcePlatform, total: item._count.sourcePlatform })));
  } catch (error) {
    return next(error);
  }
});

metricsRoutes.get("/by-resume", async (_request, response, next) => {
  try {
    const result = await prisma.jobApplication.groupBy({
      by: ["resumeVersionId"],
      _count: { resumeVersionId: true },
      where: {
        resumeVersionId: {
          not: null,
        },
      },
    });

    const resumeIds = result.map((item) => item.resumeVersionId).filter(Boolean) as string[];
    const resumes = await prisma.resumeVersion.findMany({
      where: { id: { in: resumeIds } },
    });

    return response.json(
      result.map((item) => ({
        resumeVersionId: item.resumeVersionId,
        resumeName: resumes.find((resume) => resume.id === item.resumeVersionId)?.name ?? "Unknown",
        total: item._count.resumeVersionId,
      })),
    );
  } catch (error) {
    return next(error);
  }
});
