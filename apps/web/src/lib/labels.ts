import type {
  ResumeFocus,
  ApplicationArea,
  ApplicationLevel,
  ApplicationStatus,
  ContractType,
  DiscoverySource,
  InteractionType,
  SourcePlatform,
  WorkMode,
} from "./types";

export const statusLabels: Record<ApplicationStatus, string> = {
  SAVED: "Salva",
  APPLIED: "Aplicada",
  RECRUITER_CONTACTED: "Recrutador falou",
  IN_REVIEW: "Em análise",
  TEST_SENT: "Teste técnico",
  HR_INTERVIEW: "Entrevista RH",
  TECH_INTERVIEW: "Entrevista técnica",
  WAITING_RESPONSE: "Aguardando",
  REJECTED: "Recusada",
  GHOSTED: "Sem retorno",
  OFFER: "Oferta",
  ARCHIVED: "Arquivada",
};

export const areaLabels: Record<ApplicationArea, string> = {
  BACKEND: "Back-end",
  DEVOPS: "DevOps",
  CLOUD: "Cloud",
  FULLSTACK: "Full-stack",
  FRONTEND: "Front-end",
  DATA: "Dados",
  SECURITY: "Segurança",
  SUPPORT: "Suporte / Infra",
  OTHER: "Outra",
};

export const levelLabels: Record<ApplicationLevel, string> = {
  INTERNSHIP: "Estágio",
  TRAINEE: "Trainee",
  JUNIOR: "Júnior",
  MID: "Pleno",
  SENIOR: "Sênior",
  UNKNOWN: "Nível não informado",
};

export const workModeLabels: Record<WorkMode, string> = {
  REMOTE: "Remoto",
  HYBRID: "Híbrido",
  ONSITE: "Presencial",
  UNKNOWN: "Modalidade não informada",
};

export const contractLabels: Record<ContractType, string> = {
  INTERNSHIP: "Estágio",
  CLT: "CLT",
  PJ: "PJ",
  TEMPORARY: "Temporário",
  OTHER: "Outro",
  UNKNOWN: "Não informado",
};

export const platformLabels: Record<SourcePlatform, string> = {
  LINKEDIN: "LinkedIn",
  GUPY: "Gupy",
  COMPANY_SITE: "Site da empresa",
  INDEED: "Indeed",
  GLASSDOOR: "Glassdoor",
  GREENHOUSE: "Greenhouse",
  LEVER: "Lever",
  ASHBY: "Ashby",
  REFERRAL: "Indicação",
  OTHER: "Outro",
};

export const discoverySourceLabels: Record<DiscoverySource, string> = {
  GUPY: "Gupy",
  GREENHOUSE: "Greenhouse",
  LEVER: "Lever",
  ASHBY: "Ashby",
  REMOTIVE: "Remotive",
};

export const interactionLabels: Record<InteractionType, string> = {
  MESSAGE: "Mensagem",
  EMAIL: "E-mail",
  INTERVIEW: "Entrevista",
  TEST: "Teste",
  FEEDBACK: "Feedback",
  NOTE: "Anotação",
};

/** Colunas do quadro. Soltar um cartão numa coluna muda para o status principal dela. */
export const pipelineColumns: { id: string; title: string; main: ApplicationStatus; statuses: ApplicationStatus[] }[] = [
  { id: "salvas", title: "Salvas", main: "SAVED", statuses: ["SAVED"] },
  { id: "aplicadas", title: "Aplicadas", main: "APPLIED", statuses: ["APPLIED", "IN_REVIEW", "RECRUITER_CONTACTED", "WAITING_RESPONSE"] },
  { id: "processo", title: "Em processo", main: "HR_INTERVIEW", statuses: ["TEST_SENT", "HR_INTERVIEW", "TECH_INTERVIEW"] },
  { id: "oferta", title: "Oferta", main: "OFFER", statuses: ["OFFER"] },
  { id: "encerradas", title: "Encerradas", main: "REJECTED", statuses: ["REJECTED", "GHOSTED", "ARCHIVED"] },
];

/** Tom do selo de status (cores definidas no CSS). */
export function statusTone(status: ApplicationStatus): "neutral" | "blue" | "violet" | "green" | "red" {
  if (status === "SAVED" || status === "ARCHIVED") return "neutral";
  if (status === "OFFER") return "green";
  if (status === "REJECTED" || status === "GHOSTED") return "red";
  if (status === "TEST_SENT" || status === "HR_INTERVIEW" || status === "TECH_INTERVIEW") return "violet";
  return "blue";
}

export const focusLabels: Record<ResumeFocus, string> = {
  BACKEND: "Back-end",
  DEVOPS: "DevOps",
  CLOUD: "Cloud",
  FULLSTACK: "Full-stack",
  SUPPORT: "Suporte / Infra",
  GENERAL: "Geral",
};
