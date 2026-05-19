import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  LineChart,
  Menu,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createCompany,
  createApplication,
  createInteraction,
  createReminder,
  createResumeVersion,
  deleteApplication,
  deleteCompany,
  deleteResumeVersion,
  getApplication,
  getMetricsByArea,
  getMetricsByStatus,
  getMetricsSummary,
  listApplications,
  listCompanies,
  listReminders,
  listResumeVersions,
  updateCompany,
  updateApplication,
  updateReminder,
  updateResumeVersion,
} from "./api";
import type {
  ApplicationDetail,
  ApplicationArea,
  ApplicationFilters,
  ApplicationLevel,
  ApplicationStatus,
  AreaMetric,
  Company,
  CompanyPayload,
  ContractType,
  CreateInteractionPayload,
  CreateApplicationPayload,
  CreateReminderPayload,
  InteractionType,
  JobApplication,
  MetricsSummary,
  PaginationMeta,
  Reminder,
  ResumeVersion,
  ResumeVersionPayload,
  SourcePlatform,
  StatusMetric,
  WorkMode,
} from "./types";

const statusLabels: Record<ApplicationStatus, string> = {
  SAVED: "Salva",
  APPLIED: "Aplicada",
  RECRUITER_CONTACTED: "Recrutador",
  IN_REVIEW: "Em analise",
  TEST_SENT: "Teste",
  HR_INTERVIEW: "Entrevista RH",
  TECH_INTERVIEW: "Entrevista tecnica",
  WAITING_RESPONSE: "Aguardando",
  REJECTED: "Recusada",
  GHOSTED: "Sem retorno",
  OFFER: "Oferta",
  ARCHIVED: "Arquivada",
};

const areaLabels: Record<ApplicationArea, string> = {
  BACKEND: "Back-end",
  DEVOPS: "DevOps",
  CLOUD: "Cloud",
  FULLSTACK: "Full-stack",
  FRONTEND: "Front-end",
  DATA: "Dados",
  SECURITY: "Seguranca",
  OTHER: "Outra",
};

const levelLabels: Record<ApplicationLevel, string> = {
  INTERNSHIP: "Estagio",
  TRAINEE: "Trainee",
  JUNIOR: "Junior",
  MID: "Pleno",
  SENIOR: "Senior",
  UNKNOWN: "Nao informado",
};

const workModeLabels: Record<WorkMode, string> = {
  REMOTE: "Remoto",
  HYBRID: "Hibrido",
  ONSITE: "Presencial",
  UNKNOWN: "Nao informado",
};

const contractLabels: Record<ContractType, string> = {
  INTERNSHIP: "Estagio",
  CLT: "CLT",
  PJ: "PJ",
  TEMPORARY: "Temporario",
  OTHER: "Outro",
  UNKNOWN: "Nao informado",
};

const sourceLabels: Record<SourcePlatform, string> = {
  LINKEDIN: "LinkedIn",
  GUPY: "Gupy",
  COMPANY_SITE: "Site da empresa",
  INDEED: "Indeed",
  GLASSDOOR: "Glassdoor",
  GREENHOUSE: "Greenhouse",
  LEVER: "Lever",
  ASHBY: "Ashby",
  REFERRAL: "Indicacao",
  OTHER: "Outro",
};

const interactionLabels: Record<InteractionType, string> = {
  MESSAGE: "Mensagem",
  EMAIL: "Email",
  INTERVIEW: "Entrevista",
  TEST: "Teste",
  FEEDBACK: "Feedback",
  NOTE: "Nota",
};

const resumeLanguageLabels: Record<ResumeVersion["language"], string> = {
  PT_BR: "Portugues",
  EN: "Ingles",
  ES: "Espanhol",
};

const resumeFocusLabels: Record<ResumeVersion["focus"], string> = {
  BACKEND: "Back-end",
  DEVOPS: "DevOps",
  CLOUD: "Cloud",
  FULLSTACK: "Full-stack",
  GENERAL: "Geral",
};

const statusOptions = Object.keys(statusLabels) as ApplicationStatus[];
const areaOptions = Object.keys(areaLabels) as ApplicationArea[];
const levelOptions = Object.keys(levelLabels) as ApplicationLevel[];
const workModeOptions = Object.keys(workModeLabels) as WorkMode[];
const contractOptions = Object.keys(contractLabels) as ContractType[];
const sourceOptions = Object.keys(sourceLabels) as SourcePlatform[];
const interactionOptions = Object.keys(interactionLabels) as InteractionType[];
const resumeLanguageOptions = Object.keys(resumeLanguageLabels) as ResumeVersion["language"][];
const resumeFocusOptions = Object.keys(resumeFocusLabels) as ResumeVersion["focus"][];

const initialForm: CreateApplicationPayload = {
  companyName: "",
  title: "",
  area: "BACKEND",
  level: "INTERNSHIP",
  workMode: "REMOTE",
  location: "",
  contractType: "INTERNSHIP",
  sourcePlatform: "LINKEDIN",
  jobUrl: "",
  resumeVersionId: "",
  status: "SAVED",
  fitScore: undefined,
  appliedAt: "",
  nextAction: "",
  followUpAt: "",
  notes: "",
};

const emptyMetrics: MetricsSummary = {
  total: 0,
  appliedLast7Days: 0,
  responded: 0,
  interviews: 0,
  pendingFollowUps: 0,
  responseRate: 0,
  interviewRate: 0,
};

