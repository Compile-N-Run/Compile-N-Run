-- Additive accounts v3 migration. Apply accounts-schema.sql and accounts-email-schema.sql first.
-- Google-reported email and name, refreshed at every Google sign-in or link.
-- Informational only: sign-in never trusts or matches on this email.
-- Rows disappear with the Google identity (unlink) or the account (delete).
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS cnr_account_google_profiles (
  google_sub TEXT PRIMARY KEY REFERENCES cnr_account_google_identities(google_sub) ON DELETE CASCADE,
  email TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0, 1)),
  name TEXT,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS cnr_account_google_profiles_email ON cnr_account_google_profiles(email);
INSERT OR IGNORE INTO cnr_account_schema_versions (version) VALUES (3);
