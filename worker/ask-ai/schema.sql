-- "Was this page helpful?" votes. One row per page and reader (voter = salted hash of the IP), so a
-- reader who changes their mind updates their vote instead of adding one.
-- Apply: npx wrangler d1 execute compilenrun-feedback --remote --file schema.sql
CREATE TABLE IF NOT EXISTS votes (
  path TEXT NOT NULL,
  voter TEXT NOT NULL,
  vote INTEGER NOT NULL CHECK (vote IN (-1, 1)),
  comment TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (path, voter)
);
CREATE INDEX IF NOT EXISTS votes_updated ON votes (updated_at);
