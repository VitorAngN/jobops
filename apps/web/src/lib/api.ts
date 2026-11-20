import type {
  ApplicationFilters,
  ApplicationDetail,
  AreaMetric,
  Company,
  CompanyPayload,
  CreateInteractionPayload,
  CreateApplicationPayload,
  CreateReminderPayload,
  JobApplication,
  MetricsSummary,
  PaginatedResponse,
  Reminder,
  ResumeVersion,
  ResumeVersionPayload,
  StatusMetric,
  UpdateApplicationPayload,
  DiscoveredJob,
  DiscoveredStatus,
  DiscoveryRun,
  DiscoverySource,
  ImportedJob,
  SearchProfile,
  SearchProfilePayload,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api";
const TOKEN_KEY = "jobops.sessao";

export const session = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string | null) => {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* navegador sem armazenamento: a sessão dura até fechar a aba */
    }
  },
};

/** Avisado quando a API responde 401 (sessão vencida), para voltar ao login. */
export const onUnauthorized = { handler: () => {} };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    const token = session.get();
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });
  } catch {
    throw new Error(
      `Não foi possível falar com a API em ${API_URL}. Ela pode estar iniciando (o plano gratuito dorme); tente de novo em alguns segundos.`,
    );
  }

  if (response.status === 401 && !path.startsWith("/auth/")) {
    session.set(null);
    onUnauthorized.handler();
  }

  if (!response.ok) {
    const body = await response.text();
    let parsedMessage: string | undefined;

    try {
      const parsed = JSON.parse(body) as { message?: string; error?: string };
      parsedMessage = parsed.message ?? parsed.error;
    } catch {
      parsedMessage = undefined;
    }

    throw new Error(parsedMessage ?? (body || `Request failed with status ${response.status}`));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function toQueryString(filters: ApplicationFilters): string {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.area) params.set("area", filters.area);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

  const query = params.toString();
  return query ? `?${query}` : "";
}

function compactPayload<T extends object>(payload: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== "" && value !== undefined && value !== null),
  );
}

export function listApplications(filters: ApplicationFilters): Promise<PaginatedResponse<JobApplication>> {
  return request<PaginatedResponse<JobApplication>>(`/applications${toQueryString(filters)}`);
}

export function createApplication(payload: CreateApplicationPayload): Promise<JobApplication> {
  return request<JobApplication>("/applications", {
    method: "POST",
    body: JSON.stringify(compactPayload(payload)),
  });
}

export function updateApplication(id: string, payload: UpdateApplicationPayload): Promise<JobApplication> {
  return request<JobApplication>(`/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(compactPayload(payload)),
  });
}

export function deleteApplication(id: string): Promise<void> {
  return request<void>(`/applications/${id}`, {
    method: "DELETE",
  });
}

export function getApplication(id: string): Promise<ApplicationDetail> {
  return request<ApplicationDetail>(`/applications/${id}`);
}

export function createInteraction(applicationId: string, payload: CreateInteractionPayload) {
  return request(`/applications/${applicationId}/interactions`, {
    method: "POST",
    body: JSON.stringify(compactPayload(payload)),
  });
}

export function createReminder(applicationId: string, payload: CreateReminderPayload) {
  return request(`/applications/${applicationId}/reminders`, {
    method: "POST",
    body: JSON.stringify(compactPayload(payload)),
  });
}

export function updateReminder(id: string, payload: { done?: boolean; title?: string; dueAt?: string }) {
  return request(`/reminders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(compactPayload(payload)),
  });
}

export function getMetricsSummary(): Promise<MetricsSummary> {
  return request<MetricsSummary>("/metrics/summary");
}

export function getMetricsByStatus(): Promise<StatusMetric[]> {
  return request<StatusMetric[]>("/metrics/by-status");
}

export function getMetricsByArea(): Promise<AreaMetric[]> {
  return request<AreaMetric[]>("/metrics/by-area");
}

export function listReminders(): Promise<Reminder[]> {
  return request<Reminder[]>("/reminders?done=false");
}

export function listCompanies(): Promise<Company[]> {
  return request<Company[]>("/companies");
}

export function createCompany(payload: CompanyPayload): Promise<Company> {
  return request<Company>("/companies", {
    method: "POST",
    body: JSON.stringify(compactPayload(payload)),
  });
}

export function updateCompany(id: string, payload: Partial<CompanyPayload>): Promise<Company> {
  return request<Company>(`/companies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(compactPayload(payload)),
  });
}

export function deleteCompany(id: string): Promise<void> {
  return request<void>(`/companies/${id}`, {
    method: "DELETE",
  });
}

export function listResumeVersions(): Promise<ResumeVersion[]> {
  return request<ResumeVersion[]>("/resume-versions");
}

export function createResumeVersion(payload: ResumeVersionPayload): Promise<ResumeVersion> {
  return request<ResumeVersion>("/resume-versions", {
    method: "POST",
    body: JSON.stringify(compactPayload(payload)),
  });
}

export function updateResumeVersion(id: string, payload: Partial<ResumeVersionPayload>): Promise<ResumeVersion> {
  return request<ResumeVersion>(`/resume-versions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(compactPayload(payload)),
  });
}

export function deleteResumeVersion(id: string): Promise<void> {
  return request<void>(`/resume-versions/${id}`, {
    method: "DELETE",
  });
}

// ---------- Login ----------

export function getAuthStatus(): Promise<{ authRequired: boolean }> {
  return request("/auth/status");
}

export async function login(password: string): Promise<void> {
  const { token } = await request<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
  session.set(token);
}

// ---------- Busca automática ----------

export function listDiscovered(status: DiscoveredStatus, filters: { source?: DiscoverySource | ""; q?: string } = {}) {
  const params = new URLSearchParams({ status });
  if (filters.source) params.set("source", filters.source);
  if (filters.q) params.set("q", filters.q);
  return request<{ jobs: DiscoveredJob[]; counts: Partial<Record<DiscoveredStatus, number>> }>(`/discovery/jobs?${params}`);
}

export const approveDiscovered = (id: string) => request<JobApplication>(`/discovery/jobs/${id}/approve`, { method: "POST" });
export const discardDiscovered = (id: string) => request<DiscoveredJob>(`/discovery/jobs/${id}/discard`, { method: "POST" });
export const restoreDiscovered = (id: string) => request<DiscoveredJob>(`/discovery/jobs/${id}/restore`, { method: "POST" });

export const runDiscovery = (profileId?: string) =>
  request<{ found: number; created: number; errors: string[] }>("/discovery/run", {
    method: "POST",
    body: JSON.stringify(profileId ? { profileId } : {}),
  });

export const listRuns = () => request<DiscoveryRun[]>("/discovery/runs");
export const listProfiles = () => request<SearchProfile[]>("/discovery/profiles");

export const saveProfile = (payload: SearchProfilePayload, id?: string) =>
  request<SearchProfile>(id ? `/discovery/profiles/${id}` : "/discovery/profiles", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(payload),
  });

export const deleteProfile = (id: string) => request<void>(`/discovery/profiles/${id}`, { method: "DELETE" });

export const importJobUrl = (url: string) =>
  request<ImportedJob>("/discovery/import", { method: "POST", body: JSON.stringify({ url }) });
