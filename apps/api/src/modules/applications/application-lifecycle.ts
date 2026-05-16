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
