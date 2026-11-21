import type { DiscoverySource } from "@prisma/client";

import { guessLevel, guessWorkMode, parseDate, plainText } from "./sources/normalize.js";
import { USER_AGENT, type ExternalJob } from "./sources/types.js";

/**
 * "Colar link": lê a página da vaga e tenta montar os dados.
 * Ordem: JSON-LD JobPosting (usado por Gupy, Greenhouse, Lever, LinkedIn público e outros),
 * depois as tags Open Graph, e por último o <title>.
 */
export type ImportedJob = Omit<ExternalJob, "source" | "externalId"> & { source: DiscoverySource | null };

function sourceFromHost(host: string): DiscoverySource | null {
  if (host.endsWith("gupy.io")) return "GUPY";
  if (host.includes("greenhouse.io")) return "GREENHOUSE";
  if (host.endsWith("lever.co")) return "LEVER";
  if (host.endsWith("ashbyhq.com")) return "ASHBY";
  if (host.endsWith("remotive.com")) return "REMOTIVE";
  if (host.endsWith("solides.com.br")) return "SOLIDES";
  if (host.endsWith("himalayas.app")) return "HIMALAYAS";
  if (host.endsWith("smartrecruiters.com")) return "SMARTRECRUITERS";
  return null;
}

function findJobPosting(node: unknown): Record<string, any> | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = findJobPosting(item);
      if (hit) return hit;
    }
    return null;
  }
  const obj = node as Record<string, any>;
  const type = obj["@type"];
  if (type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))) return obj;
  return findJobPosting(obj["@graph"]);
}

/** Alguns sites (a Gupy, por exemplo) escapam o JSON-LD como HTML (&quot;). */
function parseJsonLd(raw: string): unknown {
  for (const text of [raw, decodeEntities(raw)]) {
    try {
      return JSON.parse(text);
    } catch {
      /* tenta a próxima forma */
    }
  }
  return null;
}

function decodeEntities(text: string) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

const meta = (html: string, name: string) =>
  html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["']`, "i"))?.[1] ??
  html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name}["']`, "i"))?.[1] ??
  null;

export function parseJobPage(html: string, url: string): ImportedJob {
  const host = new URL(url).hostname;
  let posting: Record<string, any> | null = null;
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    posting = findJobPosting(parseJsonLd(m[1]));
    if (posting) break;
  }

  if (posting) {
    const address = [posting.jobLocation].flat()[0]?.address ?? {};
    const location = [address.addressLocality, address.addressRegion].filter(Boolean).join(", ") || null;
    const remote = posting.jobLocationType === "TELECOMMUTE";
    const title = String(posting.title ?? "").trim();
    return {
      source: sourceFromHost(host),
      title,
      company: String(posting.hiringOrganization?.name ?? host).trim(),
      location,
      workMode: remote ? "REMOTE" : guessWorkMode(`${title} ${location ?? ""}`),
      level: String(posting.employmentType ?? "").toUpperCase().includes("INTERN") ? "INTERNSHIP" : guessLevel(title),
      url,
      description: plainText(posting.description),
      publishedAt: parseDate(posting.datePosted),
    };
  }

  const title = (meta(html, "og:title") ?? html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "").trim();
  return {
    source: sourceFromHost(host),
    title: title || "Vaga sem título",
    company: meta(html, "og:site_name") ?? host.replace(/^www\./, ""),
    location: null,
    workMode: guessWorkMode(title),
    level: guessLevel(title),
    url,
    description: plainText(meta(html, "og:description") ?? meta(html, "description")),
    publishedAt: null,
  };
}

/** Só aceita páginas públicas http(s); bloqueia endereços locais. */
export function assertPublicUrl(raw: string) {
  const url = new URL(raw);
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const local =
    host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") ||
    /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(host) ||
    host === "::1" || /^f[cd][0-9a-f]{2}:/i.test(host) || /^fe80:/i.test(host);
  if (!/^https?:$/.test(url.protocol) || local) throw new Error("Use o link público da vaga (http ou https).");
}

export async function importFromUrl(url: string, fetcher: typeof fetch = fetch): Promise<ImportedJob> {
  assertPublicUrl(url);
  const response = await fetcher(url, { headers: { "User-Agent": USER_AGENT, Accept: "text/html" }, redirect: "follow" });
  if (!response.ok) throw new Error(`A página respondeu ${response.status}`);
  return parseJobPage(await response.text(), url);
}
