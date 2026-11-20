import { guessLevel, guessWorkMode, parseDate, plainText } from "./normalize.js";
import { USER_AGENT, type ExternalJob, type JobSource } from "./types.js";

/**
 * Greenhouse, Lever e Ashby têm APIs públicas oficiais com as vagas de cada empresa.
 * Aqui só entram as empresas que você acompanha; o filtro por termo é feito na pontuação.
 */
async function getJson(fetcher: typeof fetch, url: string) {
  const response = await fetcher(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  if (!response.ok) throw new Error(`${new URL(url).hostname} respondeu ${response.status}`);
  return response.json();
}

type GreenhouseJob = { id: number; title: string; absolute_url: string; location?: { name?: string }; content?: string; first_published?: string; updated_at?: string; company_name?: string };

export const greenhouse: JobSource = {
  id: "GREENHOUSE",
  async search({ companies }, fetcher = fetch) {
    const jobs: ExternalJob[] = [];
    for (const company of companies) {
      const data = await getJson(fetcher, `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(company.slug)}/jobs?content=true`);
      for (const j of (data.jobs ?? []) as GreenhouseJob[]) {
        const location = j.location?.name ?? null;
        jobs.push({
          source: "GREENHOUSE",
          externalId: `${company.slug}:${j.id}`,
          title: j.title,
          company: j.company_name ?? company.name,
          location,
          workMode: guessWorkMode(location),
          level: guessLevel(j.title),
          url: j.absolute_url,
          description: plainText(j.content?.replace(/&lt;/g, "<").replace(/&gt;/g, ">")),
          publishedAt: parseDate(j.first_published ?? j.updated_at),
        });
      }
    }
    return jobs;
  },
};

type LeverJob = { id: string; text: string; hostedUrl: string; categories?: { location?: string; commitment?: string }; workplaceType?: string; descriptionPlain?: string; createdAt?: number };

export const lever: JobSource = {
  id: "LEVER",
  async search({ companies }, fetcher = fetch) {
    const jobs: ExternalJob[] = [];
    for (const company of companies) {
      const data = (await getJson(fetcher, `https://api.lever.co/v0/postings/${encodeURIComponent(company.slug)}?mode=json`)) as LeverJob[];
      for (const j of data) {
        const location = j.categories?.location ?? null;
        jobs.push({
          source: "LEVER",
          externalId: `${company.slug}:${j.id}`,
          title: j.text,
          company: company.name,
          location,
          workMode: j.workplaceType === "remote" ? "REMOTE" : j.workplaceType === "hybrid" ? "HYBRID" : j.workplaceType === "onsite" ? "ONSITE" : guessWorkMode(location),
          level: j.categories?.commitment?.toLowerCase().includes("intern") ? "INTERNSHIP" : guessLevel(j.text),
          url: j.hostedUrl,
          description: plainText(j.descriptionPlain),
          publishedAt: parseDate(j.createdAt),
        });
      }
    }
    return jobs;
  },
};

type AshbyJob = { id: string; title: string; jobUrl: string; location?: string; isRemote?: boolean; workplaceType?: string; employmentType?: string; descriptionPlain?: string; publishedAt?: string };

export const ashby: JobSource = {
  id: "ASHBY",
  async search({ companies }, fetcher = fetch) {
    const jobs: ExternalJob[] = [];
    for (const company of companies) {
      const data = await getJson(fetcher, `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(company.slug)}`);
      for (const j of (data.jobs ?? []) as AshbyJob[]) {
        jobs.push({
          source: "ASHBY",
          externalId: `${company.slug}:${j.id}`,
          title: j.title,
          company: company.name,
          location: j.location ?? null,
          workMode: j.isRemote || j.workplaceType === "Remote" ? "REMOTE" : j.workplaceType === "Hybrid" ? "HYBRID" : guessWorkMode(j.location),
          level: j.employmentType === "Intern" ? "INTERNSHIP" : guessLevel(j.title),
          url: j.jobUrl,
          description: plainText(j.descriptionPlain),
          publishedAt: parseDate(j.publishedAt),
        });
      }
    }
    return jobs;
  },
};
