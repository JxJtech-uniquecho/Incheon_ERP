-- CreateTable
CREATE TABLE "DashboardAiSummary" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "model" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "rawText" TEXT NOT NULL,
    "sourceSnapshot" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "errorMessage" TEXT,
    "generatedById" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardAiSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DashboardAiSummary_period_startDate_endDate_payloadHash_idx" ON "DashboardAiSummary"("period", "startDate", "endDate", "payloadHash");

-- CreateIndex
CREATE INDEX "DashboardAiSummary_generatedAt_idx" ON "DashboardAiSummary"("generatedAt");

-- AddForeignKey
ALTER TABLE "DashboardAiSummary" ADD CONSTRAINT "DashboardAiSummary_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
