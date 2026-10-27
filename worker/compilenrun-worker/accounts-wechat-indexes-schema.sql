-- Additive accounts v8 migration: indexes that keep the WeChat login path off full-table scans.
-- Apply after accounts-wechat-qr-schema.sql (v6). Repeatable. Apply to BOTH databases (compilenrun-data and
-- echocool-data) before deploying a Worker that contains this code.
--
-- Background: with a 2000-ticket pool, the per-start sweep `DELETE ... WHERE expires_at <= ? OR ...` scanned the
-- whole cnr_account_wechat_qr table on every login dialog open (~2000 row reads each, >4M reads/day on echo.cool).
-- The Worker now sweeps only from /api/auth/wechat/pool, and every statement on these tables uses an index.
PRAGMA foreign_keys = ON;
-- /pool deletes expired tickets: `WHERE expires_at <= ?` (the (assigned_at, expires_at) index cannot serve it alone).
CREATE INDEX IF NOT EXISTS cnr_account_wechat_qr_expiry ON cnr_account_wechat_qr(expires_at);
-- `start` drops the browser's previous pending login and parks its ticket by binding_hash.
CREATE INDEX IF NOT EXISTS cnr_account_wechat_logins_binding ON cnr_account_wechat_logins(binding_hash);
INSERT OR IGNORE INTO cnr_account_schema_versions (version) VALUES (8);
