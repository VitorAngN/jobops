import { CalendarClock } from "lucide-react";
import { useState } from "react";

import { CompanyAvatar, PageHead, Score, Skeletons, StatusBadge } from "../components/ui";
import { listApplications, updateApplication } from "../lib/api";
import { dueLabel, relativeDate } from "../lib/format";
import { levelLabels, pipelineColumns } from "../lib/labels";
import type { JobApplication } from "../lib/types";
import { useLoad } from "../lib/useLoad";

type Props = { onOpen: (id: string) => void; version: number; onChanged: () => void };

export function Pipeline({ onOpen, version, onChanged }: Props) {
  const { data, error, setData } = useLoad(() => listApplications({ pageSize: 100, sortBy: "updatedAt", sortOrder: "desc" }), [version]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const apps = data?.data ?? [];

  async function drop(columnId: string) {
    setOver(null);
    const column = pipelineColumns.find((c) => c.id === columnId)!;
    const app = apps.find((a) => a.id === dragging);
    setDragging(null);
    if (!app || column.statuses.includes(app.status)) return;

    const changes = { status: column.main, ...(column.main === "APPLIED" && !app.appliedAt ? { appliedAt: new Date().toISOString() } : {}) };
    setData((d) => d && { ...d, data: d.data.map((a) => (a.id === app.id ? { ...a, ...changes } : a)) });
    await updateApplication(app.id, changes);
    onChanged();
  }

  return (
    <div className="page wide">
      <PageHead title="Pipeline" subtitle="Arraste os cartões entre as colunas para atualizar o status." />
      {error && <div className="alert">{error}</div>}
      {!data ? <Skeletons n={3} /> : (
        <div className="board">
          {pipelineColumns.map((col) => {
            const items = apps.filter((a) => col.statuses.includes(a.status));
            return (
              <section
                key={col.id}
                className={`column${over === col.id ? " over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setOver(col.id); }}
                onDragLeave={() => setOver((o) => (o === col.id ? null : o))}
                onDrop={() => drop(col.id)}
              >
                <div className="column-head">{col.title} <span className="n">{items.length}</span></div>
                <div className="column-body">
                  {items.map((a) => (
                    <Ticket key={a.id} app={a} dragging={dragging === a.id} onDrag={setDragging} onOpen={onOpen} showStatus={col.statuses.length > 1} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

type TicketProps = { app: JobApplication; dragging: boolean; onDrag: (id: string | null) => void; onOpen: (id: string) => void; showStatus: boolean };

function Ticket({ app, dragging, onDrag, onOpen, showStatus }: TicketProps) {
  const follow = app.followUpAt ? dueLabel(app.followUpAt) : null;
  return (
    <article
      className={`ticket${dragging ? " dragging" : ""}`}
      draggable
      onDragStart={() => onDrag(app.id)}
      onDragEnd={() => onDrag(null)}
      onClick={() => onOpen(app.id)}
    >
      <div className="ticket-top">
        <CompanyAvatar name={app.company.name} />
        <div className="row-main">
          <div className="row-title">{app.title}</div>
          <div className="row-sub">{app.company.name}</div>
        </div>
      </div>
      <div className="ticket-foot">
        {showStatus && <StatusBadge status={app.status} />}
        <span className="badge">{levelLabels[app.level]}</span>
        {app.fitScore != null && <Score value={app.fitScore} />}
        {follow && <span className={`badge ${follow.late ? "red" : "amber"}`}><CalendarClock size={12} /> {follow.text}</span>}
        <small className="muted" style={{ marginLeft: "auto" }}>{relativeDate(app.updatedAt)}</small>
      </div>
    </article>
  );
}
