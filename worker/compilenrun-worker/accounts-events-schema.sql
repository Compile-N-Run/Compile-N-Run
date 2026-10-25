-- First-party behaviour events from www.compilenrun.com and moodle.compilenrun.com (src/events/routes.js).
-- Additive. Apply: npx wrangler@4 d1 execute compilenrun-data --remote --file=accounts-events-schema.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS cnr_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,                      -- server receive time, ms since epoch
  client_ts INTEGER,                        -- browser time when the event happened, ms
  site TEXT NOT NULL CHECK (site IN ('www', 'moodle')),
  -- Account id when the visitor was signed in (site session cookie, or a Moodle page token resolved to an account).
  -- SET NULL keeps the aggregate history when an account is deleted but removes the identity.
  user_id TEXT REFERENCES cnr_account_users(id) ON DELETE SET NULL,
  visitor_id TEXT NOT NULL,                 -- random id in the browser's localStorage, shared by both sites
  session_id TEXT,                          -- random id per browser session (sessionStorage)
  name TEXT NOT NULL,                       -- page_view, page_engaged, lesson_read, run_code, ...
  path TEXT NOT NULL,
  props TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(props)),
  referrer TEXT,
  country TEXT,
  ua TEXT
);
CREATE INDEX IF NOT EXISTS cnr_events_user_ts ON cnr_events(user_id, ts);
CREATE INDEX IF NOT EXISTS cnr_events_visitor_ts ON cnr_events(visitor_id, ts);
CREATE INDEX IF NOT EXISTS cnr_events_name_ts ON cnr_events(name, ts);
CREATE INDEX IF NOT EXISTS cnr_events_ts ON cnr_events(ts);