const emptyPagination: PaginationMeta = {
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const initialInteractionForm: CreateInteractionPayload = {
  type: "NOTE",
  contactName: "",
  contactRole: "",
  contactUrl: "",
  description: "",
};

const initialReminderForm: CreateReminderPayload = {
  title: "",
  dueAt: "",
};

const initialCompanyForm: CompanyPayload = {
  name: "",
  website: "",
  sector: "",
  location: "",
  notes: "",
};

const initialResumeForm: ResumeVersionPayload = {
  name: "",
  language: "PT_BR",
  focus: "GENERAL",
  fileUrl: "",
  notes: "",
};

function formatDate(value?: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(
    new Date(value),
  );
}

function toDateInput(value?: string | null): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function applicationToForm(application: ApplicationDetail): CreateApplicationPayload {
  return {
    companyName: application.company.name,
    title: application.title,
    area: application.area,
    level: application.level,
    workMode: application.workMode,
    location: application.location ?? "",
    contractType: application.contractType,
    sourcePlatform: application.sourcePlatform,
    jobUrl: application.jobUrl ?? "",
    resumeVersionId: application.resumeVersion?.id ?? "",
    status: application.status,
    fitScore: application.fitScore ?? undefined,
    appliedAt: toDateInput(application.appliedAt),
    nextAction: application.nextAction ?? "",
    followUpAt: toDateInput(application.followUpAt),
    notes: application.notes ?? "",
  };
}

function escapeCsv(value: unknown): string {
  const normalized = value === null || value === undefined ? "" : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
}

function downloadFile(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildExportRows(applications: JobApplication[]) {
  return applications.map((application) => ({
    empresa: application.company.name,
    vaga: application.title,
    status: statusLabels[application.status],
    area: areaLabels[application.area],
    nivel: levelLabels[application.level],
    modalidade: workModeLabels[application.workMode],
    contrato: contractLabels[application.contractType],
    plataforma: sourceLabels[application.sourcePlatform],
    fit: application.fitScore ?? "",
    aplicacao: formatDate(application.appliedAt),
    curriculo: application.resumeVersion?.name ?? "",
    proximaAcao: application.nextAction ?? "",
    link: application.jobUrl ?? "",
    observacoes: application.notes ?? "",
  }));
}

function toCsv(applications: JobApplication[]): string {
  const rows = buildExportRows(applications);
  const headers = Object.keys(rows[0] ?? {
    empresa: "",
    vaga: "",
    status: "",
    area: "",
    nivel: "",
    modalidade: "",
    contrato: "",
    plataforma: "",
    fit: "",
    aplicacao: "",
    curriculo: "",
    proximaAcao: "",
    link: "",
    observacoes: "",
  });

  return [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header as keyof typeof row])).join(",")),
  ].join("\n");
}

function toExcelHtml(applications: JobApplication[]): string {
  const rows = buildExportRows(applications);
  const headers = Object.keys(rows[0] ?? {
    empresa: "",
    vaga: "",
    status: "",
    area: "",
    nivel: "",
    modalidade: "",
    contrato: "",
    plataforma: "",
    fit: "",
    aplicacao: "",
    curriculo: "",
    proximaAcao: "",
    link: "",
    observacoes: "",
  });

  const escapeHtml = (value: unknown) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  return `<!doctype html><html><head><meta charset="utf-8" /></head><body><table><thead><tr>${headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join("")}</tr></thead><tbody>${rows
    .map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(row[header as keyof typeof row])}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></body></html>`;
}

function statusClass(status: ApplicationStatus): string {
  return `status status-${status.toLowerCase().replaceAll("_", "-")}`;
}

