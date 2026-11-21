import { fold, guessLevel, parseDate, plainText } from "./normalize.js";
import { USER_AGENT, type ExternalJob, type JobSource } from "./types.js";

/**
 * Himalayas: API pública e gratuita de vagas remotas (himalayas.app/jobs/api/search).
 * Filtra por vagas abertas a quem está no Brasil. A busca devolve até 20 por termo.
 */
type HimalayasJob = {
  guid: string;
  title: string;
  companyName: string;
  seniority?: string[];
  employmentType?: string;
  locationRestrictions?: string[];
  description?: string;
  excerpt?: string;
  pubDate?: number | string;
  applicationLink: string;
};

/** Termos em português ("estágio devops") viram a parte que serve em inglês ("devops"). */
export function himalayasQuery(term: string) {
  return fold(term).replace(/\b(estagio|estagiario|estagiaria|vaga|vagas|de|em)\b/g, " ").replace(/\s+/g, " ").trim();
}

export const himalayas: JobSource = {
  id: "HIMALAYAS",
  async search({ terms }, fetcher = fetch) {
    const queries = [...new Set(terms.map(himalayasQuery).filter(Boolean))];
    const jobs: ExternalJob[] = [];
    for (const q of queries) {
      const url = `https://himalayas.app/jobs/api/search?q=${encodeURIComponent(q)}&country=Brazil&sort=recent`;
      const response = await fetcher(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
      if (!response.ok) throw new Error(`Himalayas respondeu ${response.status}`);
      const data = (await response.json()) as { jobs?: HimalayasJob[] };
      for (const j of data.jobs ?? []) {
        const seniority = (j.seniority ?? []).join(" ");
        const places = j.locationRestrictions ?? [];
        jobs.push({
          source: "HIMALAYAS",
          externalId: j.guid,
          title: j.title,
          company: j.companyName,
          location: places.length === 0 ? "Remoto (qualquer país)" : places.length > 3 ? "Remoto (vários países, inclui Brasil)" : `Remoto (${places.join(", ")})`,
          workMode: "REMOTE",
          level: /intern/i.test(`${seniority} ${j.employmentType ?? ""}`) ? "INTERNSHIP" : guessLevel(`${j.title} ${seniority}`),
          url: j.applicationLink,
          description: plainText(j.description ?? j.excerpt),
          publishedAt: parseDate(typeof j.pubDate === "number" ? j.pubDate * 1000 : j.pubDate),
        });
      }
    }
    return jobs;
  },
};
