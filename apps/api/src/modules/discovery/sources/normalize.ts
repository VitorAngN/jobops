import type { ApplicationLevel, WorkMode } from "@prisma/client";

/** Remove tags HTML e espaços repetidos, e corta textos longos. */
export function plainText(html: string | null | undefined, max = 4000): string | null {
  if (!html) return null;
  const text = html
    .replace(/<(br|\/p|\/li|\/h\d)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** Tira acentos e deixa minúsculo, para comparar palavras. */
export function fold(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function guessLevel(title: string): ApplicationLevel {
  const t = fold(title);
  if (/\b(estagi|intern(ship)?\b)/.test(t)) return "INTERNSHIP";
  if (/\btrainee\b/.test(t)) return "TRAINEE";
  if (/\b(junior|jr\.?|entry[- ]level|graduate)\b/.test(t)) return "JUNIOR";
  if (/\b(pleno|pl\b|mid[- ]level)/.test(t)) return "MID";
  if (/\b(senior|sr\.?|staff|principal|lead|lider|especialista|head)\b/.test(t)) return "SENIOR";
  return "UNKNOWN";
}

export function guessWorkMode(text: string | null | undefined): WorkMode {
  const t = fold(text ?? "");
  if (/\b(remote|remoto|home office|anywhere|worldwide)\b/.test(t)) return "REMOTE";
  if (/\b(hybrid|hibrido)\b/.test(t)) return "HYBRID";
  if (/\b(on-?site|presencial)\b/.test(t)) return "ONSITE";
  return "UNKNOWN";
}

export function parseDate(value: string | number | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
