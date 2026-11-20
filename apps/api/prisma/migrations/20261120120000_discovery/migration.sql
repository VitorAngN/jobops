-- CreateEnum
CREATE TYPE "DiscoverySource" AS ENUM ('GUPY', 'GREENHOUSE', 'LEVER', 'ASHBY', 'REMOTIVE');

-- CreateEnum
CREATE TYPE "DiscoveredStatus" AS ENUM ('NEW', 'APPROVED', 'DISCARDED');

-- CreateTable
CREATE TABLE "SearchProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "terms" TEXT[],
    "keywords" TEXT[],
    "excludeWords" TEXT[],
    "locations" TEXT[],
    "acceptRemote" BOOLEAN NOT NULL DEFAULT true,
    "sources" "DiscoverySource"[],
    "minScore" INTEGER NOT NULL DEFAULT 40,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchedCompany" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "source" "DiscoverySource" NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchedCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveredJob" (
    "id" TEXT NOT NULL,
    "source" "DiscoverySource" NOT NULL,
    "externalId" TEXT NOT NULL,
    "profileId" TEXT,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "workMode" "WorkMode" NOT NULL DEFAULT 'UNKNOWN',
    "level" "ApplicationLevel" NOT NULL DEFAULT 'UNKNOWN',
    "url" TEXT NOT NULL,
    "description" TEXT,
    "publishedAt" TIMESTAMP(3),
    "score" INTEGER NOT NULL DEFAULT 0,
    "scoreReasons" TEXT[],
    "status" "DiscoveredStatus" NOT NULL DEFAULT 'NEW',
    "applicationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscoveredJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryRun" (
    "id" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "found" INTEGER NOT NULL DEFAULT 0,
    "created" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT[],

    CONSTRAINT "DiscoveryRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WatchedCompany_profileId_source_slug_key" ON "WatchedCompany"("profileId", "source", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "DiscoveredJob_applicationId_key" ON "DiscoveredJob"("applicationId");

-- CreateIndex
CREATE INDEX "DiscoveredJob_status_score_idx" ON "DiscoveredJob"("status", "score");

-- CreateIndex
CREATE UNIQUE INDEX "DiscoveredJob_source_externalId_key" ON "DiscoveredJob"("source", "externalId");

-- AddForeignKey
ALTER TABLE "WatchedCompany" ADD CONSTRAINT "WatchedCompany_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "SearchProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveredJob" ADD CONSTRAINT "DiscoveredJob_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "SearchProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
