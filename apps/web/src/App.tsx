import { FormEvent, useEffect, useMemo, useState } from "react";
import { BarChart3, BriefcaseBusiness, CalendarClock, ExternalLink, Plus, RefreshCcw, Search } from "lucide-react";

import { createApplication, getMetricsSummary, listApplications } from "./api";
import type {
  ApplicationArea,
  ApplicationFilters,
  ApplicationLevel,
  ApplicationStatus,
  ContractType,
  CreateApplicationPayload,
  JobApplication,
  MetricsSummary,
  SourcePlatform,
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

const statusOptions = Object.keys(statusLabels) as ApplicationStatus[];
const areaOptions = Object.keys(areaLabels) as ApplicationArea[];
const levelOptions = Object.keys(levelLabels) as ApplicationLevel[];
const workModeOptions = Object.keys(workModeLabels) as WorkMode[];
const contractOptions = Object.keys(contractLabels) as ContractType[];
const sourceOptions = Object.keys(sourceLabels) as SourcePlatform[];

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

function formatDate(value?: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(
    new Date(value),
  );
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
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [metrics, setMetrics] = useState<MetricsSummary>(emptyMetrics);
  const [filters, setFilters] = useState<ApplicationFilters>({ search: "", status: "", area: "" });
  const [form, setForm] = useState<CreateApplicationPayload>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData(nextFilters = filters) {
    setLoading(true);
    setError(null);

    try {
      const [summary, items] = await Promise.all([getMetricsSummary(), listApplications(nextFilters)]);
      setMetrics(summary);
      setApplications(items);
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
    const total = applications.length;
    return total === 1 ? "1 vaga" : `${total} vagas`;
  }, [applications.length]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await createApplication({
        ...form,
        fitScore: form.fitScore === undefined || Number.isNaN(form.fitScore) ? undefined : Number(form.fitScore),
      });
      setForm(initialForm);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Nao foi possivel salvar a candidatura.");
    } finally {
      setSaving(false);
    }
  }

  function handleFilterChange(nextFilters: ApplicationFilters) {
    setFilters(nextFilters);
    void loadData(nextFilters);
  }

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Resumo">
        <div>
          <p className="eyebrow">JobOps</p>
          <h1>Pipeline de candidaturas</h1>
        </div>

        <button className="button button-secondary" type="button" onClick={() => void loadData()} disabled={loading}>
          <RefreshCcw size={16} aria-hidden="true" />
          Atualizar
        </button>
      </section>

      {error ? <div className="alert">{error}</div> : null}

      <section className="metrics-grid" aria-label="Metricas">
        {metricItems(metrics).map((item) => (
          <article className="metric-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </article>
        ))}
      </section>

      <section className="workspace-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
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

        <section className="panel list-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Operacao</p>
              <h2>Vagas rastreadas</h2>
            </div>
            <BarChart3 size={20} aria-hidden="true" />
          </div>

          <div className="filters">
            <label className="search-field">
              <Search size={16} aria-hidden="true" />
              <input
                value={filters.search ?? ""}
                onChange={(event) => handleFilterChange({ ...filters, search: event.target.value })}
                placeholder="Buscar empresa ou cargo"
              />
            </label>

            <select
              value={filters.status ?? ""}
              onChange={(event) =>
                handleFilterChange({ ...filters, status: event.target.value as ApplicationStatus | "" })
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
              onChange={(event) => handleFilterChange({ ...filters, area: event.target.value as ApplicationArea | "" })}
            >
              <option value="">Todas as areas</option>
              {areaOptions.map((area) => (
                <option key={area} value={area}>
                  {areaLabels[area]}
                </option>
              ))}
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
                      <span className={statusClass(application.status)}>{statusLabels[application.status]}</span>
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
                  </tr>
                ))}

                {!loading && applications.length === 0 ? (
                  <tr>
                    <td className="empty-state" colSpan={9}>
                      Nenhuma vaga encontrada.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
