import { describe, expect, it, vi } from "vitest";

import { smartrecruiters } from "./ats.js";
import { COMMUNITY_REPOS, companyFromTitle, github, mapIssue } from "./github.js";
import { himalayas, himalayasQuery } from "./himalayas.js";
import { readMcpResponse, solides } from "./solides.js";

const json = (body: unknown, headers: Record<string, string> = {}) => new Response(JSON.stringify(body), { status: 200, headers });

describe("Sólides (MCP)", () => {
  it("lê resposta em SSE", () => {
    expect(readMcpResponse('event: message\ndata: {"jsonrpc":"2.0","id":1,"result":{"ok":true}}\n')).toEqual({ ok: true });
  });

  it("abre sessão, chama buscar_vagas e normaliza", async () => {
    const vagas = { vagas: [{ id: "9", titulo: "Estágio em TI", empresa: "Acme", local: "Londrina/PR", modalidade: "hibrido", senioridade: "Estagiário", contrato: "Estágio", habilidades: "Linux, Redes", link_candidatura: "https://acme.vagas.solides.com.br/vaga/9", publicado_em: "2026-11-20" }] };
    const calls: any[] = [];
    const fetcher = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      calls.push({ body, session: (init.headers as Record<string, string>)["Mcp-Session-Id"] });
      if (body.method === "initialize") return json({ jsonrpc: "2.0", id: 1, result: {} }, { "mcp-session-id": "abc" });
      if (body.method === "notifications/initialized") return new Response("", { status: 202 });
      return new Response(`event: message\ndata: ${JSON.stringify({ jsonrpc: "2.0", id: body.id, result: { content: [{ type: "text", text: JSON.stringify(vagas) }] } })}\n`);
    });
    const [job] = await solides.search({ terms: ["estágio ti"], companies: [] }, fetcher as unknown as typeof fetch);
    expect(calls[2]).toMatchObject({ session: "abc", body: { method: "tools/call", params: { name: "buscar_vagas", arguments: { title: "estágio ti" } } } });
    expect(job).toMatchObject({ source: "SOLIDES", externalId: "9", level: "INTERNSHIP", workMode: "HYBRID", location: "Londrina/PR" });
    expect(job.description).toContain("Linux, Redes");
  });
});

describe("Himalayas", () => {
  it("tira palavras em português que não ajudam na busca em inglês", () => {
    expect(himalayasQuery("estágio devops")).toBe("devops");
    expect(himalayasQuery("estágio back-end")).toBe("back-end");
  });

  it("filtra Brasil e marca remoto", async () => {
    const fetcher = vi.fn(async () => json({ jobs: [{ guid: "g1", title: "DevOps Intern", companyName: "X", seniority: ["Entry-level"], employmentType: "Intern", locationRestrictions: ["Brazil"], applicationLink: "https://h/1", pubDate: 1763600000 }] }));
    const [job] = await himalayas.search({ terms: ["estágio devops", "estagio devops"], companies: [] }, fetcher as unknown as typeof fetch);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(String(fetcher.mock.calls[0][0])).toContain("country=Brazil");
    expect(job).toMatchObject({ level: "INTERNSHIP", workMode: "REMOTE", location: "Remoto (Brazil)" });
  });
});

describe("GitHub (comunidades)", () => {
  it("acha a empresa no título", () => {
    expect(companyFromTitle("[Remoto] Desenvolvedor(a) Back-end na JotPsych", "backend-br/vagas")).toBe("JotPsych");
    expect(companyFromTitle("DevOps Pleno - Fundação SDTP - Remoto CLT", "DevOps-Brasil/vagas")).toBe("Fundação SDTP");
    expect(companyFromTitle("DevOps Engineer (Sênior) / Proativa RH - São Paulo", "DevOps-Brasil/vagas")).toBe("Proativa RH");
    expect(companyFromTitle("[SP] Vaga legal", "backend-br/vagas")).toBe("backend-br");
  });

  it("usa etiquetas para nível e modalidade", () => {
    const job = mapIssue({ number: 7, title: "[Remoto] Dev Back-end na Acme", html_url: "https://github.com/x/7", created_at: "2026-11-20T00:00:00Z", labels: [{ name: "Júnior" }, { name: "Remoto" }, { name: "Python" }] }, "backend-br/vagas");
    expect(job).toMatchObject({ externalId: "backend-br/vagas#7", level: "JUNIOR", workMode: "REMOTE", location: "Remoto" });
  });

  it("ignora pull requests e segue se um repositório falhar", async () => {
    const fetcher = vi.fn(async (url: string) =>
      url.includes("backend-br")
        ? json([{ number: 1, title: "Vaga", html_url: "u", created_at: "2026-11-20", labels: [] }, { number: 2, title: "PR", html_url: "u", created_at: "2026-11-20", labels: [], pull_request: {} }])
        : new Response("", { status: 403 }),
    );
    const jobs = await github.search({ terms: [], companies: [] }, fetcher as unknown as typeof fetch);
    expect(fetcher).toHaveBeenCalledTimes(COMMUNITY_REPOS.length);
    expect(jobs).toHaveLength(1);
  });
});

describe("SmartRecruiters", () => {
  it("monta link e modalidade", async () => {
    const fetcher = async () => json({ content: [{ id: "55", name: "Software Engineering Intern", location: { city: "Curitiba", country: "br", remote: false, hybrid: true }, experienceLevel: { label: "Internship" } }] });
    const [job] = await smartrecruiters.search({ terms: [], companies: [{ slug: "Acme", name: "Acme" }] }, fetcher as unknown as typeof fetch);
    expect(job).toMatchObject({ url: "https://jobs.smartrecruiters.com/Acme/55", workMode: "HYBRID", level: "INTERNSHIP", location: "Curitiba, BR" });
  });
});