function metricItems(metrics: MetricsSummary) {
  return [
    { label: "Candidaturas", value: metrics.total, detail: `${metrics.appliedLast7Days} nos ultimos 7 dias` },
    { label: "Taxa de resposta", value: `${metrics.responseRate}%`, detail: `${metrics.responded} com retorno` },
    { label: "Taxa de entrevista", value: `${metrics.interviewRate}%`, detail: `${metrics.interviews} avancaram` },
    { label: "Follow-ups", value: metrics.pendingFollowUps, detail: "pendentes para hoje" },
  ];
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [resumeVersions, setResumeVersions] = useState<ResumeVersion[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [metrics, setMetrics] = useState<MetricsSummary>(emptyMetrics);
  const [statusMetrics, setStatusMetrics] = useState<StatusMetric[]>([]);
  const [areaMetrics, setAreaMetrics] = useState<AreaMetric[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
  const [filters, setFilters] = useState<ApplicationFilters>({
    search: "",
    status: "",
    area: "",
    page: 1,
    pageSize: 20,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const [form, setForm] = useState<CreateApplicationPayload>(initialForm);
  const [editForm, setEditForm] = useState<CreateApplicationPayload>(initialForm);
  const [companyForm, setCompanyForm] = useState<CompanyPayload>(initialCompanyForm);
  const [resumeForm, setResumeForm] = useState<ResumeVersionPayload>(initialResumeForm);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetail | null>(null);
  const [interactionForm, setInteractionForm] = useState<CreateInteractionPayload>(initialInteractionForm);
  const [reminderForm, setReminderForm] = useState<CreateReminderPayload>(initialReminderForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadData(nextFilters = filters) {
    setLoading(true);
    setError(null);

    try {
      const [summary, page, pendingReminders, companyList, resumeList, byStatus, byArea] = await Promise.all([
        getMetricsSummary(),
        listApplications(nextFilters),
        listReminders(),
        listCompanies(),
        listResumeVersions(),
        getMetricsByStatus(),
        getMetricsByArea(),
      ]);
      setMetrics(summary);
      setApplications(page.data);
      setPagination(page.meta);
      setReminders(pendingReminders);
      setCompanies(companyList);
      setResumeVersions(resumeList);
      setStatusMetrics(byStatus);
      setAreaMetrics(byArea);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar os dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCountLabel = useMemo(() => {
    const total = pagination.total;
    return total === 1 ? "1 vaga" : `${total} vagas`;
  }, [pagination.total]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await createApplication({
        ...form,
        fitScore: form.fitScore === undefined || Number.isNaN(form.fitScore) ? undefined : Number(form.fitScore),
      });
      setForm(initialForm);
      setSuccess("Candidatura salva com sucesso.");
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Nao foi possivel salvar a candidatura.");
    } finally {
      setSaving(false);
    }
  }

  function handleFilterChange(nextFilters: ApplicationFilters) {
    const normalizedFilters = {
      ...nextFilters,
      page: nextFilters.page ?? 1,
    };

    setFilters(normalizedFilters);
    void loadData(normalizedFilters);
  }

  function handlePageChange(page: number) {
    handleFilterChange({ ...filters, page });
  }

  async function handleStatusChange(application: JobApplication, status: ApplicationStatus) {
    setUpdatingId(application.id);
    setError(null);

    try {
      await updateApplication(application.id, { status });
      await loadData();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Nao foi possivel atualizar o status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function refreshApplicationDetail(applicationId: string) {
    const detail = await getApplication(applicationId);
    setSelectedApplication(detail);
    setEditForm(applicationToForm(detail));
  }

  async function handleOpenDetail(applicationId: string) {
    setDetailLoading(true);
    setError(null);

    try {
      await refreshApplicationDetail(applicationId);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : "Nao foi possivel abrir os detalhes.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreateInteraction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedApplication) return;

    setDetailLoading(true);
    setError(null);

    try {
      await createInteraction(selectedApplication.id, interactionForm);
      setInteractionForm(initialInteractionForm);
      await refreshApplicationDetail(selectedApplication.id);
    } catch (interactionError) {
      setError(interactionError instanceof Error ? interactionError.message : "Nao foi possivel registrar a interacao.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreateReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedApplication) return;

    setDetailLoading(true);
    setError(null);

    try {
      await createReminder(selectedApplication.id, reminderForm);
      setReminderForm(initialReminderForm);
      await refreshApplicationDetail(selectedApplication.id);
      await loadData();
    } catch (reminderError) {
      setError(reminderError instanceof Error ? reminderError.message : "Nao foi possivel criar o follow-up.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCompleteReminder(reminderId: string) {
    if (!selectedApplication) return;

    setDetailLoading(true);
    setError(null);

    try {
      await updateReminder(reminderId, { done: true });
      await refreshApplicationDetail(selectedApplication.id);
      await loadData();
    } catch (reminderError) {
      setError(reminderError instanceof Error ? reminderError.message : "Nao foi possivel concluir o lembrete.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleUpdateSelectedApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedApplication) return;

    setDetailLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateApplication(selectedApplication.id, {
        ...editForm,
        fitScore:
          editForm.fitScore === undefined || Number.isNaN(editForm.fitScore) ? undefined : Number(editForm.fitScore),
      });
      await refreshApplicationDetail(selectedApplication.id);
      await loadData();
      setSuccess("Candidatura atualizada com sucesso.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Nao foi possivel atualizar a candidatura.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleDeleteSelectedApplication() {
    if (!selectedApplication) return;

    const confirmed = window.confirm(`Excluir a candidatura "${selectedApplication.title}"?`);
    if (!confirmed) return;

    setDetailLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteApplication(selectedApplication.id);
      setSelectedApplication(null);
      await loadData();
      setSuccess("Candidatura excluida.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Nao foi possivel excluir a candidatura.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleExport(format: "csv" | "xls") {
    setError(null);
    setSuccess(null);

    try {
      const exportPage = await listApplications({ ...filters, page: 1, pageSize: 100 });
      const filenameDate = new Date().toISOString().slice(0, 10);

      if (format === "csv") {
        downloadFile(
          `jobops-candidaturas-${filenameDate}.csv`,
          toCsv(exportPage.data),
          "text/csv;charset=utf-8",
        );
      } else {
        downloadFile(
          `jobops-candidaturas-${filenameDate}.xls`,
          toExcelHtml(exportPage.data),
          "application/vnd.ms-excel;charset=utf-8",
        );
      }

      setSuccess(`Exportacao ${format.toUpperCase()} gerada com ${exportPage.data.length} candidaturas.`);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Nao foi possivel exportar os dados.");
    }
  }

  async function handleSaveCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingCompanyId) {
        await updateCompany(editingCompanyId, companyForm);
        setSuccess("Empresa atualizada.");
      } else {
        await createCompany(companyForm);
        setSuccess("Empresa cadastrada.");
      }

      setCompanyForm(initialCompanyForm);
      setEditingCompanyId(null);
      await loadData();
    } catch (companyError) {
      setError(companyError instanceof Error ? companyError.message : "Nao foi possivel salvar a empresa.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCompany(company: Company) {
    const confirmed = window.confirm(`Excluir a empresa "${company.name}"? Candidaturas vinculadas tambem podem ser afetadas.`);
    if (!confirmed) return;

    setError(null);
    setSuccess(null);

    try {
      await deleteCompany(company.id);
      await loadData();
      setSuccess("Empresa excluida.");
    } catch (companyError) {
      setError(companyError instanceof Error ? companyError.message : "Nao foi possivel excluir a empresa.");
    }
  }

  async function handleSaveResume(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingResumeId) {
        await updateResumeVersion(editingResumeId, resumeForm);
        setSuccess("Curriculo atualizado.");
      } else {
        await createResumeVersion(resumeForm);
        setSuccess("Curriculo cadastrado.");
      }

      setResumeForm(initialResumeForm);
      setEditingResumeId(null);
      await loadData();
    } catch (resumeError) {
      setError(resumeError instanceof Error ? resumeError.message : "Nao foi possivel salvar o curriculo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteResume(resume: ResumeVersion) {
    const confirmed = window.confirm(`Excluir a versao de curriculo "${resume.name}"?`);
    if (!confirmed) return;

    setError(null);
    setSuccess(null);

    try {
      await deleteResumeVersion(resume.id);
      await loadData();
      setSuccess("Curriculo excluido.");
    } catch (resumeError) {
      setError(resumeError instanceof Error ? resumeError.message : "Nao foi possivel excluir o curriculo.");
    }
  }

  function startCompanyEdit(company: Company) {
    setEditingCompanyId(company.id);
    setCompanyForm({
      name: company.name,
      website: company.website ?? "",
      sector: company.sector ?? "",
      location: company.location ?? "",
      notes: company.notes ?? "",
    });
  }

  function startResumeEdit(resume: ResumeVersion) {
    setEditingResumeId(resume.id);
    setResumeForm({
      name: resume.name,
      language: resume.language,
      focus: resume.focus,
      fileUrl: resume.fileUrl ?? "",
      notes: resume.notes ?? "",
    });
  }

  function navigateToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  }

  return (
    <main className="app-frame">
      <aside className={`side-menu ${menuOpen ? "side-menu-open" : ""}`} aria-label="Menu de ferramentas">
        <div className="side-menu-header">
          <div className="brand-mark">JO</div>
          <div>
            <p className="eyebrow">JobOps</p>
            <h2>Ferramentas</h2>
          </div>
          <button className="icon-button menu-close" type="button" onClick={() => setMenuOpen(false)}>
            <X size={18} aria-label="Fechar menu" />
          </button>
        </div>

        <nav className="side-nav" aria-label="Atalhos do painel">
          <button type="button" onClick={() => navigateToSection("overview")}>
            <BarChart3 size={18} aria-hidden="true" />
            <span>Dashboard</span>
          </button>
          <button type="button" onClick={() => navigateToSection("analytics")}>
            <LineChart size={18} aria-hidden="true" />
            <span>Analises</span>
          </button>
          <button type="button" onClick={() => navigateToSection("followups")}>
            <CalendarClock size={18} aria-hidden="true" />
            <span>Follow-ups</span>
          </button>
          <button type="button" onClick={() => navigateToSection("new-application")}>
            <Plus size={18} aria-hidden="true" />
            <span>Nova vaga</span>
          </button>
          <button type="button" onClick={() => navigateToSection("applications")}>
            <BriefcaseBusiness size={18} aria-hidden="true" />
            <span>Vagas rastreadas</span>
          </button>
          <button type="button" onClick={() => navigateToSection("resources")}>
            <Building2 size={18} aria-hidden="true" />
            <span>Empresas e curriculos</span>
          </button>
        </nav>

        <div className="side-tools">
          <p>Acao rapida</p>
          <button type="button" onClick={() => void loadData()} disabled={loading}>
            <RefreshCcw size={16} aria-hidden="true" />
            Atualizar dados
          </button>
          <button type="button" onClick={() => void handleExport("csv")}>
            <Download size={16} aria-hidden="true" />
            Exportar CSV
          </button>
          <button type="button" onClick={() => void handleExport("xls")}>
            <Download size={16} aria-hidden="true" />
            Exportar Excel
          </button>
        </div>
      </aside>

      {menuOpen ? <button className="menu-backdrop" type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} /> : null}

      <div className="app-shell">
        <section className="topbar" id="overview" aria-label="Resumo">
          <button className="menu-toggle" type="button" onClick={() => setMenuOpen(true)}>
            <Menu size={18} aria-hidden="true" />
            Ferramentas
          </button>

          <div>
            <p className="eyebrow">JobOps</p>
            <h1>Pipeline de candidaturas</h1>
            <span className="topbar-subtitle">Central de busca, follow-up, curriculos e empresas.</span>
          </div>

          <button className="button button-secondary" type="button" onClick={() => void loadData()} disabled={loading}>
            <RefreshCcw size={16} aria-hidden="true" />
            Atualizar
          </button>
        </section>

        {error ? <div className="alert">{error}</div> : null}
        {success ? <div className="notice">{success}</div> : null}

      <section className="metrics-grid" aria-label="Metricas">
        {metricItems(metrics).map((item) => (
          <article className="metric-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </article>
        ))}
      </section>

      <section className="charts-grid" id="analytics" aria-label="Graficos">
        <article className="panel chart-panel">
          <div className="panel-heading compact-heading">
            <div>
              <p className="eyebrow">Analitico</p>
              <h2>Status das candidaturas</h2>
            </div>
            <LineChart size={20} aria-hidden="true" />
          </div>
          <div className="bar-list">
            {statusMetrics.map((item) => {
              const max = Math.max(...statusMetrics.map((metric) => metric.total), 1);
              return (
                <div className="bar-row" key={item.status}>
                  <span>{statusLabels[item.status]}</span>
                  <div>
                    <i style={{ width: `${(item.total / max) * 100}%` }} />
                  </div>
                  <strong>{item.total}</strong>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel chart-panel">
          <div className="panel-heading compact-heading">
            <div>
              <p className="eyebrow">Distribuicao</p>
              <h2>Areas de foco</h2>
            </div>
            <BarChart3 size={20} aria-hidden="true" />
          </div>
          <div className="bar-list">
            {areaMetrics.map((item) => {
              const max = Math.max(...areaMetrics.map((metric) => metric.total), 1);
              return (
                <div className="bar-row" key={item.area}>
                  <span>{areaLabels[item.area]}</span>
                  <div>
                    <i style={{ width: `${(item.total / max) * 100}%` }} />
                  </div>
                  <strong>{item.total}</strong>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="panel reminders-panel" id="followups" aria-label="Follow-ups pendentes">
        <div className="panel-heading compact-heading">
          <div>
            <p className="eyebrow">Follow-ups</p>
            <h2>Lembretes ativos</h2>
          </div>
          <CalendarClock size={20} aria-hidden="true" />
        </div>

        <div className="reminder-list">
          {reminders.slice(0, 4).map((reminder) => (
            <button
              className="reminder-item"
              key={reminder.id}
              type="button"
              onClick={() => void handleOpenDetail(reminder.application.id)}
            >
              <div>
                <strong>{reminder.title}</strong>
                <span>
                  {reminder.application.company.name} - {reminder.application.title}
                </span>
              </div>
              <time>{formatDate(reminder.dueAt)}</time>
            </button>
          ))}

          {!loading && reminders.length === 0 ? <p className="empty-inline">Nenhum follow-up pendente.</p> : null}
        </div>
      </section>

      <section className="workspace-grid">
        <form className="panel form-panel" id="new-application" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Cadastro</p>
              <h2>Nova vaga</h2>
            </div>
            <BriefcaseBusiness size={20} aria-hidden="true" />
          </div>

          <div className="form-grid">
            <label>
              Empresa
              <input
                required
                value={form.companyName}
                onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
                placeholder="Cappta, TCS, XP..."
              />
            </label>

            <label>
              Cargo
              <input
                required
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Back-end Intern, DevOps Junior..."
              />
            </label>

            <label>
              Area
              <select
                value={form.area}
                onChange={(event) => setForm((current) => ({ ...current, area: event.target.value as ApplicationArea }))}
              >
                {areaOptions.map((area) => (
                  <option key={area} value={area}>
                    {areaLabels[area]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Nivel
              <select
                value={form.level}
                onChange={(event) =>
                  setForm((current) => ({ ...current, level: event.target.value as ApplicationLevel }))
                }
              >
                {levelOptions.map((level) => (
                  <option key={level} value={level}>
                    {levelLabels[level]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Modalidade
              <select
                value={form.workMode}
                onChange={(event) => setForm((current) => ({ ...current, workMode: event.target.value as WorkMode }))}
              >
                {workModeOptions.map((mode) => (
                  <option key={mode} value={mode}>
                    {workModeLabels[mode]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Contrato
              <select
                value={form.contractType}
                onChange={(event) =>
                  setForm((current) => ({ ...current, contractType: event.target.value as ContractType }))
                }
              >
                {contractOptions.map((contract) => (
                  <option key={contract} value={contract}>
                    {contractLabels[contract]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Plataforma
              <select
                value={form.sourcePlatform}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sourcePlatform: event.target.value as SourcePlatform }))
                }
              >
                {sourceOptions.map((source) => (
                  <option key={source} value={source}>
                    {sourceLabels[source]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({ ...current, status: event.target.value as ApplicationStatus }))
                }
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Local
              <input
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                placeholder="Remoto, Curitiba, Sao Paulo..."
              />
            </label>

            <label>
              Fit
              <input
                min="0"
                max="100"
                type="number"
                value={form.fitScore ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fitScore: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
                placeholder="0-100"
              />
            </label>

            <label>
              Aplicado em
              <input
                type="date"
                value={form.appliedAt}
                onChange={(event) => setForm((current) => ({ ...current, appliedAt: event.target.value }))}
              />
            </label>

            <label>
              Follow-up
              <input
                type="date"
                value={form.followUpAt}
                onChange={(event) => setForm((current) => ({ ...current, followUpAt: event.target.value }))}
              />
            </label>

            <label className="wide">
              Link
              <input
                type="url"
                value={form.jobUrl}
                onChange={(event) => setForm((current) => ({ ...current, jobUrl: event.target.value }))}
                placeholder="https://..."
              />
            </label>

            <label className="wide">
              Curriculo usado
              <select
                value={form.resumeVersionId ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, resumeVersionId: event.target.value }))}
              >
                <option value="">Nao vincular curriculo</option>
                {resumeVersions.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.name} - {resumeLanguageLabels[resume.language]} / {resumeFocusLabels[resume.focus]}
                  </option>
                ))}
              </select>
            </label>

            <label className="wide">
              Proxima acao
              <input
                value={form.nextAction}
                onChange={(event) => setForm((current) => ({ ...current, nextAction: event.target.value }))}
                placeholder="Enviar mensagem, fazer teste, acompanhar retorno..."
              />
            </label>

            <label className="wide">
              Observacoes
              <textarea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Resumo da vaga, nome do recrutador, pontos importantes..."
              />
            </label>
          </div>

          <button className="button button-primary" type="submit" disabled={saving}>
            <Plus size={16} aria-hidden="true" />
            {saving ? "Salvando..." : "Salvar candidatura"}
          </button>
        </form>

        <section className="panel list-panel" id="applications">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Operacao</p>
              <h2>Vagas rastreadas</h2>
            </div>
            <div className="panel-actions">
              <button className="button button-secondary" type="button" onClick={() => void handleExport("csv")}>
                <Download size={15} aria-hidden="true" />
                CSV
              </button>
              <button className="button button-secondary" type="button" onClick={() => void handleExport("xls")}>
                <Download size={15} aria-hidden="true" />
                Excel
              </button>
            </div>
          </div>

          <div className="filters">
            <label className="search-field">
              <Search size={16} aria-hidden="true" />
              <input
                value={filters.search ?? ""}
                onChange={(event) => handleFilterChange({ ...filters, search: event.target.value, page: 1 })}
                placeholder="Buscar empresa ou cargo"
              />
            </label>

            <select
              value={filters.status ?? ""}
              onChange={(event) =>
                handleFilterChange({ ...filters, status: event.target.value as ApplicationStatus | "", page: 1 })
              }
            >
              <option value="">Todos os status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>

            <select
              value={filters.area ?? ""}
              onChange={(event) =>
                handleFilterChange({ ...filters, area: event.target.value as ApplicationArea | "", page: 1 })
              }
            >
              <option value="">Todas as areas</option>
              {areaOptions.map((area) => (
                <option key={area} value={area}>
                  {areaLabels[area]}
                </option>
              ))}
            </select>

            <select
              value={filters.sortBy ?? "updatedAt"}
              onChange={(event) =>
                handleFilterChange({
                  ...filters,
                  sortBy: event.target.value as ApplicationFilters["sortBy"],
                  page: 1,
                })
              }
            >
              <option value="updatedAt">Mais recentes</option>
              <option value="appliedAt">Data de aplicacao</option>
              <option value="fitScore">Fit</option>
              <option value="companyName">Empresa</option>
              <option value="title">Cargo</option>
            </select>
          </div>

          <div className="table-meta">
            <span>{loading ? "Carregando..." : filteredCountLabel}</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Vaga</th>
                  <th>Status</th>
                  <th>Area</th>
                  <th>Modalidade</th>
                  <th>Fit</th>
                  <th>Aplicacao</th>
                  <th>Acao</th>
                  <th>Link</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <strong>{application.company.name}</strong>
                      <small>{sourceLabels[application.sourcePlatform]}</small>
                    </td>
                    <td>
                      <span>{application.title}</span>
                      <small>{levelLabels[application.level]}</small>
                    </td>
                    <td>
                      <select
                        className={statusClass(application.status)}
                        value={application.status}
                        disabled={updatingId === application.id}
                        onChange={(event) =>
                          void handleStatusChange(application, event.target.value as ApplicationStatus)
                        }
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{areaLabels[application.area]}</td>
                    <td>
                      <span>{workModeLabels[application.workMode]}</span>
                      <small>{application.location || "-"}</small>
                    </td>
                    <td>{application.fitScore ?? "-"}</td>
                    <td>{formatDate(application.appliedAt)}</td>
                    <td className="next-action">
                      <CalendarClock size={14} aria-hidden="true" />
                      <span>{application.nextAction || "-"}</span>
                    </td>
                    <td>
                      {application.jobUrl ? (
                        <a className="icon-link" href={application.jobUrl} target="_blank" rel="noreferrer">
                          <ExternalLink size={16} aria-label="Abrir vaga" />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <button
                        className="table-action"
                        type="button"
                        onClick={() => void handleOpenDetail(application.id)}
                      >
                        Abrir
                      </button>
                    </td>
                  </tr>
                ))}

                {!loading && applications.length === 0 ? (
                  <tr>
                    <td className="empty-state" colSpan={10}>
                      Nenhuma vaga encontrada.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              className="button button-secondary"
              type="button"
              disabled={!pagination.hasPreviousPage || loading}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Anterior
            </button>
            <span>
              Pagina {pagination.page} de {pagination.totalPages}
            </span>
            <button
              className="button button-secondary"
              type="button"
              disabled={!pagination.hasNextPage || loading}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Proxima
            </button>
          </div>
        </section>
      </section>

      <section className="management-grid" id="resources" aria-label="Cadastros auxiliares">
        <article className="panel management-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Empresas</p>
              <h2>Cadastro de empresas</h2>
            </div>
            <Building2 size={20} aria-hidden="true" />
          </div>

          <form className="compact-form" onSubmit={handleSaveCompany}>
            <input
              required
              value={companyForm.name}
              onChange={(event) => setCompanyForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nome da empresa"
            />
            <input
              value={companyForm.sector}
              onChange={(event) => setCompanyForm((current) => ({ ...current, sector: event.target.value }))}
              placeholder="Setor"
            />
            <input
              value={companyForm.location}
              onChange={(event) => setCompanyForm((current) => ({ ...current, location: event.target.value }))}
              placeholder="Localizacao"
            />
            <input
              type="url"
              value={companyForm.website}
              onChange={(event) => setCompanyForm((current) => ({ ...current, website: event.target.value }))}
              placeholder="https://empresa.com"
            />
            <textarea
              value={companyForm.notes}
              onChange={(event) => setCompanyForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Observacoes sobre empresa, recrutadores ou processo"
            />
            <div className="inline-actions">
              <button className="button button-primary" type="submit" disabled={saving}>
                {editingCompanyId ? "Atualizar empresa" : "Salvar empresa"}
              </button>
              {editingCompanyId ? (
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => {
                    setEditingCompanyId(null);
                    setCompanyForm(initialCompanyForm);
                  }}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>

          <div className="resource-list">
            {companies.map((company) => (
              <div className="resource-row" key={company.id}>
                <div>
                  <strong>{company.name}</strong>
                  <span>
                    {company.sector || "Sem setor"} - {company._count?.applications ?? 0} candidaturas
                  </span>
                </div>
                <div className="row-actions">
                  <button className="icon-button" type="button" onClick={() => startCompanyEdit(company)}>
                    <Pencil size={15} aria-label="Editar empresa" />
                  </button>
                  <button className="icon-button danger-icon" type="button" onClick={() => void handleDeleteCompany(company)}>
                    <Trash2 size={15} aria-label="Excluir empresa" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel management-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Curriculos</p>
              <h2>Versoes usadas</h2>
            </div>
            <FileText size={20} aria-hidden="true" />
          </div>

          <form className="compact-form" onSubmit={handleSaveResume}>
            <input
              required
              value={resumeForm.name}
              onChange={(event) => setResumeForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Back-end PT-BR, DevOps EN..."
            />
            <select
              value={resumeForm.language}
              onChange={(event) =>
                setResumeForm((current) => ({ ...current, language: event.target.value as ResumeVersion["language"] }))
              }
            >
              {resumeLanguageOptions.map((language) => (
                <option key={language} value={language}>
                  {resumeLanguageLabels[language]}
                </option>
              ))}
            </select>
            <select
              value={resumeForm.focus}
              onChange={(event) =>
                setResumeForm((current) => ({ ...current, focus: event.target.value as ResumeVersion["focus"] }))
              }
            >
              {resumeFocusOptions.map((focus) => (
                <option key={focus} value={focus}>
                  {resumeFocusLabels[focus]}
                </option>
              ))}
            </select>
            <input
              type="url"
              value={resumeForm.fileUrl}
              onChange={(event) => setResumeForm((current) => ({ ...current, fileUrl: event.target.value }))}
              placeholder="Link do arquivo, se tiver"
            />
            <textarea
              value={resumeForm.notes}
              onChange={(event) => setResumeForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Quando usar esta versao?"
            />
            <div className="inline-actions">
              <button className="button button-primary" type="submit" disabled={saving}>
                {editingResumeId ? "Atualizar curriculo" : "Salvar curriculo"}
              </button>
              {editingResumeId ? (
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => {
                    setEditingResumeId(null);
                    setResumeForm(initialResumeForm);
                  }}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>

          <div className="resource-list">
            {resumeVersions.map((resume) => (
              <div className="resource-row" key={resume.id}>
                <div>
                  <strong>{resume.name}</strong>
                  <span>
                    {resumeLanguageLabels[resume.language]} - {resumeFocusLabels[resume.focus]} -{" "}
                    {resume._count?.applications ?? 0} candidaturas
                  </span>
                </div>
                <div className="row-actions">
                  <button className="icon-button" type="button" onClick={() => startResumeEdit(resume)}>
                    <Pencil size={15} aria-label="Editar curriculo" />
                  </button>
                  <button className="icon-button danger-icon" type="button" onClick={() => void handleDeleteResume(resume)}>
                    <Trash2 size={15} aria-label="Excluir curriculo" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {selectedApplication ? (
        <aside className="detail-drawer" aria-label="Detalhes da candidatura">
          <div className="detail-panel">
            <div className="detail-header">
              <div>
                <p className="eyebrow">Candidatura</p>
                <h2>{selectedApplication.title}</h2>
                <span>{selectedApplication.company.name}</span>
              </div>
              <button className="icon-button" type="button" onClick={() => setSelectedApplication(null)}>
                <X size={18} aria-label="Fechar detalhes" />
              </button>
            </div>

            <div className="detail-grid">
              <div>
                <small>Status</small>
                <strong>{statusLabels[selectedApplication.status]}</strong>
              </div>
              <div>
                <small>Fit</small>
                <strong>{selectedApplication.fitScore ?? "-"}</strong>
              </div>
              <div>
                <small>Aplicacao</small>
                <strong>{formatDate(selectedApplication.appliedAt)}</strong>
              </div>
              <div>
                <small>Retorno</small>
                <strong>{formatDate(selectedApplication.lastResponseAt)}</strong>
              </div>
            </div>

            {selectedApplication.notes ? <p className="detail-notes">{selectedApplication.notes}</p> : null}

            <section className="detail-section">
              <div className="detail-section-title">
                <Pencil size={16} aria-hidden="true" />
                <h3>Editar candidatura</h3>
              </div>

              <form className="edit-form" onSubmit={handleUpdateSelectedApplication}>
                <label>
                  Empresa
                  <input
                    required
                    value={editForm.companyName}
                    onChange={(event) => setEditForm((current) => ({ ...current, companyName: event.target.value }))}
                  />
                </label>
                <label>
                  Cargo
                  <input
                    required
                    value={editForm.title}
                    onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
                  />
                </label>
                <label>
                  Status
                  <select
                    value={editForm.status}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, status: event.target.value as ApplicationStatus }))
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Area
                  <select
                    value={editForm.area}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, area: event.target.value as ApplicationArea }))
                    }
                  >
                    {areaOptions.map((area) => (
                      <option key={area} value={area}>
                        {areaLabels[area]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Nivel
                  <select
                    value={editForm.level}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, level: event.target.value as ApplicationLevel }))
                    }
                  >
                    {levelOptions.map((level) => (
                      <option key={level} value={level}>
                        {levelLabels[level]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Modalidade
                  <select
                    value={editForm.workMode}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, workMode: event.target.value as WorkMode }))
                    }
                  >
                    {workModeOptions.map((mode) => (
                      <option key={mode} value={mode}>
                        {workModeLabels[mode]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Contrato
                  <select
                    value={editForm.contractType}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, contractType: event.target.value as ContractType }))
                    }
                  >
                    {contractOptions.map((contract) => (
                      <option key={contract} value={contract}>
                        {contractLabels[contract]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Plataforma
                  <select
                    value={editForm.sourcePlatform}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, sourcePlatform: event.target.value as SourcePlatform }))
                    }
                  >
                    {sourceOptions.map((source) => (
                      <option key={source} value={source}>
                        {sourceLabels[source]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Fit
                  <input
                    min="0"
                    max="100"
                    type="number"
                    value={editForm.fitScore ?? ""}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        fitScore: event.target.value ? Number(event.target.value) : undefined,
                      }))
                    }
                  />
                </label>
                <label>
                  Aplicado em
                  <input
                    type="date"
                    value={editForm.appliedAt}
                    onChange={(event) => setEditForm((current) => ({ ...current, appliedAt: event.target.value }))}
                  />
                </label>
                <label className="wide">
                  Local
                  <input
                    value={editForm.location}
                    onChange={(event) => setEditForm((current) => ({ ...current, location: event.target.value }))}
                  />
                </label>
                <label className="wide">
                  Link
                  <input
                    type="url"
                    value={editForm.jobUrl}
                    onChange={(event) => setEditForm((current) => ({ ...current, jobUrl: event.target.value }))}
                  />
                </label>
                <label className="wide">
                  Curriculo
                  <select
                    value={editForm.resumeVersionId ?? ""}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, resumeVersionId: event.target.value }))
                    }
                  >
                    <option value="">Nao vincular curriculo</option>
                    {resumeVersions.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.name} - {resumeLanguageLabels[resume.language]} / {resumeFocusLabels[resume.focus]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="wide">
                  Proxima acao
                  <input
                    value={editForm.nextAction}
                    onChange={(event) => setEditForm((current) => ({ ...current, nextAction: event.target.value }))}
                  />
                </label>
                <label className="wide">
                  Observacoes
                  <textarea
                    value={editForm.notes}
                    onChange={(event) => setEditForm((current) => ({ ...current, notes: event.target.value }))}
                  />
                </label>
                <div className="drawer-actions wide">
                  <button className="button button-primary" type="submit" disabled={detailLoading}>
                    <Save size={16} aria-hidden="true" />
                    Salvar alteracoes
                  </button>
                  <button
                    className="button danger-button"
                    type="button"
                    disabled={detailLoading}
                    onClick={() => void handleDeleteSelectedApplication()}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    Excluir candidatura
                  </button>
                </div>
              </form>
            </section>

            <section className="detail-section">
              <div className="detail-section-title">
                <MessageSquare size={16} aria-hidden="true" />
                <h3>Historico</h3>
              </div>

              <div className="timeline">
                {selectedApplication.interactions.map((interaction) => (
                  <article className="timeline-item" key={interaction.id}>
                    <div>
                      <strong>{interactionLabels[interaction.type]}</strong>
                      <span>{formatDate(interaction.happenedAt)}</span>
                    </div>
                    <p>{interaction.description}</p>
                    {interaction.contactName ? (
                      <small>
                        {interaction.contactName}
                        {interaction.contactRole ? ` - ${interaction.contactRole}` : ""}
                      </small>
                    ) : null}
                  </article>
                ))}

                {selectedApplication.interactions.length === 0 ? (
                  <p className="empty-inline">Nenhuma interacao registrada.</p>
                ) : null}
              </div>

              <form className="inline-form" onSubmit={handleCreateInteraction}>
                <select
                  value={interactionForm.type}
                  onChange={(event) =>
                    setInteractionForm((current) => ({ ...current, type: event.target.value as InteractionType }))
                  }
                >
                  {interactionOptions.map((type) => (
                    <option key={type} value={type}>
                      {interactionLabels[type]}
                    </option>
                  ))}
                </select>
                <input
                  value={interactionForm.contactName}
                  onChange={(event) => setInteractionForm((current) => ({ ...current, contactName: event.target.value }))}
                  placeholder="Contato"
                />
                <input
                  value={interactionForm.contactRole}
                  onChange={(event) => setInteractionForm((current) => ({ ...current, contactRole: event.target.value }))}
                  placeholder="Cargo"
                />
                <textarea
                  required
                  value={interactionForm.description}
                  onChange={(event) =>
                    setInteractionForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="O que aconteceu?"
                />
                <button className="button button-primary" type="submit" disabled={detailLoading}>
                  Registrar interacao
                </button>
              </form>
            </section>

            <section className="detail-section">
              <div className="detail-section-title">
                <CalendarClock size={16} aria-hidden="true" />
                <h3>Follow-ups</h3>
              </div>

              <div className="timeline">
                {selectedApplication.reminders.map((reminder) => (
                  <article className="timeline-item reminder-row" key={reminder.id}>
                    <div>
                      <strong>{reminder.title}</strong>
                      <span>{formatDate(reminder.dueAt)}</span>
                    </div>
                    <button
                      className="complete-button"
                      type="button"
                      disabled={reminder.done || detailLoading}
                      onClick={() => void handleCompleteReminder(reminder.id)}
                    >
                      <CheckCircle2 size={15} aria-hidden="true" />
                      {reminder.done ? "Concluido" : "Concluir"}
                    </button>
                  </article>
                ))}

                {selectedApplication.reminders.length === 0 ? (
                  <p className="empty-inline">Nenhum follow-up criado.</p>
                ) : null}
              </div>

              <form className="inline-form two-columns" onSubmit={handleCreateReminder}>
                <input
                  required
                  value={reminderForm.title}
                  onChange={(event) => setReminderForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Titulo do follow-up"
                />
                <input
                  required
                  type="date"
                  value={reminderForm.dueAt}
                  onChange={(event) => setReminderForm((current) => ({ ...current, dueAt: event.target.value }))}
                />
                <button className="button button-primary" type="submit" disabled={detailLoading}>
                  Criar follow-up
                </button>
              </form>
            </section>
          </div>
        </aside>
      ) : null}
      </div>
    </main>
  );
}
