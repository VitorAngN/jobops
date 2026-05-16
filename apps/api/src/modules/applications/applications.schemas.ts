import { z } from "zod";

export const areaSchema = z.enum(["BACKEND", "DEVOPS", "CLOUD", "FULLSTACK", "FRONTEND", "DATA", "SECURITY", "OTHER"]);
export const levelSchema = z.enum(["INTERNSHIP", "TRAINEE", "JUNIOR", "MID", "SENIOR", "UNKNOWN"]);
export const workModeSchema = z.enum(["REMOTE", "HYBRID", "ONSITE", "UNKNOWN"]);
export const contractTypeSchema = z.enum(["INTERNSHIP", "CLT", "PJ", "TEMPORARY", "OTHER", "UNKNOWN"]);
export const sourcePlatformSchema = z.enum([
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
export const statusSchema = z.enum([
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

export const applicationBodySchema = z.object({
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

export const updateApplicationBodySchema = applicationBodySchema.partial();

export const listApplicationsQuerySchema = z.object({
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

export const interactionBodySchema = z.object({
  type: z.enum(["MESSAGE", "EMAIL", "INTERVIEW", "TEST", "FEEDBACK", "NOTE"]).default("NOTE"),
  contactName: z.string().optional(),
  contactRole: z.string().optional(),
  contactUrl: z.string().url().optional(),
  happenedAt: z.coerce.date().optional(),
  description: z.string().min(1),
});

export const updateInteractionBodySchema = interactionBodySchema.partial();

export const reminderBodySchema = z.object({
  title: z.string().min(1),
  dueAt: z.coerce.date(),
  done: z.boolean().default(false),
});

export type ApplicationCreateInput = z.infer<typeof applicationBodySchema>;
export type ApplicationUpdateInput = z.infer<typeof updateApplicationBodySchema>;
export type ApplicationListFilters = z.infer<typeof listApplicationsQuerySchema>;
export type InteractionCreateInput = z.infer<typeof interactionBodySchema>;
export type InteractionUpdateInput = z.infer<typeof updateInteractionBodySchema>;
export type ReminderCreateInput = z.infer<typeof reminderBodySchema>;
