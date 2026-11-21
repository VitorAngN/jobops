import { describe, expect, it } from "vitest";

import { withFollowUp, withLifecycleDefaults } from "./application-lifecycle.js";

describe("application lifecycle", () => {
  it("sets appliedAt when status changes to applied", () => {
    const now = new Date("2026-05-15T12:00:00.000Z");

    expect(withLifecycleDefaults({ status: "APPLIED" }, now)).toEqual({
      status: "APPLIED",
      appliedAt: now,
    });
  });

  it("sets lastResponseAt when status means the company responded", () => {
    const now = new Date("2026-05-15T12:00:00.000Z");

    expect(withLifecycleDefaults({ status: "HR_INTERVIEW" }, now)).toEqual({
      status: "HR_INTERVIEW",
      lastResponseAt: now,
    });
  });

  it("does not override explicit dates", () => {
    const now = new Date("2026-05-15T12:00:00.000Z");
    const appliedAt = new Date("2026-05-01T12:00:00.000Z");

    expect(withLifecycleDefaults({ status: "APPLIED", appliedAt }, now)).toEqual({
      status: "APPLIED",
      appliedAt,
    });
  });
});

describe("follow-up automático", () => {
  const now = new Date("2026-11-21T12:00:00Z");

  it("agenda 7 dias depois ao sair de Salva para Aplicada", () => {
    const r = withFollowUp({ status: "APPLIED" }, "SAVED", now);
    expect(r.followUpAt).toEqual(new Date("2026-11-28T12:00:00Z"));
    expect(r.nextAction).toContain("follow-up");
  });

  it("não agenda de novo quando já estava em outro status", () => {
    expect(withFollowUp({ status: "APPLIED" }, "IN_REVIEW", now).followUpAt).toBeUndefined();
  });

  it("respeita a data escolhida", () => {
    const d = new Date("2026-12-01T00:00:00Z");
    expect(withFollowUp({ status: "APPLIED", followUpAt: d }, "SAVED", now).followUpAt).toBe(d);
  });
});
