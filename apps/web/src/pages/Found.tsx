import { Check, ChevronDown, ChevronUp, ExternalLink, Inbox, Loader2, RefreshCcw, RotateCcw, Search, X } from "lucide-react";
import { useState } from "react";

import { useToast } from "../components/Toast";
import { CompanyAvatar, Empty, PageHead, Score, Skeletons } from "../components/ui";
import { approveDiscovered, discardDiscovered, listDiscovered, listRuns, restoreDiscovered, runDiscovery } from "../lib/api";
import { relativeDate } from "../lib/format";
import { discoverySourceLabels, levelLabels, workModeLabels } from "../lib/labels";
import type { DiscoveredJob, DiscoveredStatus, DiscoverySource } from "../lib/types";
import { useLoad } from "../lib/useLoad";

const tabs: { id: DiscoveredStatus; label: string }[] = [
  { id: "NEW", label: "Novas" },
  { id: "APPROVED", label: "Aprovadas" },
  { id: "DISCARDED", label: "Descartadas" },
];

type Props = { onChanged: () => void; onOpen: (id: string) => void };

export function Found({ onChanged, onOpen }: Props) {
  const [status, setStatus] = useState<DiscoveredStatus>("NEW");
  const [source, setSource] = useState<DiscoverySource | "">("");
  const [q, setQ] = useState("");
  const [running, setRunning] = useState(false);
  const { data, error, loading, reload, setData } = useLoad(() => listDiscovered(status, { source, q }), [status, source, q]);
  const runs = useLoad(listRuns, []);
  const toast = useToast();
  const lastRun = runs.data?.[0];

  /** Tira da lista na hora (sem esperar a API) e ajusta os contadores. */
  function removeLocally(job: DiscoveredJob, to: DiscoveredStatus) {
    setData((d) => d && {
      jobs: d.jobs.filter((j) => j.id !== job.id),
      counts: { ...d.counts, [job.status]: (d.counts[job.status] ?? 1) - 1, [to]: (d.counts[to] ?? 0) + 1 },
    });
  }

  async function approve(job: DiscoveredJob) {
    removeLocally(job, "APPROVED");
    const app = await approveDiscovered(job.id);
    onChanged();
    toast({ text: `"${job.title}" foi para Salvas`, action: { label: "Abrir", run: () => onOpen(app.id) } });
  }

  async function discard(job: DiscoveredJob) {
    removeLocally(job, "DISCARDED");
    await discardDiscovered(job.id);
    onChanged();
    toast({ text: "Vaga descartada", action: { label: "Desfazer", run: async () => { await restoreDiscovered(job.id); await reload(); onChanged(); } } });
  }

  async function restore(job: DiscoveredJob) {
    removeLocally(job, "NEW");
    await restoreDiscovered(job.id);
    onChanged();
  }

  async function run() {
    setRunning(true);
    try {
      const r = await runDiscovery();
      toast({ text: r.created ? `${r.created} vaga(s) nova(s) de ${r.found} encontradas` : `Nenhuma vaga nova (${r.found} já vistas ou abaixo da nota mínima)` });
      if (r.errors.length) toast({ text: `Algumas fontes falharam: ${r.errors.join("; ")}` });
      await Promise.all([reload(), runs.reload()]);
      onChanged();
    } catch (e) {
      toast({ text: (e as Error).message });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="page">
      <PageHead
        title="Encontradas"
        subtitle="Vagas que a busca automática achou. Aprove para mandar ao pipeline ou descarte."
        actions={
          <>
            {lastRun && <span className="run-info">Última busca {relativeDate(lastRun.startedAt)}</span>}
            <button className="btn" onClick={run} disabled={running}>
              {running ? <Loader2 className="spin" /> : <RefreshCcw />} {running ? "Buscando…" : "Buscar agora"}
            </button>
          </>
        }
      />

      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} className="tab" role="tab" aria-selected={status === t.id} onClick={() => setStatus(t.id)}>
            {t.label} <span className="n">{data?.counts[t.id] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="search">
          <Search />
          <input className="input" placeholder="Filtrar por vaga ou empresa" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="select" value={source} onChange={(e) => setSource(e.target.value as DiscoverySource | "")}>
          <option value="">Todas as fontes</option>
          {(Object.keys(discoverySourceLabels) as DiscoverySource[]).map((s) => <option key={s} value={s}>{discoverySourceLabels[s]}</option>)}
        </select>
      </div>

      {error && <div className="alert">{error}</div>}
      <section className="card">
        {loading && !data ? <Skeletons n={4} /> : data?.jobs.length === 0 ? (
          <Empty icon={<Inbox />} title={status === "NEW" ? "Caixa vazia" : "Nada aqui"}>
            {status === "NEW" ? "Quando a busca achar vagas que combinam com você, elas aparecem aqui." : undefined}
          </Empty>
        ) : (
          data?.jobs.map((job) => (
            <JobRow key={job.id} job={job} onApprove={approve} onDiscard={discard} onRestore={restore} onOpen={onOpen} />
          ))
        )}
      </section>
    </div>
  );
}

type RowProps = {
  job: DiscoveredJob;
  onApprove: (j: DiscoveredJob) => void;
  onDiscard: (j: DiscoveredJob) => void;
  onRestore: (j: DiscoveredJob) => void;
  onOpen: (id: string) => void;
};

function JobRow({ job, onApprove, onDiscard, onRestore, onOpen }: RowProps) {
  const [open, setOpen] = useState(false);
  return (
    <article className="job">
      <CompanyAvatar name={job.company} />
      <div style={{ minWidth: 0 }}>
        <div className="job-title"><a href={job.url} target="_blank" rel="noreferrer">{job.title}</a></div>
        <div className="job-meta">
          <span>{job.company}</span>
          <span>{levelLabels[job.level]}</span>
          <span>{workModeLabels[job.workMode]}{job.location ? ` · ${job.location}` : ""}</span>
          <span>{discoverySourceLabels[job.source]}</span>
          <span>encontrada {relativeDate(job.createdAt)}</span>
        </div>
        <div className="job-reasons">
          <Score value={job.score} />
          {job.scoreReasons.map((r) => <span key={r} className="badge outline">{r}</span>)}
        </div>
        {job.bestResume && (
          <div className="match-tags" style={{ marginTop: 8 }}>
            <span className="badge green">Currículo: {job.bestResume.name} · {job.bestResume.coverage}%</span>
            {job.bestResume.missing.length > 0 && <span className="muted">falta: {job.bestResume.missing.slice(0, 5).join(", ")}</span>}
          </div>
        )}
        {job.description && (
          <>
            <button className="btn ghost sm" style={{ marginTop: 8, marginLeft: -8 }} onClick={() => setOpen(!open)}>
              {open ? <ChevronUp /> : <ChevronDown />} {open ? "Esconder descrição" : "Ver descrição"}
            </button>
            {open && <div className="job-desc">{job.description}</div>}
          </>
        )}
      </div>
      <div className="job-actions">
        {job.status === "NEW" && (
          <>
            <button className="btn primary sm" onClick={() => onApprove(job)}><Check /> Aprovar</button>
            <button className="btn sm" onClick={() => onDiscard(job)}><X /> Descartar</button>
          </>
        )}
        {job.status === "APPROVED" && job.applicationId && (
          <button className="btn sm" onClick={() => onOpen(job.applicationId!)}>Ver candidatura</button>
        )}
        {job.status === "DISCARDED" && <button className="btn sm" onClick={() => onRestore(job)}><RotateCcw /> Voltar</button>}
        <a className="btn ghost sm" href={job.url} target="_blank" rel="noreferrer"><ExternalLink /> Abrir</a>
      </div>
    </article>
  );
}
