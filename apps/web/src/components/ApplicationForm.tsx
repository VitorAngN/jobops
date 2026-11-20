import { Link2, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { createApplication, importJobUrl, updateApplication } from "../lib/api";
import { toInputDate } from "../lib/format";
import { areaLabels, contractLabels, levelLabels, platformLabels, statusLabels, workModeLabels } from "../lib/labels";
import type { CreateApplicationPayload, DiscoverySource, JobApplication, SourcePlatform } from "../lib/types";
import { Modal } from "./ui";

const blank: CreateApplicationPayload = {
  companyName: "",
  title: "",
  area: "BACKEND",
  level: "INTERNSHIP",
  workMode: "REMOTE",
  location: "",
  contractType: "INTERNSHIP",
  sourcePlatform: "LINKEDIN",
  jobUrl: "",
  status: "SAVED",
  notes: "",
};

const fromSource: Record<DiscoverySource, SourcePlatform> = { GUPY: "GUPY", GREENHOUSE: "GREENHOUSE", LEVER: "LEVER", ASHBY: "ASHBY", REMOTIVE: "OTHER" };

function options<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map((k) => <option key={k} value={k}>{labels[k]}</option>);
}

type Props = { application?: JobApplication; onClose: () => void; onSaved: (a: JobApplication) => void };

export function ApplicationForm({ application, onClose, onSaved }: Props) {
  const [form, setForm] = useState<CreateApplicationPayload>(() =>
    application
      ? {
          companyName: application.company.name,
          title: application.title,
          area: application.area,
          level: application.level,
          workMode: application.workMode,
          location: application.location ?? "",
          contractType: application.contractType,
          sourcePlatform: application.sourcePlatform,
          jobUrl: application.jobUrl ?? "",
          description: application.description ?? "",
          status: application.status,
          appliedAt: toInputDate(application.appliedAt),
          notes: application.notes ?? "",
        }
      : blank,
  );
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState<"import" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof CreateApplicationPayload>(k: K, v: CreateApplicationPayload[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function importLink() {
    if (!link) return;
    setBusy("import");
    setError(null);
    try {
      const job = await importJobUrl(link);
      setForm((f) => ({
        ...f,
        title: job.title,
        companyName: job.company,
        location: job.location ?? "",
        workMode: job.workMode,
        level: job.level,
        contractType: job.level === "INTERNSHIP" ? "INTERNSHIP" : f.contractType,
        sourcePlatform: job.source ? fromSource[job.source] : link.includes("linkedin.com") ? "LINKEDIN" : "COMPANY_SITE",
        jobUrl: job.url,
        description: job.description ?? f.description,
      }));
    } catch (e) {
      setError(`Não deu para ler a página: ${(e as Error).message}. Preencha à mão.`);
      set("jobUrl", link);
    } finally {
      setBusy(null);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy("save");
    setError(null);
    try {
      const payload = { ...form, appliedAt: form.appliedAt || (form.status !== "SAVED" && !application ? new Date().toISOString() : undefined) };
      onSaved(application ? await updateApplication(application.id, payload) : await createApplication(payload));
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  return (
    <Modal
      title={application ? "Editar candidatura" : "Nova candidatura"}
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn primary" form="app-form" disabled={busy !== null}>{busy === "save" ? "Salvando…" : "Salvar"}</button>
        </>
      }
    >
      {!application && (
        <div className="field">
          <span>Link da vaga</span>
          <div className="inline-form">
            <input className="input" type="url" placeholder="Cole o link (Gupy, Greenhouse, Lever, site da empresa…)" value={link}
              onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), void importLink())} />
            <button type="button" className="btn" onClick={importLink} disabled={!link || busy !== null}>
              {busy === "import" ? <Loader2 className="spin" /> : <Link2 />} Preencher
            </button>
          </div>
        </div>
      )}
      {error && <div className="alert">{error}</div>}
      <form id="app-form" onSubmit={submit} style={{ display: "grid", gap: 14 }}>
        <div className="grid-2">
          <label className="field"><span>Vaga</span><input className="input" required value={form.title} onChange={(e) => set("title", e.target.value)} /></label>
          <label className="field"><span>Empresa</span><input className="input" required value={form.companyName} onChange={(e) => set("companyName", e.target.value)} /></label>
        </div>
        <div className="grid-3">
          <label className="field"><span>Status</span><select className="select" value={form.status} onChange={(e) => set("status", e.target.value as never)}>{options(statusLabels)}</select></label>
          <label className="field"><span>Nível</span><select className="select" value={form.level} onChange={(e) => set("level", e.target.value as never)}>{options(levelLabels)}</select></label>
          <label className="field"><span>Área</span><select className="select" value={form.area} onChange={(e) => set("area", e.target.value as never)}>{options(areaLabels)}</select></label>
        </div>
        <div className="grid-3">
          <label className="field"><span>Modalidade</span><select className="select" value={form.workMode} onChange={(e) => set("workMode", e.target.value as never)}>{options(workModeLabels)}</select></label>
          <label className="field"><span>Contrato</span><select className="select" value={form.contractType} onChange={(e) => set("contractType", e.target.value as never)}>{options(contractLabels)}</select></label>
          <label className="field"><span>Onde achou</span><select className="select" value={form.sourcePlatform} onChange={(e) => set("sourcePlatform", e.target.value as never)}>{options(platformLabels)}</select></label>
        </div>
        <div className="grid-2">
          <label className="field"><span>Local</span><input className="input" value={form.location} onChange={(e) => set("location", e.target.value)} /></label>
          <label className="field"><span>Aplicou em</span><input className="input" type="date" value={form.appliedAt ?? ""} onChange={(e) => set("appliedAt", e.target.value)} /></label>
        </div>
        <label className="field"><span>Link</span><input className="input" type="url" value={form.jobUrl} onChange={(e) => set("jobUrl", e.target.value)} /></label>
        <label className="field">
          <span>Descrição da vaga</span>
          <textarea className="textarea" rows={4} placeholder="Cole os requisitos da vaga: é com isso que o JobOps compara seus currículos" value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
        </label>
        <label className="field"><span>Anotações</span><textarea className="textarea" value={form.notes} onChange={(e) => set("notes", e.target.value)} /></label>
      </form>
    </Modal>
  );
}
