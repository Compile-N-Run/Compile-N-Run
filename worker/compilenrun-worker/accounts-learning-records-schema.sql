-- Additive and repeatable. No bulk backfill: snapshots move on the next save.
-- Apply before deploying the record-based learning Worker.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS cnr_learning_state (
  user_id TEXT PRIMARY KEY REFERENCES cnr_account_users(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL CHECK (revision >= 0),
  exported_at TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  record_bytes INTEGER NOT NULL CHECK (record_bytes >= 0 AND record_bytes <= 1800000),
  record_counts TEXT NOT NULL CHECK (json_valid(record_counts)),
  write_token TEXT NOT NULL
) WITHOUT ROWID;

-- Nested note/practice data stays together: one changed lesson costs one record
-- write, instead of one write per field. The primary key serves all sync queries;
-- there are no secondary indexes to amplify writes.
CREATE TABLE IF NOT EXISTS cnr_learning_records (
  user_id TEXT NOT NULL REFERENCES cnr_learning_state(user_id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('read', 'course', 'lesson', 'draft')),
  record_key TEXT NOT NULL,
  data_json TEXT NOT NULL CHECK (json_valid(data_json)),
  PRIMARY KEY (user_id, kind, record_key)
) WITHOUT ROWID;
