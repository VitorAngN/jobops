import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import type {
  ApplicationCreateInput,
  ApplicationListFilters,
  ApplicationUpdateInput,
  InteractionCreateInput,
  InteractionUpdateInput,
  ReminderCreateInput,
} from "./applications.schemas.js";

const applicationListInclude = {
  company: true,
  resumeVersion: true,
  _count: {
    select: {
      interactions: true,
      reminders: true,
    },
  },
} satisfies Prisma.JobApplicationInclude;

const applicationDetailInclude = {
  company: true,
  resumeVersion: true,
  interactions: {
    orderBy: { happenedAt: "desc" },
  },
  reminders: {
    orderBy: { dueAt: "asc" },
  },
} satisfies Prisma.JobApplicationInclude;

function toWhere(filters: ApplicationListFilters): Prisma.JobApplicationWhereInput {
  return {
    status: filters.status,
    area: filters.area,
    level: filters.level,
    workMode: filters.workMode,
    sourcePlatform: filters.sourcePlatform,
    resumeVersionId: filters.resumeVersionId,
    appliedAt:
      filters.appliedFrom || filters.appliedTo
        ? {
            gte: filters.appliedFrom,
            lte: filters.appliedTo,
          }
        : undefined,
    OR: filters.search
      ? [
          { title: { contains: filters.search, mode: "insensitive" } },
          { company: { name: { contains: filters.search, mode: "insensitive" } } },
        ]
      : undefined,
  };
}

export const applicationsRepository = {
  list(filters: ApplicationListFilters) {
    return prisma.jobApplication.findMany({
      where: toWhere(filters),
      include: applicationListInclude,
      orderBy: {
        updatedAt: "desc",
      },
    });
  },

  findById(id: string) {
    return prisma.jobApplication.findUnique({
      where: { id },
      include: applicationDetailInclude,
    });
  },

  create(input: ApplicationCreateInput) {
    const { companyName, ...applicationData } = input;

    return prisma.$transaction(async (tx) => {
      const company = await tx.company.upsert({
        where: { name: companyName },
        update: {},
        create: { name: companyName },
      });

      return tx.jobApplication.create({
        data: {
          ...applicationData,
          companyId: company.id,
        },
        include: applicationListInclude,
      });
    });
  },

  update(id: string, input: ApplicationUpdateInput) {
    const { companyName, ...applicationData } = input;

    return prisma.$transaction(async (tx) => {
      const company = companyName
        ? await tx.company.upsert({
            where: { name: companyName },
            update: {},
            create: { name: companyName },
          })
        : null;

      return tx.jobApplication.update({
        where: { id },
        data: {
          ...applicationData,
          companyId: company?.id,
        },
        include: applicationListInclude,
      });
    });
  },

  delete(id: string) {
    return prisma.jobApplication.delete({
      where: { id },
    });
  },

  listInteractions(applicationId: string) {
    return prisma.interaction.findMany({
      where: { applicationId },
      orderBy: { happenedAt: "desc" },
    });
  },

  createInteraction(applicationId: string, input: InteractionCreateInput) {
    return prisma.interaction.create({
      data: {
        ...input,
        applicationId,
      },
    });
  },

  updateInteraction(id: string, input: InteractionUpdateInput) {
    return prisma.interaction.update({
      where: { id },
      data: input,
    });
  },

  deleteInteraction(id: string) {
    return prisma.interaction.delete({
      where: { id },
    });
  },

  createReminder(applicationId: string, input: ReminderCreateInput) {
    return prisma.reminder.create({
      data: {
        ...input,
        applicationId,
      },
    });
  },
};
