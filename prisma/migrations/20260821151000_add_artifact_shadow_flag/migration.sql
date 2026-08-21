-- Separate canonical shadow writes from user-visible smart history. Additive only.
INSERT INTO "feature_flags" ("key", "description", "enabled", "rolloutPercent", "rules", "updatedAt")
VALUES ('artifact_shadow_write_v1', 'Canonical task and artifact shadow writer', false, 0, '{}', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
