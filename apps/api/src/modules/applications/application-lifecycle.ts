import type { ApplicationCreateInput, ApplicationUpdateInput } from "./applications.schemas.js";

const responseStatuses = new Set([
  "TEST_SENT",
  "HR_INTERVIEW",
  "TECH_INTERVIEW",
  "WAITING_RESPONSE",
  "REJECTED",
  "OFFER",
]);

export function withLifecycleDefaults<T extends ApplicationCreateInput | ApplicationUpdateInput>(
  input: T,
  now = new Date(),
): T {
  const patch: ApplicationUpdateInput = {};

  if (input.status === "APPLIED" && !input.appliedAt) {
    patch.appliedAt = now;
  }

  if (input.status && responseStatuses.has(input.status) && !input.lastResponseAt) {
    patch.lastResponseAt = now;
  }

  return {
    ...input,
    ...patch,
  };
}

export const FOLLOW_UP_DAYS = 7;

/**
 * Ao aplicar pela primeira vez (saindo de "Salva"), agenda um follow-up em 7 dias,
 * a não ser que já tenha vindo uma data.
 */
export function withFollowUp<T extends ApplicationCreateInput | ApplicationUpdateInput>(
  input: T,
  previousStatus: string | null,
  now = new Date(),
): T {
  const firstApply = input.status === "APPLIED" && (previousStatus === null || previousStatus === "SAVED");
  if (!firstApply || input.followUpAt) return input;
  return {
    ...input,
    followUpAt: new Date(now.getTime() + FOLLOW_UP_DAYS * 86_400_000),
    nextAction: input.nextAction ?? "Mandar follow-up para o recrutador",
  };
}
