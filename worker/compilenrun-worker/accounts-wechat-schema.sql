-- Additive accounts v5 migration: WeChat Official Account (公众号) sign-in. Apply after the v1-v4 files.
-- Repeatable. session() joins cnr_account_wechat_identities, so apply this to BOTH databases (compilenrun-data and
-- echocool-data) before deploying a Worker that contains the WeChat code, even where WeChat stays off.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS cnr_account_wechat_identities (
  wechat_openid TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES cnr_account_users(id) ON DELETE CASCADE,
  linked_at INTEGER NOT NULL
);
-- Message push gives only the openid; nickname/unionid stay NULL unless the API is ever used. Informational only.
CREATE TABLE IF NOT EXISTS cnr_account_wechat_profiles (
  wechat_openid TEXT PRIMARY KEY REFERENCES cnr_account_wechat_identities(wechat_openid) ON DELETE CASCADE,
  unionid TEXT,
  nickname TEXT,
  updated_at INTEGER NOT NULL
);
-- Pending logins/links: the page shows `code`, the reader sends it to the account, WeChat's push confirms the row
-- with the sender's openid, and the browser holding the binding cookie consumes it once.
CREATE TABLE IF NOT EXISTS cnr_account_wechat_logins (
  code TEXT PRIMARY KEY,
  binding_hash TEXT NOT NULL,
  user_id TEXT REFERENCES cnr_account_users(id) ON DELETE CASCADE,
  session_hash TEXT,
  openid TEXT,
  confirmed_at INTEGER,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS cnr_account_wechat_logins_expiry ON cnr_account_wechat_logins(expires_at);
-- Wrong codes per openid per hour, so one WeChat account cannot guess other readers' pending codes.
CREATE TABLE IF NOT EXISTS cnr_account_wechat_attempts (
  openid TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  failures INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO cnr_account_schema_versions (version) VALUES (5);
