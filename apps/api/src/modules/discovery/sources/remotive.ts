import { guessLevel, parseDate, plainText } from "./normalize.js";
import { USER_AGENT, type ExternalJob, type JobSource } from "./types.js";

/** Remotive: API pública de vagas remotas internacionais (pedem no máximo 4 chamadas por dia). */
type RemotiveJob = { id: number; title: string; company_name: string; url: string; candidate_required_location?: string; description?: string; publication_date?: string };

export const remotive: JobSource = {
  id: "REMOTIVE",
  async search({ terms }, fetcher = fetch) {
    const response = await fetcher("https://remotive.com/api/remote-jobs?category=software-development", {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!response.ok) throw new Error(`Remotive respondeu ${response.status}`);
    const data = (await response.json()) as { jobs?: RemotiveJob[] };
    void terms; // a Remotive devolve a categoria inteira; quem filtra é a pontuação
    return (data.jobs ?? []).map((j): ExternalJob => ({
      source: "REMOTIVE",
      externalId: String(j.id),
      title: j.title,
      company: j.company_name,
      location: j.candidate_required_location ?? "Remoto",
      workMode: "REMOTE",
      level: guessLevel(j.title),
      url: j.url,
      description: plainText(j.description),
      publishedAt: parseDate(j.publication_date),
    }));
  },
};
