import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import type { ReminderListFilters, ReminderUpdateInput } from "./reminders.schemas.js";

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

function toWhere(filters: ReminderListFilters): Prisma.ReminderWhereInput {
  const now = new Date();
  const today = getTodayRange();

  return {
    done: filters.done,
    dueAt:
      filters.due === "overdue"
        ? { lt: now }
        : filters.due === "today"
          ? { gte: today.start, lt: today.end }
          : filters.due === "upcoming"
            ? { gt: now }
            : undefined,
  };
}

export const remindersRepository = {
  list(filters: ReminderListFilters) {
    return prisma.reminder.findMany({
      where: toWhere(filters),
      include: {
        application: {
          include: {
            company: true,
          },
        },
      },
      orderBy: [{ done: "asc" }, { dueAt: "asc" }],
    });
  },

  update(id: string, input: ReminderUpdateInput) {
    return prisma.reminder.update({
      where: { id },
      data: input,
    });
  },

  delete(id: string) {
    return prisma.reminder.delete({
      where: { id },
    });
  },
};
