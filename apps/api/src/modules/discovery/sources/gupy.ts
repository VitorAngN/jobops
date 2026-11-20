import type { ApplicationLevel, WorkMode } from "@prisma/client";

import { guessLevel, parseDate, plainText } from "./normalize.js";
import { USER_AGENT, type ExternalJob, type JobSource } from "./types.js";

/**
 * Gupy: lê a página pública de busca (portal.gupy.io/job-search/term=...), que traz as
 * vagas no JSON do Next.js (__NEXT_DATA__). Uma página por termo, as mais recentes.
 */
type GupyJob = {
  id: number;
  name: string;
  description?: string;
  careerPageName: string;
  type?: string;
  publishedDate?: string;
  workplaceType?: string;
  city?: string;
  state?: string;
  jobUrl: string;
};

const WORKPLACE: Record<string, WorkMode> = { remote: "REMOTE", hybrid: "HYBRID", "on-site": "ONSITE" };

export function parseGupyPage(html: string): GupyJob[] {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error("Gupy: página sem __NEXT_DATA__ (o formato do site pode ter mudado)");
  const data = JSON.parse(match[1]);
  return data?.props?.pageProps?.initialJobList?.data ?? [];
}

export function mapGupyJob(job: GupyJob): ExternalJob {
  const level: ApplicationLevel = job.type === "vacancy_type_internship" ? "INTERNSHIP"
    : job.type === "vacancy_type_trainee" ? "TRAINEE"
    : guessLevel(job.name);
  return {
    source: "GUPY",
    externalId: String(job.id),
    title: job.name.trim(),
    company: job.careerPageName.trim(),
    location: [job.city, job.state].filter(Boolean).join(", ") || null,
    workMode: WORKPLACE[job.workplaceType ?? ""] ?? "UNKNOWN",
    level,
    url: job.jobUrl,
    description: plainText(job.description),
    publishedAt: parseDate(job.publishedDate),
  };
}

export const gupy: JobSource = {
  id: "GUPY",
  async search({ terms }, fetcher = fetch) {
    const jobs: ExternalJob[] = [];
    for (const term of terms) {
      const url = `https://portal.gupy.io/job-search/term=${encodeURIComponent(term)}`;
      const response = await fetcher(url, { headers: { "User-Agent": USER_AGENT } });
      if (!response.ok) throw new Error(`Gupy respondeu ${response.status} para "${term}"`);
      jobs.push(...parseGupyPage(await response.text()).map(mapGupyJob));
    }
    return jobs;
  },
};
