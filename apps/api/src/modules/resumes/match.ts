import { fold } from "../discovery/sources/normalize.js";
import { SKILLS, type Skill } from "./skills.js";

const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

/** Regex de cada competência, montada uma vez. Bordas aceitam pontuação (c#, .net, ci/cd). */
const PATTERNS = SKILLS.map((skill) => ({
  skill,
  re: new RegExp(`(^|[^a-z0-9+#.])(${skill.aliases.map((a) => escape(fold(a))).join("|")})(?=$|[^a-z0-9+#])`),
}));

/** Competências citadas num texto. */
export function extractSkills(text: string): Skill[] {
  const t = fold(text);
  return PATTERNS.filter(({ re }) => re.test(t)).map(({ skill }) => skill);
}

export type ResumeMatch = {
  /** % das competências da vaga que aparecem no currículo */
  coverage: number;
  matched: string[];
  missing: string[];
};

export function matchResume(jobText: string, resumeText: string): ResumeMatch {
  const wanted = extractSkills(jobText);
  const have = new Set(extractSkills(resumeText).map((s) => s.name));
  const matched = wanted.filter((s) => have.has(s.name)).map((s) => s.name);
  const missing = wanted.filter((s) => !have.has(s.name)).map((s) => s.name);
  return {
    coverage: wanted.length ? Math.round((matched.length / wanted.length) * 100) : 0,
    matched,
    missing,
  };
}

type ResumeLike = { id: string; name: string; content: string | null };

/** Ordena os currículos do mais para o menos aderente à vaga. */
export function rankResumes<T extends ResumeLike>(jobText: string, resumes: T[]) {
  return resumes
    .filter((r) => r.content?.trim())
    .map((r) => ({ id: r.id, name: r.name, ...matchResume(jobText, r.content!) }))
    .sort((a, b) => b.coverage - a.coverage || b.matched.length - a.matched.length);
}
