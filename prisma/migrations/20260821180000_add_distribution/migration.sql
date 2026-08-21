-- V007: canonical distribution foundation. Additive only; tokens are never stored in plaintext.
CREATE TABLE "share_links" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "artifactId" UUID NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "channel" VARCHAR(32) NOT NULL,
    "createdByUserId" TEXT,
    "campaign" VARCHAR(80),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "share_links_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "share_links_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "artifacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "share_links_channel_check" CHECK ("channel" IN ('link', 'whatsapp', 'email', 'social', 'other'))
);

CREATE TABLE "share_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shareLinkId" UUID NOT NULL,
    "eventType" VARCHAR(40) NOT NULL,
    "anonymousRecipientId" VARCHAR(80) NOT NULL,
    "userId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    CONSTRAINT "share_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "share_events_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "share_links"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "share_events_eventType_check" CHECK ("eventType" IN ('opened', 'recipient_action', 'template_forked', 'recipient_activated'))
);

CREATE UNIQUE INDEX "share_links_tokenHash_key" ON "share_links"("tokenHash");
CREATE INDEX "share_links_artifactId_createdAt_idx" ON "share_links"("artifactId", "createdAt");
CREATE INDEX "share_links_createdByUserId_createdAt_idx" ON "share_links"("createdByUserId", "createdAt");
CREATE INDEX "share_links_expiresAt_idx" ON "share_links"("expiresAt");
CREATE INDEX "share_events_shareLinkId_occurredAt_idx" ON "share_events"("shareLinkId", "occurredAt");
CREATE INDEX "share_events_eventType_occurredAt_idx" ON "share_events"("eventType", "occurredAt");
