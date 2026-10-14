-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('NOT_DUE', 'DUE', 'PAID');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'VERIFIED');

-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "payoutMethod" TEXT,
ADD COLUMN     "payoutDetails" JSONB,
ADD COLUMN     "payoutUpdatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CampaignApplication" ADD COLUMN     "payoutAmount" DOUBLE PRECISION,
ADD COLUMN     "payoutStatus" "PayoutStatus" NOT NULL DEFAULT 'NOT_DUE',
ADD COLUMN     "payoutReference" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ContentSubmission" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "contentUrl" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "postUrl" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "ContentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentSubmission_applicationId_idx" ON "ContentSubmission"("applicationId");

-- AddForeignKey
ALTER TABLE "ContentSubmission" ADD CONSTRAINT "ContentSubmission_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "CampaignApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
