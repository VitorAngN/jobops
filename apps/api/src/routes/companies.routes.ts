import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../shared/http-errors.js";

export const companiesRoutes = Router();

const companyBodySchema = z.object({
  name: z.string().min(1),
  website: z.string().url().optional(),
  sector: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

companiesRoutes.get("/", async (_request, response, next) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return response.json(companies);
  } catch (error) {
    return next(error);
  }
});

companiesRoutes.post("/", async (request, response, next) => {
  try {
    const body = companyBodySchema.parse(request.body);

    const company = await prisma.company.create({
      data: body,
    });

    return response.status(201).json(company);
  } catch (error) {
    return next(error);
  }
});

companiesRoutes.get("/:id", async (request, response, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: request.params.id },
      include: {
        applications: {
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!company) {
      throw new NotFoundError("Company");
    }

    return response.json(company);
  } catch (error) {
    return next(error);
  }
});

companiesRoutes.patch("/:id", async (request, response, next) => {
  try {
    const body = companyBodySchema.partial().parse(request.body);

    const company = await prisma.company.update({
      where: { id: request.params.id },
      data: body,
    });

    return response.json(company);
  } catch (error) {
    return next(error);
  }
});

companiesRoutes.delete("/:id", async (request, response, next) => {
  try {
    await prisma.company.delete({
      where: { id: request.params.id },
    });

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
});
