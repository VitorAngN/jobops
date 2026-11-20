import { ArrowRight, BellRing, Inbox } from "lucide-react";

import { CompanyAvatar, Empty, PageHead, Score, Skeletons } from "../components/ui";
import { getMetricsByStatus, getMetricsSummary, listDiscovered, listReminders, updateReminder } from "../lib/api";
import { dueLabel } from "../lib/format";
import { levelLabels, pipelineColumns } from "../lib/labels";
import type { Route } from "../lib/router";
import { useLoad } from "../lib/useLoad";

type Props = { onNavigate: (r: Route) => void; onOpen: (id: string) => void; version: number };

export function Home({ onNavigate, onOpen, version }: Props) {
  const { data, error } = useLoad(
    () => Promise.all([getMetricsSummary(), getMetricsByStatus(), listDiscovered("NEW")]),
    [version],
  );
  const reminders = useLoad(listReminders, [version]);

  if (error) return <div className="page"><div className="alert">{error}</div></div>;
  if (!data) return <div className="page"><Skeletons n={4} /></div>;

  const [summary, byStatus, found] = data;
  const columns = pipelineColumns.map((c) => ({
    ...c,
    total: byStatus.filter((s) => c.statuses.includes(s.status)).reduce((n, s) => n + s.total, 0),
  }));
  const max = Math.max(1, ...columns.map((c) => c.total));
  const pending = reminders.data ?? [];
  const greeting = new Date().getHours() < 12 ? "Bom dia" : new Date().getHours() < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="page">
      <PageHead title={greeting} subtitle="O que precisa da sua atenção hoje." />

      <div className="stats">
        <div className="card stat"><span>Vagas novas</span><strong>{found.counts.NEW ?? 0}</strong><small>esperando triagem</small></div>
        <div className="card stat"><span>Aplicadas na semana</span><strong>{summary.appliedLast7Days}</strong><small>últimos 7 dias</small></div>
        <div className="card stat"><span>Taxa de resposta</span><strong>{Math.round(summary.responseRate)}%</strong><small>{summary.responded} responderam</small></div>
        <div className="card stat"><span>Entrevistas</span><strong>{summary.interviews}</strong><small>{Math.round(summary.interviewRate)}% das aplicadas</small></div>
      </div>

      <div className="home-grid">
        <section className="card">
          <div className="card-head">
            <h2>Melhores vagas encontradas</h2>
            <button className="btn ghost sm" onClick={() => onNavigate("encontradas")}>Ver todas <ArrowRight /></button>
          </div>
          {found.jobs.length === 0 ? (
            <Empty icon={<Inbox />} title="Nada novo por aqui">A busca automática roda todo dia. Ajuste os filtros em Busca automática.</Empty>
          ) : (
            found.jobs.slice(0, 6).map((j) => (
              <div className="list-row clickable" key={j.id} onClick={() => onNavigate("encontradas")}>
                <CompanyAvatar name={j.company} />
                <div className="row-main">
                  <div className="row-title">{j.title}</div>
                  <div className="row-sub">{j.company} · {levelLabels[j.level]}{j.location ? ` · ${j.location}` : ""}</div>
                </div>
                <Score value={j.score} />
              </div>
            ))
          )}
        </section>

        <div style={{ display: "grid", gap: 16 }}>
          <section className="card">
            <div className="card-head"><h2>Lembretes</h2></div>
            {pending.length === 0 ? (
              <Empty icon={<BellRing />} title="Tudo em dia" />
            ) : (
              pending.slice(0, 6).map((r) => {
                const due = dueLabel(r.dueAt);
                return (
                  <div className="list-row" key={r.id}>
                    <input type="checkbox" aria-label="Concluir" onChange={async () => { await updateReminder(r.id, { done: true }); await reminders.reload(); }} />
                    <div className="row-main clickable" style={{ cursor: "pointer" }} onClick={() => onOpen(r.application.id)}>
                      <div className="row-title">{r.title}</div>
                      <div className="row-sub">{r.application.company.name} · {r.application.title}</div>
                    </div>
                    <small className={due.late ? "late" : "muted"}>{due.text}</small>
                  </div>
                );
              })
            )}
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Funil</h2>
              <button className="btn ghost sm" onClick={() => onNavigate("pipeline")}>Pipeline <ArrowRight /></button>
            </div>
            <div className="funnel">
              {columns.map((c) => (
                <div className="funnel-row" key={c.id}>
                  <span>{c.title}</span>
                  <div className="funnel-bar"><i style={{ width: `${(c.total / max) * 100}%` }} /></div>
                  <b>{c.total}</b>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
