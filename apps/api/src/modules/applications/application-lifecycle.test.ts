import { describe, expect, it } from "vitest";

import { withLifecycleDefaults } from "./application-lifecycle.js";

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
