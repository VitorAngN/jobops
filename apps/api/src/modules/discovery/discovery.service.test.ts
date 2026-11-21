import { describe, expect, it, vi } from "vitest";

import { runDiscovery } from "./discovery.service.js";

/** Banco falso com o mínimo que runDiscovery usa. */
function fakeDb(profiles: unknown[]) {
  const saved: unknown[] = [];
  return {
    saved,
    db: {
      discoveryRun: { create: vi.fn(async () => ({ id: "run" })), update: vi.fn(async () => ({})) },
      searchProfile: { findMany: vi.fn(async () => profiles) },
      discoveredJob: {
        createMany: vi.fn(async ({ data }: { data: unknown[] }) => { saved.push(...data); return { count: data.length }; }),
        updateMany: vi.fn(async () => ({ count: 0 })),
      },
    },
  };
}

const profile = (name: string) => ({
  id: name, name, active: true, area: "BACKEND", terms: ["x"], keywords: [], excludeWords: [], locations: [],
  acceptRemote: true, sources: ["REMOTIVE"], minScore: 0, companies: [],
});

describe("runDiscovery", () => {
  it("chama a Remotive uma vez só mesmo com várias buscas", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ jobs: [{ id: 1, title: "Backend Intern", company_name: "A", url: "https://r/1" }] })));
    const { db, saved } = fakeDb([profile("A"), profile("B")]);
    const r = await runDiscovery(db as never, { trigger: "teste", fetcher: fetcher as unknown as typeof fetch });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(r.found).toBe(2);
    expect(saved).toHaveLength(2);
  });

  it("registra o erro de uma fonte e segue com as outras", async () => {
    const fetcher = vi.fn(async () => new Response("", { status: 503 }));
    const { db } = fakeDb([profile("A")]);
    const r = await runDiscovery(db as never, { trigger: "teste", fetcher: fetcher as unknown as typeof fetch });
    expect(r.errors[0]).toContain("Remotive respondeu 503");
  });
});
