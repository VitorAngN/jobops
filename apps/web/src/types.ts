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
};

export type ResumeVersion = {
  id: string;
  name: string;
  language: "PT_BR" | "EN" | "ES";
  focus: "BACKEND" | "DEVOPS" | "CLOUD" | "FULLSTACK" | "GENERAL";
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

export type MetricsSummary = {
  total: number;
  appliedLast7Days: number;
  responded: number;
  interviews: number;
  pendingFollowUps: number;
  responseRate: number;
  interviewRate: number;
};

export type ApplicationFilters = {
  search?: string;
  status?: ApplicationStatus | "";
  area?: ApplicationArea | "";
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
  status: ApplicationStatus;
  fitScore?: number;
  appliedAt?: string;
  nextAction?: string;
  followUpAt?: string;
  notes?: string;
};
