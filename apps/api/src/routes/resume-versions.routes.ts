import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";

export const resumeVersionsRoutes = Router();

const resumeVersionBodySchema = z.object({
  name: z.string().min(1),
  language: z.enum(["PT_BR", "EN", "ES"]).default("PT_BR"),
  focus: z.enum(["BACKEND", "DEVOPS", "CLOUD", "FULLSTACK", "GENERAL"]).default("GENERAL"),
  fileUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

resumeVersionsRoutes.get("/", async (_request, response, next) => {
  try {
    const resumeVersions = await prisma.resumeVersion.findMany({
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return response.json(resumeVersions);
  } catch (error) {
    return next(error);
  }
});

resumeVersionsRoutes.post("/", async (request, response, next) => {
  try {
    const body = resumeVersionBodySchema.parse(request.body);

    const resumeVersion = await prisma.resumeVersion.create({
      data: body,
    });

    return response.status(201).json(resumeVersion);
  } catch (error) {
    return next(error);
  }
});

resumeVersionsRoutes.patch("/:id", async (request, response, next) => {
  try {
    const body = resumeVersionBodySchema.partial().parse(request.body);

    const resumeVersion = await prisma.resumeVersion.update({
      where: { id: request.params.id },
      data: body,
    });

    return response.json(resumeVersion);
  } catch (error) {
    return next(error);
  }
});

resumeVersionsRoutes.delete("/:id", async (request, response, next) => {
  try {
    await prisma.resumeVersion.delete({
      where: { id: request.params.id },
    });

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
});

