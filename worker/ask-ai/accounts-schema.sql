-- Independent, additive migration. Existing Ask AI/quiz/feedback data is untouched.
-- Apply with Wrangler 4 before enabling the OAuth credentials.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS cnr_account_users (
  id TEXT PRIMARY KEY,
  google_sub TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cnr_account_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES cnr_account_users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS cnr_account_sessions_user ON cnr_account_sessions(user_id);
CREATE INDEX IF NOT EXISTS cnr_account_sessions_expiry ON cnr_account_sessions(expires_at);

CREATE TABLE IF NOT EXISTS cnr_account_oauth_challenges (
  state_hash TEXT PRIMARY KEY,
  binding_hash TEXT NOT NULL,
  verifier TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS cnr_account_oauth_expiry ON cnr_account_oauth_challenges(expires_at);

CREATE TABLE IF NOT EXISTS cnr_account_learning (
  user_id TEXT PRIMARY KEY REFERENCES cnr_account_users(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
  data_json TEXT CHECK (data_json IS NULL OR (json_valid(data_json) AND length(CAST(data_json AS BLOB)) <= 1800000)),
  updated_at INTEGER
);
