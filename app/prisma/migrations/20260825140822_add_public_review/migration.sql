-- CreateTable
CREATE TABLE "PublicReview" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "comment" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicReview_isApproved_createdAt_idx" ON "PublicReview"("isApproved", "createdAt");
