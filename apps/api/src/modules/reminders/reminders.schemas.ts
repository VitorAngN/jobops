import { z } from "zod";

export const listRemindersQuerySchema = z.object({
  done: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  due: z.enum(["overdue", "today", "upcoming"]).optional(),
});

export const updateReminderBodySchema = z.object({
  title: z.string().min(1).optional(),
  dueAt: z.coerce.date().optional(),
  done: z.boolean().optional(),
});

export type ReminderListFilters = z.infer<typeof listRemindersQuerySchema>;
export type ReminderUpdateInput = z.infer<typeof updateReminderBodySchema>;
