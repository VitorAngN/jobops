const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const fullFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export function shortDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return d.getFullYear() === new Date().getFullYear() ? dateFmt.format(d) : fullFmt.format(d);
}

/** "hoje", "ontem", "há 3 dias", depois a data. */
export function relativeDate(value?: string | null) {
  if (!value) return "—";
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  return shortDate(value);
}

export function dueLabel(value: string) {
  const days = Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { text: `atrasado ${-days}d`, late: true };
  if (days === 0) return { text: "hoje", late: false };
  if (days === 1) return { text: "amanhã", late: false };
  return { text: shortDate(value), late: false };
}

/** Data para <input type="date">. */
export function toInputDate(value?: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => /[A-Za-zÀ-ÿ0-9]/.test(w[0] ?? ""))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
