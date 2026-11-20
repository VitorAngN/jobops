import { ExternalLink, Pencil, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import { createInteraction, createReminder, deleteApplication, getApplication, listResumeVersions, updateApplication, updateReminder } from "../lib/api";
import { dueLabel, shortDate } from "../lib/format";
import { areaLabels, contractLabels, interactionLabels, levelLabels, platformLabels, statusLabels, workModeLabels } from "../lib/labels";
import type { ApplicationStatus, InteractionType } from "../lib/types";
import { useLoad } from "../lib/useLoad";
import { ApplicationForm } from "./ApplicationForm";
import { MatchPanel } from "./MatchPanel";
import { useToast } from "./Toast";
import { CompanyAvatar, Drawer, Score, Skeletons } from "./ui";

type Props = { id: string; onClose: () => void; onChanged: () => void };

export function ApplicationDrawer({ id, onClose, onChanged }: Props) {
  const { data: app, error, reload } = useLoad(() => getApplication(id), [id]);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState("");
  const [noteType, setNoteType] = useState<InteractionType>("NOTE");
  const [reminder, setReminder] = useState({ title: "", dueAt: "" });
  const toast = useToast();
  const resumes = useLoad(listResumeVersions, []);

  const refresh = async () => {
    await reload();
    onChanged();
  };

  async function changeStatus(status: ApplicationStatus) {
    const extra = status === "APPLIED" && !app?.appliedAt ? { appliedAt: new Date().toISOString() } : {};
    await updateApplication(id, { status, ...extra });
    await refresh();
  }

  async function addNote(e: FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    await createInteraction(id, { type: noteType, description: note.trim() });
    setNote("");
    await refresh();
  }

  async function addReminder(e: FormEvent) {
    e.preventDefault();
    if (!reminder.title || !reminder.dueAt) return;
    await createReminder(id, { title: reminder.title, dueAt: new Date(`${reminder.dueAt}T09:00`).toISOString() });
    setReminder({ title: "", dueAt: "" });
    await refresh();
  }

  async function remove() {
    if (!app || !window.confirm(`Excluir a candidatura "${app.title}"? Isso apaga anotações e lembretes dela.`)) return;
    await deleteApplication(id);
    onChanged();
    onClose();
    toast({ text: "Candidatura excluída" });
  }

  return (
    <Drawer label="Candidatura" onClose={onClose}>
      {error && <div className="alert" style={{ margin: 20 }}>{error}</div>}
      {!app ? <Skeletons n={4} /> : (
        <>
          <div className="detail-head">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <CompanyAvatar name={app.company.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2>{app.title}</h2>
                <div className="row-sub">{app.company.name}{app.location ? ` · ${app.location}` : ""}</div>
              </div>
              <button className="btn ghost icon" onClick={() => setEditing(true)} aria-label="Editar"><Pencil /></button>
              <button className="btn ghost icon" onClick={onClose} aria-label="Fechar"><X /></button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <select className="select" style={{ width: "auto" }} value={app.status} onChange={(e) => changeStatus(e.target.value as ApplicationStatus)} aria-label="Status">
                {(Object.keys(statusLabels) as ApplicationStatus[]).map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
              </select>
              {app.jobUrl && <a className="btn" href={app.jobUrl} target="_blank" rel="noreferrer"><ExternalLink /> Abrir vaga</a>}
              <Score value={app.fitScore} />
            </div>
          </div>

          <div className="detail-body">
            <dl className="facts">
              <div><dt>Nível</dt><dd>{levelLabels[app.level]}</dd></div>
              <div><dt>Modalidade</dt><dd>{workModeLabels[app.workMode]}</dd></div>
              <div><dt>Área</dt><dd>{areaLabels[app.area]}</dd></div>
              <div><dt>Contrato</dt><dd>{contractLabels[app.contractType]}</dd></div>
              <div><dt>Onde achou</dt><dd>{platformLabels[app.sourcePlatform]}</dd></div>
              <div><dt>Aplicou em</dt><dd>{shortDate(app.appliedAt)}</dd></div>
            </dl>

            <section>
              <h3>Currículo</h3>
              <select className="select" style={{ marginBottom: 10 }} value={app.resumeVersion?.id ?? ""} aria-label="Currículo usado"
                onChange={async (e) => { if (e.target.value) { await updateApplication(id, { resumeVersionId: e.target.value }); await refresh(); } }}>
                <option value="" disabled>Escolha qual currículo usou</option>
                {resumes.data?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <MatchPanel text={`${app.title}\n${app.description ?? ""}`} chosenId={app.resumeVersion?.id} />
            </section>

            {app.notes && <section><h3>Anotações</h3><p style={{ whiteSpace: "pre-line" }}>{app.notes}</p></section>}

            <section>
              <h3>Lembretes</h3>
              <div className="timeline" style={{ marginBottom: 10 }}>
                {app.reminders.length === 0 && <span className="muted">Nenhum lembrete.</span>}
                {app.reminders.map((r) => {
                  const due = dueLabel(r.dueAt);
                  return (
                    <label key={r.id} className="check">
                      <input type="checkbox" checked={r.done} onChange={async () => { await updateReminder(r.id, { done: !r.done }); await refresh(); }} />
                      <span style={{ textDecoration: r.done ? "line-through" : undefined }}>{r.title}</span>
                      <small className={due.late && !r.done ? "late" : "muted"}>{due.text}</small>
                    </label>
                  );
                })}
              </div>
              <form className="inline-form" onSubmit={addReminder}>
                <input className="input" placeholder="Ex.: mandar follow-up" value={reminder.title} onChange={(e) => setReminder({ ...reminder, title: e.target.value })} />
                <input className="input" type="date" style={{ flex: "0 0 150px" }} value={reminder.dueAt} onChange={(e) => setReminder({ ...reminder, dueAt: e.target.value })} />
                <button className="btn">Adicionar</button>
              </form>
            </section>

            <section>
              <h3>Histórico</h3>
              <form className="inline-form" onSubmit={addNote} style={{ marginBottom: 12 }}>
                <select className="select" style={{ flex: "0 0 130px" }} value={noteType} onChange={(e) => setNoteType(e.target.value as InteractionType)}>
                  {(Object.keys(interactionLabels) as InteractionType[]).map((t) => <option key={t} value={t}>{interactionLabels[t]}</option>)}
                </select>
                <input className="input" placeholder="O que aconteceu?" value={note} onChange={(e) => setNote(e.target.value)} />
                <button className="btn">Registrar</button>
              </form>
              <div className="timeline">
                {app.interactions.length === 0 && <span className="muted">Nada registrado ainda.</span>}
                {app.interactions.map((i) => (
                  <div className="timeline-item" key={i.id}>
                    <small>{interactionLabels[i.type]} · {shortDate(i.happenedAt)}</small>
                    <div>{i.description}</div>
                  </div>
                ))}
              </div>
            </section>

            <button className="btn ghost danger" style={{ justifySelf: "start" }} onClick={remove}><Trash2 /> Excluir candidatura</button>
          </div>
          {editing && <ApplicationForm application={app} onClose={() => setEditing(false)} onSaved={async () => { setEditing(false); await refresh(); }} />}
        </>
      )}
    </Drawer>
  );
}
