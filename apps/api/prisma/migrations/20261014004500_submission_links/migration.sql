-- AlterTable
ALTER TABLE "ContentSubmission" ALTER COLUMN "contentUrl" DROP NOT NULL,
ADD COLUMN     "links" JSONB;
