import { guessLevel, guessWorkMode, parseDate, plainText } from "./normalize.js";
import { USER_AGENT, type ExternalJob, type JobSource } from "./types.js";

/**
 * Comunidades brasileiras que publicam vagas como issues no GitHub.
 * Quem publica usa um modelo com etiquetas (nível, modalidade, tecnologias).
 */
export const COMMUNITY_REPOS = [
  "backend-br/vagas",
  "frontendbr/vagas",
  "react-brasil/vagas",
  "DevOps-Brasil/vagas",
  "soujava/vagas-java",
  "qa-brasil/vagas",
  "androiddevbr/vagas",
];

type Issue = {
  number: number;
  title: string;
  html_url: string;
  body?: string | null;
  created_at: string;
  labels: { name: string }[];
  pull_request?: unknown;
};

/** "[Remoto] Dev Back-end na Empresa X" → "Empresa X"; sem padrão, usa o nome da comunidade. */
const NOISE = /^(remoto|remote|h[ií]brido|presencial|clt|pj|est[aá]gio|j[uú]nior|pleno|s[eê]nior|brasil)(\s+(remoto|clt|pj|h[ií]brido))*$/i;
/** "Curitiba/PR", "São Paulo, SP" */
const CITY_UF = /^[\p{L} ]+[\/,]\s?(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/u;

export function companyFromTitle(title: string, repo: string) {
  const clean = title.replace(/\[[^\]]*\]/g, "").trim();
  const na = clean.match(/\s(?:na|no|@|at)\s+([^|()\-–]+)$/i)?.[1]?.trim();
  if (na && na.length <= 60) return na;
  const parts = clean.split(/\s[-–|\/]\s/).map((p) => p.trim());
  const candidate = parts.slice(1).find((p) => p && !NOISE.test(p) && !CITY_UF.test(p));
  return candidate && candidate.length <= 60 ? candidate : repo.split("/")[0];
}

export function mapIssue(issue: Issue, repo: string): ExternalJob {
  const labels = issue.labels.map((l) => l.name).join(" ");
  const fromTitle = guessLevel(issue.title);
  return {
    source: "GITHUB",
    externalId: `${repo}#${issue.number}`,
    title: issue.title.trim(),
    company: companyFromTitle(issue.title, repo),
    location: issue.title.match(/^\[([^\]]+)\]/)?.[1] ?? null,
    workMode: guessWorkMode(`${labels} ${issue.title}`),
    level: fromTitle !== "UNKNOWN" ? fromTitle : guessLevel(labels),
    url: issue.html_url,
    description: plainText(`${labels ? `Etiquetas: ${issue.labels.map((l) => l.name).join(", ")}\n` : ""}${issue.body ?? ""}`),
    publishedAt: parseDate(issue.created_at),
  };
}

export const github: JobSource = {
  id: "GITHUB",
  async search(_input, fetcher = fetch) {
    const token = process.env.GITHUB_TOKEN;
    const jobs: ExternalJob[] = [];
    const errors: string[] = [];
    for (const repo of COMMUNITY_REPOS) {
      const response = await fetcher(`https://api.github.com/repos/${repo}/issues?state=open&sort=created&per_page=50`, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/vnd.github+json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        errors.push(`${repo} (${response.status})`);
        continue;
      }
      const issues = (await response.json()) as Issue[];
      jobs.push(...issues.filter((i) => !i.pull_request).map((i) => mapIssue(i, repo)));
    }
    if (jobs.length === 0 && errors.length) throw new Error(`GitHub não respondeu: ${errors.join(", ")}`);
    return jobs;
  },
};
