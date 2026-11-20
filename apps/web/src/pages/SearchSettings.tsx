import { Loader2, Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { TagInput } from "../components/TagInput";
import { useToast } from "../components/Toast";
import { Empty, PageHead, Skeletons } from "../components/ui";
import { deleteProfile, listProfiles, listRuns, runDiscovery, saveProfile } from "../lib/api";
import { relativeDate } from "../lib/format";
import { discoverySourceLabels } from "../lib/labels";
import type { DiscoverySource, SearchProfile, SearchProfilePayload, WatchedCompany } from "../lib/types";
import { useLoad } from "../lib/useLoad";

/** Ponto de partida para quem procura estágio em back-end. Tudo editável. */
const starter: SearchProfilePayload = {
  name: "Estágio back-end",
  active: true,
  terms: ["estágio back-end", "estágio desenvolvimento", "estágio software", "estágio programação"],
  keywords: ["back-end", "backend", "api", "node", "typescript", "java", "c#", ".net", "python", "sql", "postgres", "docker"],
  excludeWords: ["sênior", "senior", "pleno", "vendas", "comercial", "marketing"],
  locations: ["Remoto", "Paraná"],
  acceptRemote: true,
  sources: ["GUPY", "REMOTIVE"],
  minScore: 40,
  companies: [],
};

export function SearchSettings({ onChanged }: { onChanged: () => void }) {
  const { data, error, reload } = useLoad(listProfiles, []);
  const runs = useLoad(listRuns, []);
  const toast = useToast();

  async function create() {
    await saveProfile(data?.length ? { ...starter, name: "Nova busca" } : starter);
    await reload();
  }

  return (
    <div className="page">
      <PageHead
        title="Busca automática"
        subtitle="A busca roda sozinha uma vez por dia. As vagas que passam da nota mínima vão para Encontradas."
        actions={<button className="btn" onClick={create}><Plus /> Nova busca</button>}
      />
      {error && <div className="alert">{error}</div>}
      {!data ? <Skeletons n={2} /> : data.length === 0 ? (
        <section className="card">
          <Empty title="Nenhuma busca configurada" action={<button className="btn primary" onClick={create}>Criar busca de estágio back-end</button>}>
            Comece com um modelo pronto e ajuste as palavras do seu jeito.
          </Empty>
        </section>
      ) : (
        data.map((p) => (
          <ProfileCard key={p.id} profile={p} onSaved={async () => { await reload(); toast({ text: "Busca salva" }); }}
            onDeleted={async () => { await reload(); toast({ text: "Busca excluída" }); }}
            onRan={async () => { await runs.reload(); onChanged(); }} />
        ))
      )}

      {runs.data && runs.data.length > 0 && (
        <section className="card">
          <div className="card-head"><h2>Últimas execuções</h2></div>
          {runs.data.map((r) => (
            <div className="list-row" key={r.id}>
              <div className="row-main">
                <div className="row-title">{r.created} nova(s) de {r.found} vistas</div>
                <div className="row-sub">{r.trigger === "agendada" ? "Agendada" : "Manual"} · {relativeDate(r.startedAt)}{r.errors.length ? ` · ${r.errors.join("; ")}` : ""}</div>
              </div>
              {r.errors.length > 0 && <span className="badge red">{r.errors.length} erro(s)</span>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

type CardProps = { profile: SearchProfile; onSaved: () => void; onDeleted: () => void; onRan: () => void };

function ProfileCard({ profile, onSaved, onDeleted, onRan }: CardProps) {
  const { id, ...initial } = profile;
  const [form, setForm] = useState<SearchProfilePayload>(initial);
  const [busy, setBusy] = useState<"save" | "run" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const toast = useToast();
  const set = <K extends keyof SearchProfilePayload>(k: K, v: SearchProfilePayload[K]) => setForm((f) => ({ ...f, [k]: v }));
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const needsCompanies = form.sources.some((s) => s === "GREENHOUSE" || s === "LEVER" || s === "ASHBY");

  const toggleSource = (s: DiscoverySource) =>
    set("sources", form.sources.includes(s) ? form.sources.filter((x) => x !== s) : [...form.sources, s]);

  const setCompany = (i: number, patch: Partial<WatchedCompany>) =>
    set("companies", form.companies.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  async function save() {
    setBusy("save");
    setErr(null);
    try {
      await saveProfile({ ...form, companies: form.companies.filter((c) => c.slug && c.name) }, id);
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function run() {
    setBusy("run");
    try {
      const r = await runDiscovery(id);
      toast({ text: `${r.created} vaga(s) nova(s) de ${r.found} vistas${r.errors.length ? ` · erros: ${r.errors.join("; ")}` : ""}` });
      onRan();
    } catch (e) {
      toast({ text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="card profile">
      <div className="card-head">
        <input className="input" style={{ maxWidth: 320, fontWeight: 600 }} value={form.name} onChange={(e) => set("name", e.target.value)} aria-label="Nome da busca" />
        <div className="page-actions" style={{ alignItems: "center" }}>
          <label className="check"><input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} /> Ativa</label>
          <button className="btn sm" onClick={run} disabled={busy !== null || dirty} title={dirty ? "Salve antes de buscar" : undefined}>
            {busy === "run" ? <Loader2 className="spin" /> : <Play />} Buscar agora
          </button>
          <button className="btn ghost sm icon danger" aria-label="Excluir busca" onClick={async () => {
            if (window.confirm(`Excluir a busca "${profile.name}"? As vagas já encontradas continuam.`)) { await deleteProfile(id); onDeleted(); }
          }}><Trash2 /></button>
        </div>
      </div>

      <div className="profile-grid">
        {err && <div className="alert" style={{ margin: 0 }}>{err}</div>}
        <div className="field">
          <span>Onde procurar</span>
          <div className="sources">
            {(Object.keys(discoverySourceLabels) as DiscoverySource[]).map((s) => (
              <label key={s} className="source-chip">
                <input type="checkbox" checked={form.sources.includes(s)} onChange={() => toggleSource(s)} />
                {discoverySourceLabels[s]}
              </label>
            ))}
          </div>
          <small>Gupy busca pelos termos. Remotive traz vagas remotas internacionais. Greenhouse, Lever e Ashby olham as empresas que você listar abaixo.</small>
        </div>

        <label className="field">
          <span>Termos de busca</span>
          <TagInput value={form.terms} onChange={(v) => set("terms", v)} placeholder="ex.: estágio back-end" />
          <small>Cada termo é uma pesquisa separada na Gupy.</small>
        </label>

        <div className="grid-2">
          <label className="field">
            <span>Palavras que aumentam a nota</span>
            <TagInput value={form.keywords} onChange={(v) => set("keywords", v)} placeholder="ex.: node, java" />
          </label>
          <label className="field">
            <span>Palavras que eliminam (no título)</span>
            <TagInput value={form.excludeWords} onChange={(v) => set("excludeWords", v)} placeholder="ex.: sênior" />
          </label>
        </div>

        <div className="grid-2">
          <label className="field">
            <span>Cidades ou estados aceitos</span>
            <TagInput value={form.locations} onChange={(v) => set("locations", v)} placeholder="ex.: Curitiba, PR" />
            <small>Para vagas presenciais ou híbridas.</small>
          </label>
          <div className="field">
            <span>Nota mínima: {form.minScore}</span>
            <div className="range">
              <input type="range" min={0} max={90} step={5} value={form.minScore} onChange={(e) => set("minScore", Number(e.target.value))} />
            </div>
            <label className="check"><input type="checkbox" checked={form.acceptRemote} onChange={(e) => set("acceptRemote", e.target.checked)} /> Aceito vaga remota</label>
          </div>
        </div>

        {needsCompanies && (
          <div className="field">
            <span>Empresas acompanhadas</span>
            <small>O código é o que aparece no link da página de vagas: boards.greenhouse.io/<b>nubank</b>, jobs.lever.co/<b>empresa</b>, jobs.ashbyhq.com/<b>empresa</b>.</small>
            {form.companies.map((c, i) => (
              <div className="company-row" key={i}>
                <select className="select" value={c.source} onChange={(e) => setCompany(i, { source: e.target.value as WatchedCompany["source"] })}>
                  <option value="GREENHOUSE">Greenhouse</option>
                  <option value="LEVER">Lever</option>
                  <option value="ASHBY">Ashby</option>
                </select>
                <input className="input" placeholder="código (ex.: nubank)" value={c.slug} onChange={(e) => setCompany(i, { slug: e.target.value.trim().toLowerCase() })} />
                <input className="input" placeholder="Nome (ex.: Nubank)" value={c.name} onChange={(e) => setCompany(i, { name: e.target.value })} />
                <button className="btn ghost icon" aria-label="Remover" onClick={() => set("companies", form.companies.filter((_, j) => j !== i))}><Trash2 /></button>
              </div>
            ))}
            <button className="btn sm" style={{ justifySelf: "start" }} onClick={() => set("companies", [...form.companies, { source: "GREENHOUSE", slug: "", name: "" }])}>
              <Plus /> Adicionar empresa
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          {dirty && <button className="btn ghost" onClick={() => setForm(initial)}>Descartar mudanças</button>}
          <button className="btn primary" onClick={save} disabled={!dirty || busy !== null}>{busy === "save" ? "Salvando…" : "Salvar"}</button>
        </div>
      </div>
    </section>
  );
}
