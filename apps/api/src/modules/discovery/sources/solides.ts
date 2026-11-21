import { guessLevel, guessWorkMode, parseDate, plainText } from "./normalize.js";
import { USER_AGENT, type ExternalJob, type JobSource } from "./types.js";

/**
 * Sólides Vagas: usa o servidor MCP público que a própria Sólides oferece para candidatos
 * (mcp.solides.com.br/ats/candidate, ferramenta "buscar_vagas"). Sem cadastro e sem chave.
 */
const ENDPOINT = "https://mcp.solides.com.br/ats/candidate";
const PER_TERM = 30;

type SolidesJob = {
  id: string;
  titulo: string;
  empresa: string;
  local?: string;
  modalidade?: string;
  senioridade?: string;
  contrato?: string;
  habilidades?: string;
  publicado_em?: string;
  link_candidatura: string;
  descricao?: string;
};

/** Respostas do MCP podem vir como JSON puro ou como evento SSE ("data: {...}"). */
export function readMcpResponse(body: string): any {
  const data = body.includes("data:")
    ? body.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).pop()!
    : body;
  const message = JSON.parse(data);
  if (message.error) throw new Error(`Sólides: ${message.error.message ?? "erro no MCP"}`);
  return message.result;
}

async function rpc(fetcher: typeof fetch, session: string | null, payload: object) {
  const response = await fetcher(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "User-Agent": USER_AGENT,
      ...(session ? { "Mcp-Session-Id": session } : {}),
    },
    body: JSON.stringify({ jsonrpc: "2.0", ...payload }),
  });
  if (!response.ok) throw new Error(`Sólides respondeu ${response.status}`);
  return { session: response.headers.get("mcp-session-id"), body: await response.text() };
}

const WORKMODE: Record<string, ExternalJob["workMode"]> = { remoto: "REMOTE", hibrido: "HYBRID", presencial: "ONSITE" };

export function mapSolidesJob(j: SolidesJob): ExternalJob {
  const contract = `${j.senioridade ?? ""} ${j.contrato ?? ""}`.toLowerCase();
  return {
    source: "SOLIDES",
    externalId: String(j.id),
    title: j.titulo.trim(),
    company: j.empresa.trim(),
    location: j.local ?? null,
    workMode: WORKMODE[j.modalidade ?? ""] ?? guessWorkMode(j.modalidade),
    level: contract.includes("estagi") ? "INTERNSHIP" : guessLevel(`${j.titulo} ${j.senioridade ?? ""}`),
    url: j.link_candidatura,
    description: plainText([j.habilidades && `Habilidades: ${j.habilidades}`, j.descricao].filter(Boolean).join("\n")),
    publishedAt: parseDate(j.publicado_em),
  };
}

export const solides: JobSource = {
  id: "SOLIDES",
  async search({ terms }, fetcher = fetch) {
    const init = await rpc(fetcher, null, {
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "jobops", version: "1.0" } },
    });
    const session = init.session;
    await rpc(fetcher, session, { method: "notifications/initialized" });

    const jobs: ExternalJob[] = [];
    let id = 2;
    for (const term of terms) {
      const { body } = await rpc(fetcher, session, {
        id: id++,
        method: "tools/call",
        params: { name: "buscar_vagas", arguments: { title: term, occupationAreas: ["tecnologia"], take: PER_TERM } },
      });
      const result = readMcpResponse(body);
      const text = result?.content?.find((c: { type: string }) => c.type === "text")?.text ?? "{}";
      const vagas: SolidesJob[] = JSON.parse(text).vagas ?? [];
      jobs.push(...vagas.map(mapSolidesJob));
    }
    return jobs;
  },
};
