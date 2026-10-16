-- Additive accounts v2 migration. Apply accounts-schema.sql first.
-- Existing user IDs, sessions, snapshots and votes are preserved.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS cnr_account_schema_versions (version INTEGER PRIMARY KEY);
CREATE TABLE IF NOT EXISTS cnr_account_google_identities (
  google_sub TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES cnr_account_users(id) ON DELETE CASCADE,
  linked_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS cnr_account_legacy_google_migrations (
  user_id TEXT PRIMARY KEY REFERENCES cnr_account_users(id) ON DELETE CASCADE
);
-- google_sub on users remains a deprecated NOT NULL legacy field, consulted
-- only for one-time cutover catch-up. New rows use reserved local:<UUID> values.
INSERT OR IGNORE INTO cnr_account_google_identities (google_sub, user_id, linked_at)
  SELECT google_sub, id, created_at FROM cnr_account_users
  WHERE google_sub NOT LIKE 'local:%' AND NOT EXISTS
    (SELECT 1 FROM cnr_account_schema_versions WHERE version = 2);
INSERT OR IGNORE INTO cnr_account_legacy_google_migrations (user_id)
  SELECT id FROM cnr_account_users WHERE google_sub NOT LIKE 'local:%' AND NOT EXISTS
    (SELECT 1 FROM cnr_account_schema_versions WHERE version = 2) AND EXISTS
    (SELECT 1 FROM cnr_account_google_identities g WHERE g.user_id = cnr_account_users.id AND g.google_sub = cnr_account_users.google_sub);

CREATE TABLE IF NOT EXISTS cnr_account_password_credentials (
  user_id TEXT PRIMARY KEY REFERENCES cnr_account_users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email_verified_at INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  last_action TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS cnr_account_email_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES cnr_account_users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('verify', 'reset')),
  credential_version INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS cnr_account_email_tokens_user ON cnr_account_email_tokens(user_id);
CREATE INDEX IF NOT EXISTS cnr_account_email_tokens_expiry ON cnr_account_email_tokens(expires_at);
CREATE TABLE IF NOT EXISTS cnr_account_email_throttle (
  recipient_hash TEXT NOT NULL,
  purpose TEXT NOT NULL,
  next_at INTEGER NOT NULL,
  PRIMARY KEY (recipient_hash, purpose)
);
CREATE TABLE IF NOT EXISTS cnr_account_credential_limits (
  bucket_key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);
-- A separate table keeps migration repeatable without ALTER COLUMN support.
CREATE TABLE IF NOT EXISTS cnr_account_oauth_links (
  state_hash TEXT PRIMARY KEY REFERENCES cnr_account_oauth_challenges(state_hash) ON DELETE CASCADE,
  -- Keep purpose binding even if its initiating session/account is revoked;
  -- otherwise a late linking callback could be mistaken for a normal sign-in.
  user_id TEXT NOT NULL,
  session_hash TEXT NOT NULL
);
INSERT OR IGNORE INTO cnr_account_schema_versions (version) VALUES (2);
