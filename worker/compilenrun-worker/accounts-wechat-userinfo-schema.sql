-- Additive accounts v7 migration: WeChat nickname and avatar from 网页授权 (snsapi_userinfo).
-- Apply after accounts-wechat-qr-schema.sql (v6). Repeatable. Apply to BOTH databases (compilenrun-data and
-- echocool-data) before deploying a Worker that contains this code: session() joins this table.
--
-- Message push never carries a nickname. After signing in, the reader taps a link in the account's reply
-- (GET /api/auth/wechat/profile), authorizes snsapi_userinfo inside WeChat, and the callback stores what
-- sns/userinfo returns here and copies the nickname to cnr_account_users.display_name. Informational only.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS cnr_account_wechat_userinfo (
  wechat_openid TEXT PRIMARY KEY REFERENCES cnr_account_wechat_identities(wechat_openid) ON DELETE CASCADE,
  nickname TEXT,
  avatar_url TEXT,
  unionid TEXT,
  updated_at INTEGER NOT NULL
);
INSERT OR IGNORE INTO cnr_account_schema_versions (version) VALUES (7);
