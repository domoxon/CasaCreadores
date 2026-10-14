-- CreateEnum
CREATE TYPE "ApplicationReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "CreatorApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contact" TEXT NOT NULL,
    "platforms" JSONB NOT NULL,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "nichos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contentTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "payoutMethod" TEXT NOT NULL,
    "bestPosts" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "referredBy" TEXT,
    "status" "ApplicationReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewToken" TEXT NOT NULL,
    "inviteToken" TEXT,
    "inviteExpiresAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreatorApplication_reviewToken_key" ON "CreatorApplication"("reviewToken");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorApplication_inviteToken_key" ON "CreatorApplication"("inviteToken");

-- CreateIndex
CREATE INDEX "CreatorApplication_email_idx" ON "CreatorApplication"("email");
