-- Additive accounts v4 migration: GitHub sign-in. Apply once, after the v1-v3 files.
-- (ALTER TABLE ADD COLUMN is not repeatable; a second run fails harmlessly on that statement.)
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS cnr_account_github_identities (
  github_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES cnr_account_users(id) ON DELETE CASCADE,
  linked_at INTEGER NOT NULL
);
-- What GitHub reports for the identity, refreshed at every GitHub sign-in or link. Informational only.
CREATE TABLE IF NOT EXISTS cnr_account_github_profiles (
  github_id TEXT PRIMARY KEY REFERENCES cnr_account_github_identities(github_id) ON DELETE CASCADE,
  login TEXT,
  email TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0, 1)),
  name TEXT,
  updated_at INTEGER NOT NULL
);
-- A challenge is bound to the provider that issued it, so a state cannot be replayed to another callback.
ALTER TABLE cnr_account_oauth_challenges ADD COLUMN provider TEXT NOT NULL DEFAULT 'google';
INSERT OR IGNORE INTO cnr_account_schema_versions (version) VALUES (4);
