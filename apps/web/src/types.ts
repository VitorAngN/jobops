export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "RECRUITER_CONTACTED"
  | "IN_REVIEW"
  | "TEST_SENT"
  | "HR_INTERVIEW"
  | "TECH_INTERVIEW"
  | "WAITING_RESPONSE"
  | "REJECTED"
  | "GHOSTED"
  | "OFFER"
  | "ARCHIVED";

export type ApplicationArea =
  | "BACKEND"
  | "DEVOPS"
  | "CLOUD"
  | "FULLSTACK"
  | "FRONTEND"
  | "DATA"
  | "SECURITY"
  | "OTHER";

export type ApplicationLevel = "INTERNSHIP" | "TRAINEE" | "JUNIOR" | "MID" | "SENIOR" | "UNKNOWN";
export type WorkMode = "REMOTE" | "HYBRID" | "ONSITE" | "UNKNOWN";
export type ContractType = "INTERNSHIP" | "CLT" | "PJ" | "TEMPORARY" | "OTHER" | "UNKNOWN";
export type SourcePlatform =
  | "LINKEDIN"
  | "GUPY"
  | "COMPANY_SITE"
  | "INDEED"
  | "GLASSDOOR"
  | "GREENHOUSE"
  | "LEVER"
  | "ASHBY"
  | "REFERRAL"
  | "OTHER";

export type Company = {
  id: string;
  name: string;
  website?: string | null;
  sector?: string | null;
  location?: string | null;
  notes?: string | null;
  _count?: {
    applications: number;
  };
};

export type ResumeVersion = {
  id: string;
  name: string;
  language: "PT_BR" | "EN" | "ES";
  focus: "BACKEND" | "DEVOPS" | "CLOUD" | "FULLSTACK" | "GENERAL";
  fileUrl?: string | null;
  notes?: string | null;
  _count?: {
    applications: number;
  };
};

export type JobApplication = {
  id: string;
  title: string;
  area: ApplicationArea;
  level: ApplicationLevel;
  workMode: WorkMode;
  location?: string | null;
  contractType: ContractType;
  sourcePlatform: SourcePlatform;
  jobUrl?: string | null;
  description?: string | null;
  status: ApplicationStatus;
  fitScore?: number | null;
  foundAt: string;
  appliedAt?: string | null;
  lastResponseAt?: string | null;
  nextAction?: string | null;
  followUpAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  company: Company;
  resumeVersion?: ResumeVersion | null;
  _count?: {
    interactions: number;
    reminders: number;
  };
};

export type InteractionType = "MESSAGE" | "EMAIL" | "INTERVIEW" | "TEST" | "FEEDBACK" | "NOTE";

export type Interaction = {
  id: string;
  type: InteractionType;
  contactName?: string | null;
  contactRole?: string | null;
  contactUrl?: string | null;
  happenedAt: string;
  description: string;
};

export type ApplicationDetail = JobApplication & {
  interactions: Interaction[];
  reminders: Array<Omit<Reminder, "application">>;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type MetricsSummary = {
  total: number;
  appliedLast7Days: number;
  responded: number;
  interviews: number;
  pendingFollowUps: number;
  responseRate: number;
  interviewRate: number;
};

export type StatusMetric = {
  status: ApplicationStatus;
  total: number;
};

export type AreaMetric = {
  area: ApplicationArea;
  total: number;
};

export type ApplicationFilters = {
  search?: string;
  status?: ApplicationStatus | "";
  area?: ApplicationArea | "";
  page?: number;
  pageSize?: number;
  sortBy?: "updatedAt" | "appliedAt" | "fitScore" | "companyName" | "title";
  sortOrder?: "asc" | "desc";
};

export type CreateApplicationPayload = {
  companyName: string;
  title: string;
  area: ApplicationArea;
  level: ApplicationLevel;
  workMode: WorkMode;
  location?: string;
  contractType: ContractType;
  sourcePlatform: SourcePlatform;
  jobUrl?: string;
  resumeVersionId?: string;
  status: ApplicationStatus;
  fitScore?: number;
  appliedAt?: string;
  nextAction?: string;
  followUpAt?: string;
  notes?: string;
};

export type UpdateApplicationPayload = Partial<CreateApplicationPayload>;

export type Reminder = {
  id: string;
  title: string;
  dueAt: string;
  done: boolean;
  application: JobApplication;
};

export type CreateInteractionPayload = {
  type: InteractionType;
  contactName?: string;
  contactRole?: string;
  contactUrl?: string;
  description: string;
};

export type CreateReminderPayload = {
  title: string;
  dueAt: string;
  done?: boolean;
};

export type CompanyPayload = {
  name: string;
  website?: string;
  sector?: string;
  location?: string;
  notes?: string;
};

export type ResumeVersionPayload = {
  name: string;
  language: ResumeVersion["language"];
  focus: ResumeVersion["focus"];
  fileUrl?: string;
  notes?: string;
};
