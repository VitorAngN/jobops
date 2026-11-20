-- AlterEnum
ALTER TYPE "ApplicationArea" ADD VALUE 'SUPPORT';

-- AlterEnum
ALTER TYPE "ResumeFocus" ADD VALUE 'SUPPORT';

-- AlterTable
ALTER TABLE "ResumeVersion" ADD COLUMN "content" TEXT;

-- AlterTable
ALTER TABLE "SearchProfile" ADD COLUMN "area" "ApplicationArea" NOT NULL DEFAULT 'BACKEND';
