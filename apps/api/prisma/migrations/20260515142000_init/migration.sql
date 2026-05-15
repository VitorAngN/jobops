-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ApplicationArea" AS ENUM ('BACKEND', 'DEVOPS', 'CLOUD', 'FULLSTACK', 'FRONTEND', 'DATA', 'SECURITY', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationLevel" AS ENUM ('INTERNSHIP', 'TRAINEE', 'JUNIOR', 'MID', 'SENIOR', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('INTERNSHIP', 'CLT', 'PJ', 'TEMPORARY', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SourcePlatform" AS ENUM ('LINKEDIN', 'GUPY', 'COMPANY_SITE', 'INDEED', 'GLASSDOOR', 'GREENHOUSE', 'LEVER', 'ASHBY', 'REFERRAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SAVED', 'APPLIED', 'RECRUITER_CONTACTED', 'IN_REVIEW', 'TEST_SENT', 'HR_INTERVIEW', 'TECH_INTERVIEW', 'WAITING_RESPONSE', 'REJECTED', 'GHOSTED', 'OFFER', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ResumeLanguage" AS ENUM ('PT_BR', 'EN', 'ES');

-- CreateEnum
CREATE TYPE "ResumeFocus" AS ENUM ('BACKEND', 'DEVOPS', 'CLOUD', 'FULLSTACK', 'GENERAL');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('MESSAGE', 'EMAIL', 'INTERVIEW', 'TEST', 'FEEDBACK', 'NOTE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "sector" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeVersion" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "language" "ResumeLanguage" NOT NULL DEFAULT 'PT_BR',
    "focus" "ResumeFocus" NOT NULL DEFAULT 'GENERAL',
    "fileUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT NOT NULL,
    "resumeVersionId" TEXT,
    "title" TEXT NOT NULL,
    "area" "ApplicationArea" NOT NULL DEFAULT 'BACKEND',
    "level" "ApplicationLevel" NOT NULL DEFAULT 'INTERNSHIP',
    "workMode" "WorkMode" NOT NULL DEFAULT 'REMOTE',
    "location" TEXT,
    "contractType" "ContractType" NOT NULL DEFAULT 'UNKNOWN',
    "sourcePlatform" "SourcePlatform" NOT NULL DEFAULT 'LINKEDIN',
    "jobUrl" TEXT,
    "description" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SAVED',
    "fitScore" INTEGER,
    "foundAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),
    "lastResponseAt" TIMESTAMP(3),
    "nextAction" TEXT,
    "followUpAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL DEFAULT 'NOTE',
    "contactName" TEXT,
    "contactRole" TEXT,
    "contactUrl" TEXT,
    "happenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");

-- CreateIndex
CREATE INDEX "JobApplication_area_idx" ON "JobApplication"("area");

-- CreateIndex
CREATE INDEX "JobApplication_sourcePlatform_idx" ON "JobApplication"("sourcePlatform");

-- CreateIndex
CREATE INDEX "JobApplication_appliedAt_idx" ON "JobApplication"("appliedAt");

-- AddForeignKey
ALTER TABLE "ResumeVersion" ADD CONSTRAINT "ResumeVersion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "ResumeVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
