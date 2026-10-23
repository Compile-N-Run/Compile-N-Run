-- Additive accounts v6 migration: WeChat scan-to-sign-in from a pool of temporary parametric QR tickets.
-- Apply after accounts-wechat-schema.sql (v5). Repeatable. Apply to BOTH databases (compilenrun-data and
-- echocool-data) before deploying a Worker that contains this code, like v5.
--
-- tools/wechat_qr_pool.py (on a server with a whitelisted IP) creates tickets with scene_str = `scene` and uploads
-- them to POST /api/auth/wechat/pool. `start` assigns one unassigned ticket to the new pending login; the reader
-- scans it, WeChat pushes subscribe/SCAN with the scene, and the push confirms that login. A ticket is single-use:
-- the row is removed with its login (ON DELETE CASCADE when the login is consumed, expires or is dropped).
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS cnr_account_wechat_qr (
  scene TEXT PRIMARY KEY,
  ticket TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  login_code TEXT REFERENCES cnr_account_wechat_logins(code) ON DELETE CASCADE,
  assigned_at INTEGER
);
-- `start` picks WHERE assigned_at IS NULL AND expires_at > ? ORDER BY expires_at.
CREATE INDEX IF NOT EXISTS cnr_account_wechat_qr_free ON cnr_account_wechat_qr(assigned_at, expires_at);
-- The cascade from cnr_account_wechat_logins looks rows up by login_code.
CREATE INDEX IF NOT EXISTS cnr_account_wechat_qr_login ON cnr_account_wechat_qr(login_code);
INSERT OR IGNORE INTO cnr_account_schema_versions (version) VALUES (6);
