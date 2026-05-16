import type {
  ApplicationFilters,
  ApplicationDetail,
  CreateInteractionPayload,
  CreateApplicationPayload,
  CreateReminderPayload,
  JobApplication,
  MetricsSummary,
  PaginatedResponse,
  Reminder,
  UpdateApplicationPayload,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });
  } catch {
    throw new Error(
      `API indisponivel. Confira se o backend esta rodando em ${API_URL} e se o banco PostgreSQL foi iniciado.`,
    );
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

export function listReminders(): Promise<Reminder[]> {
  return request<Reminder[]>("/reminders?done=false");
}
