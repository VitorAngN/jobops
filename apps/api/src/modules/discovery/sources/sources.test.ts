import { describe, expect, it, vi } from "vitest";

import { ashby, greenhouse, lever } from "./ats.js";
import { gupy, parseGupyPage } from "./gupy.js";
import { guessLevel } from "./normalize.js";
import { remotive } from "./remotive.js";

const jsonResponse = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

describe("Gupy", () => {
  const page = (data: unknown[]) =>
    `<html><script id="__NEXT_DATA__" type="application/json" nonce="abc">${JSON.stringify({
      props: { pageProps: { initialJobList: { data, pagination: { total: data.length } } } },
    })}</script></html>`;

  it("lê as vagas do __NEXT_DATA__ mesmo com nonce", () => {
    expect(parseGupyPage(page([{ id: 1 }]))).toHaveLength(1);
  });

  it("avisa quando o formato da página muda", () => {
    expect(() => parseGupyPage("<html></html>")).toThrow(/__NEXT_DATA__/);
  });

  it("normaliza estágio, modalidade e local", async () => {
    const fetcher = vi.fn(async () =>
      new Response(page([{ id: 9, name: " Estágio Dev ", careerPageName: "PUCPR", type: "vacancy_type_internship", workplaceType: "hybrid", city: "Curitiba", state: "Paraná", jobUrl: "https://x.gupy.io/jobs/9", publishedDate: "2026-11-19T10:00:00Z", description: "<p>Java&nbsp;e SQL</p>" }])),
    );
    const [job] = await gupy.search({ terms: ["estágio desenvolvimento"], companies: [] }, fetcher as unknown as typeof fetch);
    expect(fetcher.mock.calls[0][0]).toBe("https://portal.gupy.io/job-search/term=est%C3%A1gio%20desenvolvimento");
    expect(job).toMatchObject({ externalId: "9", title: "Estágio Dev", company: "PUCPR", level: "INTERNSHIP", workMode: "HYBRID", location: "Curitiba, Paraná", description: "Java e SQL" });
  });
});

describe("Greenhouse, Lever e Ashby", () => {
  const companies = [{ slug: "acme", name: "Acme" }];

  it("Greenhouse prefixa o id com a empresa", async () => {
    const fetcher = async () => jsonResponse({ jobs: [{ id: 5, title: "Software Engineering Intern", absolute_url: "https://g/5", location: { name: "Remote - Brazil" } }] });
    const [job] = await greenhouse.search({ terms: [], companies }, fetcher as unknown as typeof fetch);
    expect(job).toMatchObject({ externalId: "acme:5", level: "INTERNSHIP", workMode: "REMOTE", company: "Acme" });
  });

  it("Lever usa workplaceType e commitment", async () => {
    const fetcher = async () => jsonResponse([{ id: "a", text: "Backend Developer", hostedUrl: "https://l/a", workplaceType: "remote", categories: { commitment: "Internship" } }]);
    const [job] = await lever.search({ terms: [], companies }, fetcher as unknown as typeof fetch);
    expect(job).toMatchObject({ externalId: "acme:a", level: "INTERNSHIP", workMode: "REMOTE" });
  });

  it("Ashby marca remoto por isRemote", async () => {
    const fetcher = async () => jsonResponse({ jobs: [{ id: "z", title: "Junior Backend Engineer", jobUrl: "https://a/z", isRemote: true }] });
    const [job] = await ashby.search({ terms: [], companies }, fetcher as unknown as typeof fetch);
    expect(job).toMatchObject({ level: "JUNIOR", workMode: "REMOTE" });
  });

  it("propaga erro HTTP com o nome do site", async () => {
    const fetcher = async () => new Response("", { status: 404 });
    await expect(lever.search({ terms: [], companies }, fetcher as unknown as typeof fetch)).rejects.toThrow("api.lever.co respondeu 404");
  });
});

describe("Remotive", () => {
  it("toda vaga é remota", async () => {
    const fetcher = async () => jsonResponse({ jobs: [{ id: 3, title: "Senior Data Engineer", company_name: "X", url: "https://r/3" }] });
    const [job] = await remotive.search({ terms: [], companies: [] }, fetcher as unknown as typeof fetch);
    expect(job).toMatchObject({ workMode: "REMOTE", level: "SENIOR", location: "Remoto" });
  });
});

describe("guessLevel", () => {
  it.each([
    ["Estagiário de TI", "INTERNSHIP"],
    ["Programa Trainee 2027", "TRAINEE"],
    ["Desenvolvedor Jr.", "JUNIOR"],
    ["Analista Pleno", "MID"],
    ["Tech Lead", "SENIOR"],
    ["Desenvolvedor", "UNKNOWN"],
  ])("%s → %s", (title, level) => {
    expect(guessLevel(title)).toBe(level);
  });
});
