import { FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { MatchPanel } from "../components/MatchPanel";
import { useToast } from "../components/Toast";
import { Empty, Modal, PageHead, Skeletons } from "../components/ui";
import { createResumeVersion, deleteResumeVersion, listResumeVersions, updateResumeVersion } from "../lib/api";
import { focusLabels } from "../lib/labels";
import type { ResumeFocus, ResumeVersion, ResumeVersionPayload } from "../lib/types";
import { useLoad } from "../lib/useLoad";

export function Resumes() {
  const { data, error, reload } = useLoad(listResumeVersions, []);
  const [editing, setEditing] = useState<ResumeVersion | "new" | null>(null);
  const [test, setTest] = useState("");
  const toast = useToast();

  return (
    <div className="page">
      <PageHead
        title="Currículos"
        subtitle="Tenha uma versão por foco. Em cada vaga, o JobOps indica qual usar e o que falta nele."
        actions={<button className="btn primary" onClick={() => setEditing("new")}><Plus /> Novo currículo</button>}
      />
      {error && <div className="alert">{error}</div>}

      <section className="card" style={{ marginBottom: 16 }}>
        {!data ? <Skeletons n={2} /> : data.length === 0 ? (
          <Empty icon={<FileText />} title="Nenhum currículo ainda" action={<button className="btn primary" onClick={() => setEditing("new")}>Adicionar o primeiro</button>}>
            Cole o texto do seu currículo. Dá pra ter um de DevOps, um de back-end e assim por diante.
          </Empty>
        ) : data.map((r) => (
          <div className="list-row clickable" key={r.id} onClick={() => setEditing(r)}>
            <span className="avatar"><FileText size={16} /></span>
            <div className="row-main">
              <div className="row-title">{r.name}</div>
              <div className="row-sub">
                {focusLabels[r.focus]} · {r.language === "EN" ? "Inglês" : r.language === "ES" ? "Espanhol" : "Português"}
                {r._count ? ` · usado em ${r._count.applications} candidatura(s)` : ""}
                {!r.content?.trim() && " · sem texto, não entra na comparação"}
              </div>
            </div>
          </div>
        ))}
      </section>

      {data && data.length > 0 && (
        <section className="card">
          <div className="card-head"><h2>Testar com uma vaga</h2></div>
          <div className="card-pad" style={{ display: "grid", gap: 14 }}>
            <textarea className="textarea" rows={5} placeholder="Cole aqui a descrição de uma vaga para ver qual currículo combina mais" value={test} onChange={(e) => setTest(e.target.value)} />
            {test.trim().length > 20 && <MatchPanel text={test} />}
          </div>
        </section>
      )}

      {editing && (
        <ResumeForm
          resume={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await reload(); toast({ text: "Currículo salvo" }); }}
          onDeleted={async () => { setEditing(null); await reload(); toast({ text: "Currículo excluído" }); }}
        />
      )}
    </div>
  );
}

type FormProps = { resume?: ResumeVersion; onClose: () => void; onSaved: () => void; onDeleted: () => void };

function ResumeForm({ resume, onClose, onSaved, onDeleted }: FormProps) {
  const [form, setForm] = useState<ResumeVersionPayload>({
    name: resume?.name ?? "",
    language: resume?.language ?? "PT_BR",
    focus: resume?.focus ?? "GENERAL",
    fileUrl: resume?.fileUrl ?? "",
    notes: resume?.notes ?? "",
    content: resume?.content ?? "",
  });
  const [err, setErr] = useState<string | null>(null);
  const set = <K extends keyof ResumeVersionPayload>(k: K, v: ResumeVersionPayload[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    try {
      if (resume) await updateResumeVersion(resume.id, form);
      else await createResumeVersion(form);
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  async function remove() {
    if (!resume || !window.confirm(`Excluir "${resume.name}"? As candidaturas que usaram ele ficam sem currículo marcado.`)) return;
    await deleteResumeVersion(resume.id);
    onDeleted();
  }

  return (
    <Modal
      title={resume ? "Editar currículo" : "Novo currículo"}
      onClose={onClose}
      footer={
        <>
          {resume && <button className="btn ghost danger" style={{ marginRight: "auto" }} onClick={remove}><Trash2 /> Excluir</button>}
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={save} disabled={!form.name.trim()}>Salvar</button>
        </>
      }
    >
      {err && <div className="alert" style={{ margin: 0 }}>{err}</div>}
      <div className="grid-3">
        <label className="field" style={{ gridColumn: "span 1" }}><span>Nome</span><input className="input" placeholder="ex.: DevOps PT" value={form.name} onChange={(e) => set("name", e.target.value)} /></label>
        <label className="field"><span>Foco</span>
          <select className="select" value={form.focus} onChange={(e) => set("focus", e.target.value as ResumeFocus)}>
            {(Object.keys(focusLabels) as ResumeFocus[]).map((f) => <option key={f} value={f}>{focusLabels[f]}</option>)}
          </select>
        </label>
        <label className="field"><span>Idioma</span>
          <select className="select" value={form.language} onChange={(e) => set("language", e.target.value as ResumeVersionPayload["language"])}>
            <option value="PT_BR">Português</option><option value="EN">Inglês</option><option value="ES">Espanhol</option>
          </select>
        </label>
      </div>
      <label className="field">
        <span>Texto do currículo</span>
        <textarea className="textarea" rows={12} placeholder="Abra o currículo, selecione tudo (Ctrl+A), copie e cole aqui" value={form.content} onChange={(e) => set("content", e.target.value)} />
        <small>É esse texto que o JobOps compara com as vagas.</small>
      </label>
      <label className="field"><span>Link do arquivo (opcional)</span><input className="input" type="url" placeholder="Google Drive, OneDrive…" value={form.fileUrl} onChange={(e) => set("fileUrl", e.target.value)} /></label>
    </Modal>
  );
}
