-- Sister-site single sign-on (Moodle): short-lived authorization codes and access tokens issued by src/auth/sso.js.
-- Apply once: npx wrangler@4 d1 execute compilenrun-data --remote --file accounts-sso-schema.sql
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS cnr_account_sso_grants (
  token_hash TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('code', 'token')),
  user_id TEXT NOT NULL REFERENCES cnr_account_users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  redirect_uri TEXT NOT NULL DEFAULT '',
  scope TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS cnr_account_sso_grants_expiry ON cnr_account_sso_grants(expires_at);
CREATE INDEX IF NOT EXISTS cnr_account_sso_grants_user ON cnr_account_sso_grants(user_id);
