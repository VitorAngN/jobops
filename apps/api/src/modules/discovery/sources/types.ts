import type { ApplicationLevel, DiscoverySource, WorkMode } from "@prisma/client";

/** Vaga já normalizada, igual para todas as fontes. */
export type ExternalJob = {
  source: DiscoverySource;
  externalId: string;
  title: string;
  company: string;
  location: string | null;
  workMode: WorkMode;
  level: ApplicationLevel;
  url: string;
  description: string | null;
  publishedAt: Date | null;
};

/** O que cada fonte recebe para buscar. */
export type SearchInput = {
  terms: string[];
  /** Empresas acompanhadas, só para Greenhouse/Lever/Ashby. */
  companies: { slug: string; name: string }[];
};

export type JobSource = {
  id: DiscoverySource;
  search(input: SearchInput, fetcher?: typeof fetch): Promise<ExternalJob[]>;
};

export const USER_AGENT = "JobOps/1.0 (gerenciador pessoal de candidaturas)";
