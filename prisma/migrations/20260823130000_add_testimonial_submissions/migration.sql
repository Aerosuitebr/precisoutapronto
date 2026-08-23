CREATE TABLE "testimonial_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "publicName" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "toolKey" TEXT NOT NULL,
    "quote" VARCHAR(800) NOT NULL,
    "consentVersion" VARCHAR(32) NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "testimonial_submissions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "testimonial_submissions_status_createdAt_idx" ON "testimonial_submissions"("status", "createdAt");
CREATE INDEX "testimonial_submissions_userId_createdAt_idx" ON "testimonial_submissions"("userId", "createdAt");
ALTER TABLE "testimonial_submissions" ADD CONSTRAINT "testimonial_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
