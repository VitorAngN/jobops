import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { buildPaginationMeta, normalizePagination } from "../../shared/pagination.js";
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

function toOrderBy(filters: ApplicationListFilters): Prisma.JobApplicationOrderByWithRelationInput {
  switch (filters.sortBy) {
    case "companyName":
      return {
        company: {
          name: filters.sortOrder,
        },
      };
    case "appliedAt":
      return { appliedAt: filters.sortOrder };
    case "fitScore":
      return { fitScore: filters.sortOrder };
    case "title":
      return { title: filters.sortOrder };
    case "updatedAt":
    default:
      return { updatedAt: filters.sortOrder };
  }
}

export const applicationsRepository = {
  async list(filters: ApplicationListFilters) {
    const { page, pageSize, skip, take } = normalizePagination(filters);
    const where = toWhere(filters);

    const [total, data] = await prisma.$transaction([
      prisma.jobApplication.count({ where }),
      prisma.jobApplication.findMany({
        where,
        include: applicationListInclude,
        orderBy: toOrderBy(filters),
        skip,
        take,
      }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, page, pageSize),
    };
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

      const application = await tx.jobApplication.create({
        data: {
          ...applicationData,
          companyId: company.id,
        },
        include: applicationListInclude,
      });

      if (applicationData.followUpAt) {
        await tx.reminder.create({
          data: {
            applicationId: application.id,
            title: applicationData.nextAction ?? "Follow-up da candidatura",
            dueAt: applicationData.followUpAt,
          },
        });
      }

      return application;
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

      const application = await tx.jobApplication.update({
        where: { id },
        data: {
          ...applicationData,
          companyId: company?.id,
        },
        include: applicationListInclude,
      });

      if (applicationData.followUpAt) {
        const existingReminder = await tx.reminder.findFirst({
          where: {
            applicationId: application.id,
            dueAt: applicationData.followUpAt,
            done: false,
          },
        });

        if (!existingReminder) {
          await tx.reminder.create({
            data: {
              applicationId: application.id,
              title: applicationData.nextAction ?? "Follow-up da candidatura",
              dueAt: applicationData.followUpAt,
            },
          });
        }
      }

      return application;
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
