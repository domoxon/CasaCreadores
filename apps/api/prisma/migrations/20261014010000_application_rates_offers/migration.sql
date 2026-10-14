-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('NONE', 'PENDING', 'ACCEPTED', 'DECLINED');

-- AlterTable
ALTER TABLE "CampaignApplication" ADD COLUMN     "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "requestedRates" JSONB,
ADD COLUMN     "pitch" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "offerRates" JSONB,
ADD COLUMN     "offerNote" TEXT,
ADD COLUMN     "offerStatus" "OfferStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "offeredAt" TIMESTAMP(3),
ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "responseNote" TEXT,
ADD COLUMN     "agreedRates" JSONB;
