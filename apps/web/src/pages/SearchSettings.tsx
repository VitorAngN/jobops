import { Loader2, Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { TagInput } from "../components/TagInput";
import { useToast } from "../components/Toast";
import { Empty, PageHead, Skeletons } from "../components/ui";
import { deleteProfile, listProfiles, listRuns, runDiscovery, saveProfile } from "../lib/api";
import { relativeDate } from "../lib/format";
import { areaLabels, discoverySourceHelp, discoverySourceLabels } from "../lib/labels";
import type { ApplicationArea, DiscoverySource, SearchProfile, SearchProfilePayload, WatchedCompany } from "../lib/types";
import { useLoad } from "../lib/useLoad";

const base = { active: true, acceptRemote: true, minScore: 40, companies: [], locations: ["Paraná"] };
const junior = ["sênior", "senior", "pleno", "especialista", "coordenador", "gerente", "vendas", "comercial"];

/** Modelos prontos por área. Tudo editável depois. */
const templates: SearchProfilePayload[] = [
  {
    ...base, name: "Estágio DevOps / Cloud", area: "DEVOPS", sources: ["GUPY", "SOLIDES", "GITHUB", "HIMALAYAS", "REMOTIVE"],
    terms: ["estágio devops", "estágio cloud", "estágio infraestrutura", "estágio sre"],
    keywords: ["devops", "cloud", "docker", "kubernetes", "ci/cd", "linux", "aws", "azure", "terraform", "git", "pipeline"],
    excludeWords: junior,
  },
  {
    ...base, name: "Estágio back-end", area: "BACKEND", sources: ["GUPY", "SOLIDES", "GITHUB", "HIMALAYAS", "REMOTIVE"],
    terms: ["estágio back-end", "estágio desenvolvimento", "estágio software", "estágio programação"],
    keywords: ["back-end", "backend", "api", "node", "typescript", "java", "c#", ".net", "python", "sql", "postgres", "docker"],
    excludeWords: junior,
  },
  {
    ...base, name: "Estágio full-stack", area: "FULLSTACK", sources: ["GUPY", "SOLIDES", "GITHUB", "HIMALAYAS"],
    terms: ["estágio full stack", "estágio desenvolvedor web", "estágio fullstack"],
    keywords: ["full stack", "fullstack", "react", "node", "typescript", "javascript", "api", "sql"],
    excludeWords: junior,
  },
  {
    ...base, name: "Estágio suporte / infra de TI", area: "SUPPORT", sources: ["GUPY", "SOLIDES"],
    terms: ["estágio suporte ti", "estágio infraestrutura ti", "estágio redes", "estágio help desk"],
    keywords: ["suporte", "redes", "linux", "windows", "help desk", "hardware", "infraestrutura", "active directory"],
    excludeWords: junior,
  },
];

export function SearchSettings({ onChanged }: { onChanged: () => void }) {
  const { data, error, reload } = useLoad(listProfiles, []);
  const runs = useLoad(listRuns, []);
  const toast = useToast();

  const used = new Set(data?.map((p) => p.name));
  const available = templates.filter((t) => !used.has(t.name));

  async function create(t: SearchProfilePayload) {
    await saveProfile(t);
    await reload();
  }

  return (
    <div className="page">
      <PageHead
        title="Busca automática"
        subtitle="A busca roda sozinha uma vez por dia. As vagas que passam da nota mínima vão para Encontradas."
        actions={available.length > 0 && data && data.length > 0 ? (
          <select className="select" value="" onChange={(e) => { const t = available.find((x) => x.name === e.target.value); if (t) void create(t); }} aria-label="Adicionar busca">
            <option value="">+ Adicionar busca…</option>
            {available.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
          </select>
        ) : undefined}
      />
      {error && <div className="alert">{error}</div>}
      {!data ? <Skeletons n={2} /> : data.length === 0 ? (
        <section className="card">
          <Empty title="Nenhuma busca configurada" action={
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
              <button className="btn primary" onClick={async () => { for (const t of templates) await saveProfile(t); await reload(); }}>Criar as 4 buscas</button>
              {templates.map((t) => <button key={t.name} className="btn" onClick={() => create(t)}>{t.name}</button>)}
            </div>
          }>
            Comece com modelos prontos e ajuste as palavras do seu jeito.
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
  const needsCompanies = form.sources.some((s) => s === "GREENHOUSE" || s === "LEVER" || s === "ASHBY" || s === "SMARTRECRUITERS");

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
          <select className="select sm-select" value={form.area} onChange={(e) => set("area", e.target.value as ApplicationArea)} aria-label="Área">
            {(Object.keys(areaLabels) as ApplicationArea[]).map((a) => <option key={a} value={a}>{areaLabels[a]}</option>)}
          </select>
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
              <label key={s} className="source-chip" title={discoverySourceHelp[s]}>
                <input type="checkbox" checked={form.sources.includes(s)} onChange={() => toggleSource(s)} />
                {discoverySourceLabels[s]}
              </label>
            ))}
          </div>
          <ul className="source-help">
            {form.sources.map((s) => <li key={s}><b>{discoverySourceLabels[s]}:</b> {discoverySourceHelp[s]}</li>)}
          </ul>
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
            <small>O código é o que aparece no link da página de vagas: boards.greenhouse.io/<b>nubank</b>, jobs.lever.co/<b>empresa</b>, jobs.ashbyhq.com/<b>empresa</b>, jobs.smartrecruiters.com/<b>Empresa</b>.</small>
            {form.companies.map((c, i) => (
              <div className="company-row" key={i}>
                <select className="select" value={c.source} onChange={(e) => setCompany(i, { source: e.target.value as WatchedCompany["source"] })}>
                  <option value="GREENHOUSE">Greenhouse</option>
                  <option value="LEVER">Lever</option>
                  <option value="ASHBY">Ashby</option>
                  <option value="SMARTRECRUITERS">SmartRecruiters</option>
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
